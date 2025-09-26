import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import PreGameMenuHeader from "./preGameMenuHeader";

const DARK_BLUE = "#1a237e";
const BUTTON_BG = "#232b4d";
const ALT_BG = "#e3e6f3";

// Ranodm genre ska då egentligen hämtas från API i denna funktio  och inte från den hårdkodade listan
const GENRES = [
    "Pop", "Rock", "Hip-Hop", "Jazz", "EDM", "Classical", "Country", "Metal", "Indie", "Folk", "R&B", "Random"
];

export default function GenreSelect() {
    const router = useRouter();
    const [selected, setSelected] = useState(new Set());
    const selectedList = useMemo(() => Array.from(selected), [selected]);

    // Togglar genres
    const toggleGenre = (g) => {
        setSelected(prev => {
            const next = new Set(prev);
            if (next.has(g)) next.delete(g); else next.add(g);
            return next;
        });
    };

    // Som sedaan ska starta match med valda genres
    const onStartMatch = () => {
        router.push({
            pathname: "../components/match",
            params: { genres: JSON.stringify(selectedList) },
        });
    };

    return (

        <View>
            <PreGameMenuHeader
                title="Genre Select"
                onBack={() => router.push("../components/matchSettings")}
                onProceed={onStartMatch}
                canProceed={selected.size > 0}
                proceedLabel="Start Match"
            />

            <View style={styles.container}>


                {/* Skriver ut vilka genres som valts*/}
                <Text style={styles.subHeader}>
                    {selected.size > 0 ? `Selected: ${selectedList.join(", ")}` : "Choose one or more"}
                </Text>

                {/* Skrollbar väljare */}
                <ScrollView contentContainerStyle={styles.iconList}>
                    {GENRES.map((g) => {
                        const isSelected = selected.has(g);
                        return (
                            <TouchableOpacity
                                key={g}
                                onPress={() => toggleGenre(g)}
                                style={styles.iconWrapper}
                                activeOpacity={0.8}
                            >
                                <View
                                    style={[
                                        styles.icon,
                                        { backgroundColor: ALT_BG },
                                        isSelected && styles.selectedIcon
                                    ]}
                                >
                                    <Text style={[styles.iconText, isSelected && styles.iconTextSelected]}>
                                        {g}
                                    </Text>
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
        paddingHorizontal: 10,
        paddingTop: 40,
        backgroundColor: "#fff"
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 8,
        borderRadius: 18,
        paddingVertical: 12,
        paddingHorizontal: 10,
    },
    headerText: {
        fontSize: 24,
        fontWeight: "bold",
        color: DARK_BLUE,
        letterSpacing: 1
    },
    roundedButton: {
        backgroundColor: BUTTON_BG,
        borderRadius: 25,
        paddingVertical: 12,
        paddingHorizontal: 28,
        minWidth: 100,
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.10,
        shadowRadius: 6,
        elevation: 2,
    },
    buttonDisabled: {
        opacity: 0.5
    },
    buttonText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#fff",
        letterSpacing: 0.5
    },
    subHeader: {
        textAlign: "center",
        marginBottom: 12,
        color: "#444"
    },
    iconList: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "flex-start",
        paddingBottom: 24,
        paddingHorizontal: 6,
    },
    iconWrapper: {
        width: "18%",
        aspectRatio: 1,
        marginHorizontal: "1%",
        marginVertical: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    icon: {
        width: "100%",
        height: "100%",
        borderRadius: 999,
        borderWidth: 2,
        borderColor: "transparent",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 6,
    },
    selectedIcon: {
        borderColor: "#007AFF"
    },
    iconText: {
        textAlign: "center",
        fontSize: 16,
        fontWeight: "600",
        color: DARK_BLUE
    },
    iconTextSelected: { fontWeight: "800" },
});