import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import PreGameMenuHeader from "./preGameMenuHeader";

const DARKER_PURPLE = "#3a2a6b";

const GENRES = [
    "Pop", "Rock", "Hip-Hop", "Jazz", "EDM", "Classical", "Country", "Metal", "Indie", "Folk", "R&B", "Random"
];

// Hjälp: expo-router kan ge string | string[]
const asStr = (v) => (Array.isArray(v) ? v[0] : v ?? "");

export default function GenreSelect() {
    const router = useRouter();
    const { rounds, duration, guesses, points, nrOfPlayers } = useLocalSearchParams();

    const [selected, setSelected] = useState(new Set());
    const selectedList = useMemo(() => Array.from(selected), [selected]);

    // Max 3 val av genre just nu
    const toggleGenre = (g) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(g)) {
                next.delete(g);
            } else {
                if (next.size >= 3) return prev; // blockera fler än 3
                next.add(g);
            }
            return next;
        });
    };

    const onStartMatch = () => {
        router.push({
            pathname: "../components/match",
            params: {
                genres: JSON.stringify(selectedList),
                rounds: String(asStr(rounds)),
                duration: String(asStr(duration)),
                guesses: String(asStr(guesses)),
                points: String(asStr(points)),
                nrOfPlayers,
            },
        });
    };

    return (
        <View style={styles.container}>
            <PreGameMenuHeader
                title="Selection of Genre"
                onBack={() => router.push("../components/matchSettings")}
                onProceed={onStartMatch}
                canProceed={selected.size > 0}
                proceedLabel="Start"
            />

            <View style={styles.content}>
                {/* Valda genres / instruktion */}
                <Text style={styles.subHeader}>
                    {selected.size > 0
                        ? `Selected (${selected.size}/3): ${selectedList.join(", ")}`
                        : "Choose up to 3"}
                </Text>

                {/* Skrollbar grid */}
                <ScrollView contentContainerStyle={styles.iconList}>
                    {GENRES.map((g) => {
                        const isSelected = selected.has(g);
                        const isDisabled = !isSelected && selected.size >= 3;
                        return (
                            <TouchableOpacity
                                key={g}
                                onPress={() => toggleGenre(g)}
                                style={[styles.iconWrapper, isDisabled && styles.disabledWrapper]}
                                activeOpacity={0.85}
                                disabled={isDisabled}
                            >
                                <View style={[styles.icon, isSelected && styles.selectedIcon]}>
                                    <Text style={styles.iconText}>{g}</Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        minHeight: Platform.OS === "web" ? "100vh" : undefined,
    },
    content: {
        flex: 1,
        paddingTop: 16,
        paddingHorizontal: 20, // ⬅️ more horizontal padding
    },

    subHeader: {
        textAlign: "center",
        marginBottom: 16,
        color: "#fff",
        opacity: 0.8,
    },

    iconList: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "flex-start",
        paddingBottom: 32,
        paddingHorizontal: 12, // ⬅️ more breathing space inside grid
    },
    iconWrapper: {
        width: "20%", // slightly wider spacing
        aspectRatio: 1,
        marginHorizontal: "2%", // ⬅️ extra spacing left/right
        marginVertical: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    disabledWrapper: {
        opacity: 0.6,
    },

    icon: {
        width: "100%",
        height: "100%",
        borderRadius: 999,
        borderWidth: 2,
        borderColor: "transparent",
        backgroundColor: "#6466bc",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 6,
    },
    selectedIcon: {
        borderColor: "#fff",
        borderColor: "#fff",
        shadowColor: "#8e7cc3",
        shadowOpacity: 0.5,
        shadowRadius: 8,
        elevation: 10,
    },

    iconText: {
        textAlign: "center",
        fontSize: 16,
        fontWeight: "bold",
        color: "#fff",
    },
});
