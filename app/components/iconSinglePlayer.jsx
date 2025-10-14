import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    Animated,
    Easing,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
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

const ICON_COLORS = [
    "#FF8C00",
    "#FF69B4",
    "#00CED1",
    "#7FFF00",
    "#FFD700",
    "#ADFF2F",
    "#00BFFF",
    "#9370DB",
    "#FF6347",
    "#00FA9A",
    "#FF4500",
    "#DA70D6",
    "#40E0D0",
    "#FF1493",
    "#87CEEB",
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

export default function IconSinglePlayer({ nrOfPlayers }) {
    const router = useRouter();
    const [selected, setSelected] = useState(null);
    const [customImage, setCustomImage] = useState(null);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scrollY = useRef(new Animated.Value(0)).current;
    const scrollRef = useRef(null);

    const fadeContent = (callback, newOpacity) => {
        Animated.timing(fadeAnim, {
            toValue: newOpacity,
            duration: 300,
            useNativeDriver: true,
        }).start(() => callback?.());
    };

    useEffect(() => {
        fadeContent(null, 1);
    }, []);

    const takeSelfie = async () => {
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
            setCustomImage(result.assets[0].uri);
            setSelected(0);
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
            bounce(scrollRef, scrollY);
        }, 400);

        return () => {
            scrollY.removeAllListeners();
        };
    }, []);

    const renderIcon = (idx) => {
        if (idx === 0) {
            const selectedCamera = selected === 0;
            return (
                <TouchableOpacity key={0} onPress={takeSelfie} style={styles.iconWrapper}>
                    {customImage ? (
                        <Image source={{ uri: customImage }} style={[styles.icon, styles.selectedIcon]} />
                    ) : (
                        <View style={styles.cameraContainer}>
                            <LinearGradient
                                colors={["#5663C4", "#412F7E"]}
                                style={[styles.icon, { borderWidth: 3, borderColor: "white", alignItems: "center", justifyContent: "center", borderRadius: 50 }]}
                            >
                                <MaterialCommunityIcons name="camera" size={50} color="white" />
                            </LinearGradient>
                        </View>
                    )}
                </TouchableOpacity>
            );
        }

        const isSelected = selected === idx;
        const iconName = ICONS[(idx - 1) % ICONS.length];
        const iconColor = ICON_COLORS[(idx - 1) % ICON_COLORS.length];

        return (
            <TouchableOpacity
                key={idx}
                onPress={() => setSelected(idx)}
                style={styles.iconWrapper}
            >
                <PlaceholderIcon selected={isSelected}>
                    <MaterialCommunityIcons name={iconName} size={55} color={iconColor} />
                </PlaceholderIcon>
            </TouchableOpacity>
        );
    };

    const getPlayerIcon = () => {
        if (selected === 0 && customImage) {
            return { type: "image", uri: customImage };
        }
        if (selected !== null && selected > 0) {
            const iconName = ICONS[(selected - 1) % ICONS.length];
            const iconColor = ICON_COLORS[(selected - 1) % ICON_COLORS.length];
            return { type: "icon", name: iconName, color: iconColor };
        }
        return null;
    };

    return (
        <View style={styles.container}>
            <Animated.View style={{ flex: 1, width: "100%", opacity: fadeAnim }}>
                <PreGameMenuHeader
                    title="Icon Select"
                    onBack={() => router.push("../components/main")}
                    onProceed={() =>
                        router.push({
                            pathname: "../components/matchSettings",
                            params: {
                                from: "iconSinglePlayer",
                                nrOfPlayers: 1,
                                icon: getPlayerIcon(),
                            },
                        })

                        
                    }
                    canProceed={selected !== null}
                />

                <View style={styles.mainRow}>
                    <View style={styles.half}>
                        <Text style={styles.header}>Your Icon</Text>
                        <ScrollView
                            ref={scrollRef}
                            contentContainerStyle={styles.iconList}
                            showsVerticalScrollIndicator={false}
                        >
                            {[0, ...ICONS.map((_, i) => i + 1)].map((idx) => renderIcon(idx))}
                        </ScrollView>
                        <LinearGradient
                            colors={["transparent", "#20163B"]}
                            style={styles.scrollFadeBottom}
                            pointerEvents="none"
                        />
                    </View>
                </View>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "transparent" },
    mainRow: { flex: 1, flexDirection: "row" },
    half: { flex: 1 },
    header: {
        fontSize: 32,
        fontWeight: "bold",
        textAlign: "center",
        color: "white",
        fontFamily: "OutfitBold",
        marginVertical: 10,
    },
    scrollFadeBottom: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 30,
        zIndex: 5,
    },
    iconList: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "center",
        paddingBottom: 40,
    },
    iconWrapper: {
        width: "15%",
        aspectRatio: 1,
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
    cameraContainer: {
        alignItems: "center",
    },
    cameraGradient: {
        width: 80,
        height: 80,
        borderRadius: 50,
        alignItems: "center",
        justifyContent: "center",
    },
    cameraLabel: {
        color: "#fff",
        fontSize: 14,
        marginTop: 5,
        fontWeight: "600",
        textShadowColor: "rgba(0,0,0,0.4)",
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
});
