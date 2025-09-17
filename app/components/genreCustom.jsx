import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const DARK_BLUE = "#1a237e";
const BUTTON_BG = "#232b4d";

const GENRES = [
    "Pop", "Rock", "Hip-Hop", "Jazz", "EDM", "Classical", "Country", "Metal", "Indie", "Folk", "R&B", "Random"
];

function getRandomGenres(list, n) {
    const shuffled = [...list].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, n);
}

export default function Icon() {
    const router = useRouter();
    const randomGenres = useMemo(() => getRandomGenres(GENRES, 3), []);
    const [selectedGenre, setSelectedGenre] = useState(null);

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.headerRow}>
                <TouchableOpacity
                    style={styles.roundedButton}
                    onPress={() => router.push("../components/matchSettings")}
                >
                    <Text style={styles.buttonText}>Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerText}>Selection of Genre</Text>
                <TouchableOpacity
                    style={styles.roundedButton}
                    onPress={() => router.push("../components/match")}
                >
                    <Text style={styles.buttonText}>Match</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 10,
        paddingTop: 40,
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 30,
        borderRadius: 18,
        paddingVertical: 16,
        paddingHorizontal: 10,
    },
    headerText: {
        fontSize: 24,
        fontWeight: "bold",
        color: DARK_BLUE,
        letterSpacing: 1,
    },
});