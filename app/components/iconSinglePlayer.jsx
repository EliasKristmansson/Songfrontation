import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const ICONS = Array.from({ length: 20 }, (_, i) => i + 1);

// Array of 20 pastel colors
const PASTEL_COLORS = [
    "#FFD1DC", "#B5EAD7", "#FFDAC1", "#C7CEEA", "#E2F0CB",
    "#FFB7B2", "#B5EAD7", "#FF9AA2", "#C7CEEA", "#E2F0CB",
    "#FFB347", "#B0E0E6", "#F3E5AB", "#D4A5A5", "#B2F9FC",
    "#E0BBE4", "#FFDFD3", "#C2F784", "#F1CBFF", "#A0CED9"
];

function PlaceholderIcon({ selected, style, color }) {
    return (
        <View
            style={[
                styles.icon,
                { backgroundColor: color },
                selected && styles.selectedIcon,
                style,
            ]}
        />
    );
}

export default function Icon() {
    const router = useRouter();
    const [selected1, setSelected1] = useState(null);
    const [selected2, setSelected2] = useState(null);

    return (
        <View style={styles.container}>
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
                            color={PASTEL_COLORS[selected1 % PASTEL_COLORS.length]}
                        />
                    )}
                </View>
                <ScrollView contentContainerStyle={styles.iconList}>
                    {ICONS.map((icon, idx) => (
                        <TouchableOpacity
                            key={icon}
                            onPress={() => setSelected1(idx)}
                            style={styles.iconWrapper}
                        >
                            <PlaceholderIcon
                                selected={selected1 === idx}
                                color={PASTEL_COLORS[idx % PASTEL_COLORS.length]}
                            />
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        </View>
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
        top: 20,
        right: 20,
        zIndex: 10,
        backgroundColor: "#f5f5f5",
        borderRadius: 20,
        padding: 8,
        elevation: 2,
    },
    settingsText: {
        fontSize: 24,
    },
    half: {
        flex: 1,
        padding: 10,
        backgroundColor: "#fff",
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
        fontSize: 48,
        fontWeight: "bold",
        textAlign: "center",
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
        justifyContent: "flex-start",
    },
    iconWrapper: {
        width: "30%",
        aspectRatio: 1,
        margin: "1.5%",
        alignItems: "center",
        justifyContent: "center",
    },
    icon: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "#bbb",
        borderWidth: 2,
        borderColor: "transparent",
    },
    selectedIcon: {
        borderColor: "#007AFF",
    },
});