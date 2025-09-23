import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Image, ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

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
    const [selected2, setSelected2] = useState(null);
    const [customImage1, setCustomImage1] = useState(null);
    const [customImage2, setCustomImage2] = useState(null);

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
                        <PlaceholderIcon selected={selected} color="#fff" style={{ justifyContent: "center", alignItems: "center" }}>
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
                <PlaceholderIcon
                    selected={selected}
                    color={PASTEL_COLORS[idx % PASTEL_COLORS.length]}
                />
            </TouchableOpacity>
        );
    };

    return (
        <ImageBackground
            source={require("../../assets/images/Background3.png")}
            style={styles.container}
        >
            {/* Back Button */}
            <TouchableOpacity
                onPress={() => router.push("/")}
                style={styles.backButton}
            >
                <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>

            {/* Game Settings Button */}
            <TouchableOpacity
                style={styles.settingsButton}
                onPress={() => router.push("../components/matchSettings")}
            >
                <Text style={styles.settingsText}>⚙️</Text>
            </TouchableOpacity>

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
                <ScrollView contentContainerStyle={styles.iconList}>
                    {ICONS.map((icon, idx) => renderIcon(idx, 1))}
                </ScrollView>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Player 2 Half */}
            <View style={styles.half}>
                <View style={styles.headerRow}>
                    <Text style={styles.header}>Player 2</Text>
                    {selected2 !== null && (
                        <PlaceholderIcon
                            selected
                            style={styles.previewIcon}
                            color={selected2 === 0 && customImage2 ? "#fff" : PASTEL_COLORS[selected2 % PASTEL_COLORS.length]}
                        >
                            {selected2 === 0 && customImage2 && (
                                <Image
                                    source={{ uri: customImage2 }}
                                    style={{ width: "100%", height: "100%", borderRadius: 50 }}
                                />
                            )}
                        </PlaceholderIcon>
                    )}
                </View>
                <ScrollView contentContainerStyle={styles.iconList}>
                    {ICONS.map((icon, idx) => renderIcon(idx, 2))}
                </ScrollView>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
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
        padding: 10,
    },
    divider: {
        width: 2,
        backgroundColor: "#ccc",
        height: "100%",
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
        borderColor: "#007AFF",
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
