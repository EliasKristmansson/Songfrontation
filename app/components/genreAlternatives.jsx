import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import PreGameMenuHeader from "./preGameMenuHeader";

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
        <View>
            <PreGameMenuHeader
                title="Genre Select"
                onBack={() => router.push("../components/matchSettings")}
                onProceed={() => router.push("../components/match")}
                canProceed={!!selectedGenre}
                proceedLabel="Start Match"
            />

            <View style={styles.container}>
                {/* Knappar osm visar tre genres */}
                <View style={styles.genreButtonRow}>
                    {randomGenres.map((genre) => (
                        <TouchableOpacity
                            key={genre}
                            style={[
                                styles.genreButton,
                                selectedGenre === genre && styles.genreButtonSelected
                            ]}
                            onPress={() => setSelectedGenre(genre)}
                        >
                            <Text style={selectedGenre === genre ? styles.genreTextSelected : styles.genreText}>
                                {genre}
                            </Text>
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
    roundedButton: {
        backgroundColor: BUTTON_BG,
        borderRadius: 25,
        paddingVertical: 12,
        paddingHorizontal: 32,
        minWidth: 100,
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.10,
        shadowRadius: 6,
        elevation: 2,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#fff",
        letterSpacing: 0.5,
    },
    genreButtonRow: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 40,
        gap: 20,
    },
    genreButton: {
        backgroundColor: "#e3e6f3",
        borderRadius: 40,
        width: 80,
        height: 80,
        justifyContent: "center",
        alignItems: "center",
        marginHorizontal: 10,
        borderWidth: 2,
        borderColor: "transparent",
    },
    genreButtonSelected: {
        backgroundColor: DARK_BLUE,
        borderColor: DARK_BLUE,
    },
    genreText: {
        color: DARK_BLUE,
        fontSize: 16,
        fontWeight: "500",
    },
    genreTextSelected: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
});