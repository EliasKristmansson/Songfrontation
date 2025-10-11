import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useContext, useEffect, useRef, useState } from "react";
import {
    Animated,
    Easing,
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import ShaderBackground from "./backgroundShader";
import { BackgroundShaderContext } from "./backgroundShaderContext";
import PreGameMenuHeader from "./preGameMenuHeader";

const ICONS = [
    "face-man",
    "face-woman",
    "alien",
    "robot",
    "dog",
    "cat",
    "panda",
    "unicorn-variant",
    "ninja",
    "ghost",
    "emoticon-cool",
    "account-cowboy-hat",
    "pirate",
    "android",
    "emoticon-devil",
];

// unique colors for each icon
const ICON_COLORS = [
    "#FF8C00", // orange
    "#FF69B4", // pink
    "#00CED1", // turquoise
    "#7FFF00", // green-yellow
    "#FFD700", // gold
    "#ADFF2F", // light green
    "#00BFFF", // deep sky blue
    "#9370DB", // purple
    "#FF6347", // tomato
    "#00FA9A", // medium spring green
    "#FF4500", // orange-red
    "#DA70D6", // orchid
    "#40E0D0", // turquoise
    "#FF1493", // deep pink
    "#87CEEB", // sky blue
];

function PlaceholderIcon({ selected, style, children }) {
    return (
        <View
            style={[
                styles.icon,
                selected && styles.selectedIcon,
                style,
            ]}
        >
            {children}
        </View>
    );
}

export default function Icon() {
    const router = useRouter();
    const [selected1, setSelected1] = useState(null);
    const [selected2, setSelected2] = useState(null);
    const [customImage1, setCustomImage1] = useState(null);
    const [customImage2, setCustomImage2] = useState(null);
    const { dividerPos, setDividerPos } = useContext(BackgroundShaderContext);
    const scrollY1 = useRef(new Animated.Value(0)).current;
    const scrollY2 = useRef(new Animated.Value(0)).current;
    const scrollRef1 = useRef(null);
    const scrollRef2 = useRef(null);

    const takeSelfie = async (player) => {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        if (!permissionResult.granted) {
            alert("Camera permission is required!");
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });

        if (!result.canceled) {
            if (player === 1) {
                setCustomImage1(result.assets[0].uri);
                setSelected1(0);
            } else {
                setCustomImage2(result.assets[0].uri);
                setSelected2(0);
            }
        }
    };

    useEffect(() => {
        const bounce = (ref, animatedVal) => {
            Animated.sequence([
                Animated.timing(animatedVal, {
                    toValue: 10,
                    duration: 100,
                    useNativeDriver: false,
                    easing: Easing.out(Easing.quad),
                }),
                Animated.spring(animatedVal, {
                    toValue: 0,
                    friction: 10,
                    tension: 40,
                    useNativeDriver: false,
                }),
            ]).start();

            animatedVal.addListener(({ value }) => {
                ref.current?.scrollTo({ y: value, animated: false });
            });
        };

        setTimeout(() => {
            bounce(scrollRef1, scrollY1);
            bounce(scrollRef2, scrollY2);
        }, 400);

        return () => {
            scrollY1.removeAllListeners();
            scrollY2.removeAllListeners();
        };
    }, []);

    const renderIcon = (idx, player) => {
        if (idx === 0) {
            const customImage = player === 1 ? customImage1 : customImage2;
            const selected = player === 1 ? selected1 === 0 : selected2 === 0;

            return (
                <TouchableOpacity
                    key={0}
                    onPress={() => takeSelfie(player)}
                    style={styles.iconWrapper}
                >
                    {customImage ? (
                        <Image
                            source={{ uri: customImage }}
                            style={[styles.icon, styles.selectedIcon]}
                        />
                    ) : (
                        <PlaceholderIcon selected={selected}>
                            <MaterialCommunityIcons
                                name="camera"
                                size={50}
                                color="#FFB347"
                            />
                        </PlaceholderIcon>
                    )}
                </TouchableOpacity>
            );
        }

        const selected = player === 1 ? selected1 === idx : selected2 === idx;
        const iconName = ICONS[(idx - 1) % ICONS.length];
        const iconColor = ICON_COLORS[(idx - 1) % ICON_COLORS.length];

        return (
            <TouchableOpacity
                key={idx}
                onPress={() =>
                    player === 1 ? setSelected1(idx) : setSelected2(idx)
                }
                style={styles.iconWrapper}
            >
                <PlaceholderIcon selected={selected}>
                    <MaterialCommunityIcons
                        name={iconName}
                        size={55}
                        color={iconColor}
                    />
                </PlaceholderIcon>
            </TouchableOpacity>
        );
    };

    const getPlayerIcon = (selected, customImage) => {
        if (selected === 0 && customImage) {
            return { type: "image", uri: customImage };
        }
        if (selected !== null && selected > 0) {
            const iconName = ICONS[(selected - 1) % ICONS.length];
            const iconColor = ICON_COLORS[(selected - 1) % ICON_COLORS.length]; // new
            return { type: "icon", name: iconName, color: iconColor }; // include color
        }
        return null;
    };


    return (
        <View style={styles.container}>
            {Platform.OS === "web" && (
                <ShaderBackground
                    color1={[0.255, 0.184, 0.494]}
                    color2={[0.455, 0.294, 0.549]}
                    color3={[0.718, 0.459, 0.525]}
                    color4={[0.455, 0.294, 0.549]}
                    speed={0.2}
                    scale={3.0}
                    dividerPos={0.5}
                    style={styles.webShader}
                />
            )}

            <PreGameMenuHeader
                title="Icon Select"
                onBack={() => {
                    setDividerPos(1.1);
                    router.push("../components/main");
                }}
                onProceed={() =>
                    router.push({
                        pathname: "../components/matchSettings",
                        params: {
                            from: "icon",
                            nrOfPlayers: 2,
                            icon1: getPlayerIcon(selected1, customImage1),
                            icon2: getPlayerIcon(selected2, customImage2),
                        },
                    })
                }
                canProceed={selected1 !== null && selected2 !== null}
            />

            <View style={styles.mainRow}>
                {/* Player 1 */}
                <View style={styles.half}>
                    <View style={styles.headerRow}>
                        <Text style={styles.header}>Player 1</Text>
                        {selected1 !== null && (
                            <PlaceholderIcon selected style={styles.previewIcon}>
                                {selected1 === 0 && customImage1 ? (
                                    <Image
                                        source={{ uri: customImage1 }}
                                        style={styles.imagePreview}
                                    />
                                ) : selected1 > 0 ? (
                                    <MaterialCommunityIcons
                                        name={ICONS[(selected1 - 1) % ICONS.length]}
                                        size={32}
                                        color={ICON_COLORS[(selected1 - 1) % ICON_COLORS.length]} // ✅ use the actual color
                                    />
                                ) : null}
                            </PlaceholderIcon>
                        )}
                    </View>

                    <ScrollView
                        ref={scrollRef1}
                        contentContainerStyle={styles.iconList}
                        showsVerticalScrollIndicator={false}
                    >
                        {[0, ...ICONS.map((_, i) => i + 1)].map((idx) =>
                            renderIcon(idx, 1)
                        )}
                    </ScrollView>
                    <LinearGradient
                        colors={["transparent", "#20163B"]}
                        style={styles.scrollFadeBottom}
                        pointerEvents="none"
                    />
                </View>

                <View style={styles.divider} />

                {/* Player 2 */}
                <View style={styles.half}>
                    <View style={styles.headerRow}>
                        <Text style={styles.header}>Player 2</Text>
                        {selected2 !== null && (
                            <PlaceholderIcon selected style={styles.previewIcon}>
                                {selected2 === 0 && customImage2 ? (
                                    <Image
                                        source={{ uri: customImage2 }}
                                        style={styles.imagePreview}
                                    />
                                ) : selected2 > 0 ? (
                                    <MaterialCommunityIcons
                                        name={ICONS[(selected2 - 1) % ICONS.length]}
                                        size={32}
                                        color={ICON_COLORS[(selected2 - 1) % ICON_COLORS.length]} // ✅ use the actual color
                                    />
                                ) : null}
                            </PlaceholderIcon>
                        )}
                    </View>

                    <ScrollView
                        ref={scrollRef2}
                        contentContainerStyle={styles.iconList}
                        showsVerticalScrollIndicator={false}
                    >
                        {[0, ...ICONS.map((_, i) => i + 1)].map((idx) =>
                            renderIcon(idx, 2)
                        )}
                    </ScrollView>
                    <LinearGradient
                        colors={["transparent", "#283059"]}
                        style={styles.scrollFadeBottom}
                        pointerEvents="none"
                    />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    mainRow: {
        flex: 1,
        flexDirection: "row",
    },
    webShader: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 0,
        position: "absolute",
        backgroundColor: "transparent",
    },
    container: {
        flex: 1,
        height: "100%",
        position: "relative",
    },
    half: {
        flex: 1,
    },
    divider: {
        width: 2,
        backgroundColor: "#ccc",
        height: "100%",
    },
    scrollFadeBottom: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 30,
        zIndex: 5,
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 10,
        gap: 8,
    },
    header: {
        fontSize: 36,
        fontWeight: "bold",
        textAlign: "center",
        color: "white",
        fontFamily: "OutfitBold",
    },
    previewIcon: {
        marginLeft: 8,
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 2,
        borderColor: "white",
        alignItems: "center",
        justifyContent: "center",
    },
    iconList: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "center",
    },
    iconWrapper: {
        width: "25%",
        aspectRatio: 1,
        margin: "1%",
        alignItems: "center",
        justifyContent: "center",
    },
    icon: {
        width: 80,
        height: 80,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: "transparent",
        alignItems: "center",
        justifyContent: "center",
    },
    selectedIcon: {
        shadowColor: "#FFFFFF",
        shadowOpacity: 0.5,
        shadowRadius: 8,
        elevation: 10,
        borderWidth: 3,
        borderColor: "white",
    },
    imagePreview: {
        width: "100%",
        height: "100%",
        borderRadius: 50,
    },
});
