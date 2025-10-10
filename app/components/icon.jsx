import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useContext, useEffect, useRef, useState } from "react";
import { Animated, Easing, Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ShaderBackground from "./backgroundShader";
import { BackgroundShaderContext } from "./backgroundShaderContext";
import PreGameMenuHeader from "./preGameMenuHeader";

// Path till ikonerna
const ICON_IMAGES = [
    require("../../assets/images/greenIcon.png"),
    require("../../assets/images/redIcon.png"),
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

    // Renderar ikonval för en spelare
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
                        <PlaceholderIcon selected={selected} style={{ justifyContent: "center", alignItems: "center" }}>
                            <Text style={{ fontSize: 32 }}>📷</Text>
                        </PlaceholderIcon>
                    )}
                </TouchableOpacity>
            );
        }

        const selected = player === 1 ? selected1 === idx : selected2 === idx;
        return (
            <TouchableOpacity
                key={idx}
                onPress={() => player === 1 ? setSelected1(idx) : setSelected2(idx)}
                style={styles.iconWrapper}
            >
                <PlaceholderIcon selected={selected}>
                    <Image
                        source={ICON_IMAGES[(idx - 1) % ICON_IMAGES.length]}
                        style={{ width: "100%", height: "100%", borderRadius: 50 }}
                    />
                </PlaceholderIcon>
            </TouchableOpacity>
        );
    };

    // Spara path/uri till ikonerna som valts
    const getPlayerIcon = (selected, customImage) => {
        if (selected === 0 && customImage) {
            return customImage; // URI till selfie
        }
        if (selected !== null && selected > 0) {
            return ICON_IMAGES[(selected - 1) % ICON_IMAGES.length]; // require-path till bild
        }
        return null;
    };

    return (
        <View style={styles.container}>
            {/* Web-only shader */}
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
            {/* Header at the top */}
            <PreGameMenuHeader
                title="Icon Select"
                onBack={() => {
                    setDividerPos(1.1);
                    router.push("../components/main");
                }}
                onProceed={() => router.push({
                    pathname: "../components/matchSettings",
                    params: {
                        from: "icon",
                        nrOfPlayers: 2,
                        icon1: getPlayerIcon(selected1, customImage1),
                        icon2: getPlayerIcon(selected2, customImage2),
                    }
                })}
                canProceed={selected1 !== null && selected2 !== null}
            />

            {/* Main content: two halves side by side */}
            <View style={styles.mainRow}>
                {/* Player 1 Half */}
                <View style={styles.half}>
                    <View style={styles.headerRow}>
                        <Text style={styles.header}>Player 1</Text>
                        {selected1 !== null && (
                            <PlaceholderIcon selected style={styles.previewIcon}>
                                {selected1 === 0 && customImage1 ? (
                                    <Image
                                        source={{ uri: customImage1 }}
                                        style={{ width: "100%", height: "100%", borderRadius: 50 }}
                                    />
                                ) : selected1 > 0 ? (
                                    <Image
                                        source={ICON_IMAGES[(selected1 - 1) % ICON_IMAGES.length]}
                                        style={{ width: "100%", height: "100%", borderRadius: 50 }}
                                    />
                                ) : null}
                            </PlaceholderIcon>
                        )}
                    </View>

                    <View style={{ flex: 1 }}>
                        <ScrollView
                            ref={scrollRef1}
                            contentContainerStyle={styles.iconList}
                            showsVerticalScrollIndicator={false}
                        >
                            {[0, 1, 2].map((idx) => renderIcon(idx, 1))}
                        </ScrollView>
                        <LinearGradient
                            colors={["transparent", "#20163B"]}
                            style={styles.scrollFadeBottom}
                            pointerEvents="none"
                        />
                    </View>
                </View>

                {/* Divider */}
                <View style={styles.divider} />

                {/* Player 2 Half */}
                <View style={styles.half}>
                    <View style={styles.headerRow}>
                        <Text style={styles.header}>Player 2</Text>
                        {selected2 !== null && (
                            <PlaceholderIcon selected style={styles.previewIcon}>
                                {selected2 === 0 && customImage2 ? (
                                    <Image
                                        source={{ uri: customImage2 }}
                                        style={{ width: "100%", height: "100%", borderRadius: 50 }}
                                    />
                                ) : selected2 > 0 ? (
                                    <Image
                                        source={ICON_IMAGES[(selected2 - 1) % ICON_IMAGES.length]}
                                        style={{ width: "100%", height: "100%", borderRadius: 50 }}
                                    />
                                ) : null}
                            </PlaceholderIcon>
                        )}
                    </View>

                    <View style={{ flex: 1 }}>
                        <ScrollView
                            ref={scrollRef2}
                            contentContainerStyle={styles.iconList}
                            showsVerticalScrollIndicator={false}
                        >
                            {[0, 1, 2].map((idx) => renderIcon(idx, 2))}
                        </ScrollView>
                        <LinearGradient
                            colors={["transparent", "#283059"]}
                            style={styles.scrollFadeBottom}
                            pointerEvents="none"
                        />
                    </View>
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
        backgroundColor: "transparent"
    },
    container: {
        flex: 1,
        height: "100%",
        position: "relative",
    },
    settingsButton: {
        position: "absolute",
        top: 30,
        right: 20,
        zIndex: 10,
        backgroundColor: "#5C66C5",
        borderRadius: 20,
        padding: 4,
        elevation: 2,
    },
    settingsText: {
        fontSize: 24,
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
        borderRadius: 32,
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
        width: 90,
        height: 90,
        borderRadius: 50,
        backgroundColor: "#bbb",
        borderWidth: 2,
        borderColor: "transparent",
    },
    selectedIcon: {
        shadowColor: "#FFFFFF",
        shadowOpacity: 0.5,
        shadowRadius: 8,
        elevation: 10,
        borderWidth: 3,
        borderColor: "white",
    },
    backButton: {
        position: "absolute",
        top: 20,
        left: 20,
        zIndex: 10,
        padding: 8,
    },
    backArrow: {
        color: "white",
        fontSize: 28,
    },
});