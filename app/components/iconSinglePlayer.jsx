import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useContext, useState, useRef, useEffect } from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import PreGameMenuHeader from "./preGameMenuHeader";
import { LinearGradient } from "expo-linear-gradient";
import { Animated, Easing } from "react-native";

const ICONS = Array.from({ length: 20 }, (_, i) => i + 1);

// Array of 20 pastel colors
const PASTEL_COLORS = [
    "#FFD1DC", "#B5EAD7", "#FFDAC1", "#C7CEEA", "#E2F0CB",
    "#FFB7B2", "#B5EAD7", "#FF9AA2", "#C7CEEA", "#E2F0CB",
    "#FFB347", "#B0E0E6", "#F3E5AB", "#D4A5A5", "#B2F9FC",
    "#E0BBE4", "#FFDFD3", "#C2F784", "#F1CBFF", "#A0CED9"
];

function PlaceholderIcon({ selected, style, color, children }) {
    return (
        <View
            style={[
                styles.icon,
                { backgroundColor: color },
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
    const [customImage1, setCustomImage1] = useState(null);
    const scrollY1 = useRef(new Animated.Value(0)).current;
    const scrollY2 = useRef(new Animated.Value(0)).current;
    const scrollRef1 = useRef(null);
    const scrollRef2 = useRef(null);

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
            setCustomImage1(result.assets[0].uri);
            setSelected1(0);
        }
    };

    useEffect(() => {
        const bounce = (ref, animatedVal) => {
            Animated.sequence([
                Animated.timing(animatedVal, {
                    toValue: 10,
                    duration: 100,
                    useNativeDriver: false,
                    easing: Easing.out(Easing.quad), // ease out on the way down
                }),
                Animated.spring(animatedVal, {
                    toValue: 0,
                    friction: 10,   // lower = bouncier
                    tension: 40,   // higher = snappier
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

    const renderIcon = (idx) => {
        if (idx === 0) {
            return (
                <TouchableOpacity
                    key={0}
                    onPress={takeSelfie}
                    style={styles.iconWrapper}
                >
                    {customImage1 ? (
                        <Image
                            source={{ uri: customImage1 }}
                            style={[styles.icon, styles.selectedIcon]}
                        />
                    ) : (
                        <PlaceholderIcon selected={selected1 === 0} color="#fff" style={{ justifyContent: "center", alignItems: "center" }}>
                            <Text style={{ fontSize: 32 }}>📷</Text>
                        </PlaceholderIcon>
                    )}
                </TouchableOpacity>
            );
        }

        return (
            <TouchableOpacity
                key={idx}
                onPress={() => setSelected1(idx)}
                style={styles.iconWrapper}
            >
                <PlaceholderIcon
                    selected={selected1 === idx}
                    color={PASTEL_COLORS[idx % PASTEL_COLORS.length]}
                />
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>

            {/* Header at the top */}
            <PreGameMenuHeader
                title="Icon Select"
                onBack={() => router.push("../components/main")}
                onProceed={() => router.push({ pathname: "../components/matchSettings", params: { from: "iconSinglePlayer", nrOfPlayers: 1 } })}
                canProceed={selected1 !== null}
            />

            {/* Player 1 Half */}
            <View style={styles.half}>
                <View style={styles.headerRow}>
                    <Text style={styles.header}>Player 1</Text>
                    {selected1 !== null && (
                        <PlaceholderIcon
                            selected
                            style={styles.previewIcon}
                            color={selected1 === 0 && customImage1 ? "#fff" : PASTEL_COLORS[selected1 % PASTEL_COLORS.length]}
                        >
                            {selected1 === 0 && customImage1 && (
                                <Image
                                    source={{ uri: customImage1 }}
                                    style={{ width: "100%", height: "100%", borderRadius: 50 }}
                                />
                            )}
                        </PlaceholderIcon>
                    )}
                </View>
                <View style={{ flex: 1 }}>
                    <ScrollView
                        ref={scrollRef1}
                        contentContainerStyle={styles.iconList}
                        showsVerticalScrollIndicator={false}
                    >
                        {ICONS.map((icon, idx) => renderIcon(idx, 1))}
                    </ScrollView>


                    <LinearGradient
                        colors={["transparent", "#20163B"]}
                        style={styles.scrollFadeBottom}
                        pointerEvents="none"
                    />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        height: "100%",
        position: "relative",
        flexDirection: "column", // Make sure the layout is vertical
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
    scrollFadeBottom: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 30,
        zIndex: 5,
    },
    settingsText: {
        fontSize: 24,
    },
    half: {
        flex: 1,
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
        fontFamily: "OutfitBold",
        textAlign: "center",
        color: "white",
    },
    previewIcon: {
        marginLeft: 8,
        width: 64,
        height: 64,
        borderRadius: 32,
    },
    iconList: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "center",
    },
    iconWrapper: {
        width: "12%",
        aspectRatio: 1,
        margin: "1.5%",
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
