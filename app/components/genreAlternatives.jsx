import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ITUNES_GENRES } from "./match"; // import official genres
import PreGameMenuHeader from "./preGameMenuHeader";

// Helper to pick random genres
function getRandomGenres(list, n) {
    const shuffled = [...list].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, n);
}

// Helper for string params
const asStr = (v) => (Array.isArray(v) ? v[0] : v ?? "");

export default function GenreAlternatives() {
    const router = useRouter();
    const { rounds, duration, guesses, points, nrOfPlayers } = useLocalSearchParams();

    // Pick 3 random genres from official list
    const randomGenres = useMemo(() => getRandomGenres(ITUNES_GENRES, 3), []);
    const [selectedGenre, setSelectedGenre] = useState(null);

    return (
        <View style={styles.container}>
            <PreGameMenuHeader
                title="Selection of Genre"
                onBack={() => router.push("../components/matchSettings")}
                onProceed={() => {
                    router.push({
                        pathname: "../components/match",
                        params: {
                            // Send selected genre (id & name)
                            genre: selectedGenre ? JSON.stringify(selectedGenre) : JSON.stringify(randomGenres[0]),
                            rounds: String(asStr(rounds) ?? ""),
                            duration: String(asStr(duration) ?? ""),
                            guesses: String(asStr(guesses) ?? ""),
                            points: String(asStr(points) ?? ""),
                            nrOfPlayers,
                        },
                    });
                }}
                canProceed={!!selectedGenre}
                proceedLabel="Start"
            />

            <View style={styles.centerArea}>
                <View style={styles.genreButtonRow}>
                    {randomGenres.map((genreObj) => (
                        <TouchableOpacity
                            key={genreObj.id}
                            style={[
                                styles.genreButton,
                                selectedGenre === genreObj && styles.genreButtonSelected,
                            ]}
                            onPress={() => setSelectedGenre(genreObj)}
                            activeOpacity={0.85}
                        >
                            <Text style={styles.genreText}>{genreObj.name.split(" > ").pop()}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        minHeight: Platform.OS === "web" ? "100vh" : undefined,
    },
    centerArea: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingTop: 16,
    },
    genreButtonRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
    },
    genreButton: {
        width: 110,
        height: 110,
        borderRadius: 55,
        backgroundColor: "#6466bc",
        borderWidth: 2,
        borderColor: "transparent",
        alignItems: "center",
        justifyContent: "center",
    },
    genreButtonSelected: {
        borderColor: "#fff",
        shadowColor: "#8e7cc3",
        shadowOpacity: 0.5,
        shadowRadius: 8,
        elevation: 10,
    },
    genreText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "bold",
        textAlign: "center",
    },
});
