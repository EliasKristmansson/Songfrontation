import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ITUNES_GENRES } from "../match";
import PreGameMenuHeader from "../preGameMenuHeader";

function getRandomGenres(list, n) {
    const shuffled = [...list].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, n);
}

const asStr = (v) => (Array.isArray(v) ? v[0] : v ?? "");

export default function GenreAlternatives() {
    const router = useRouter();
    const { rounds, duration, guesses, points, nrOfPlayers, from } = useLocalSearchParams();

    const randomGenres = useMemo(() => getRandomGenres(ITUNES_GENRES, 3), []);
    const [selectedGenre, setSelectedGenre] = useState(null);

    return (
        <View style={styles.container}>
            <PreGameMenuHeader
                title="Selection of Genre"
                onBack={() => router.push({ pathname: "../components/matchSettings", params: { from } })}
                onProceed={() => {
                    router.push({
                        pathname: "../components/match",
                        params: {
                            genreId: selectedGenre.id,
                            genreSetting: String("Alternatives"),
                            genreName: selectedGenre.name,
                            rounds: String(asStr(rounds) ?? ""),
                            duration: String(asStr(duration) ?? ""),
                            guesses: String(asStr(guesses) ?? ""),
                            points: String(asStr(points) ?? ""),
                            nrOfPlayers,
                            from,
                        }
                    });
                }}
                canProceed={!!selectedGenre}
                proceedLabel="Start"
            />

            <Text style={styles.subHeader}>
                {selectedGenre ? `Selected: ${selectedGenre.name.split(" > ").pop()}` : "Choose one genre"}
            </Text>

            <View style={styles.centerArea}>
                <View style={styles.genreButtonRow}>
                    {randomGenres.map((genreObj) => {
                        const isSelected = selectedGenre === genreObj;
                        return (
                            <TouchableOpacity
                                key={genreObj.id}
                                style={styles.genreButtonWrapper}
                                onPress={() => setSelectedGenre(genreObj)}
                                activeOpacity={0.85}
                            >
                                {isSelected && (
                                    <LinearGradient
                                        colors={[
                                            "rgba(137,109,163,0.45)",
                                            "rgba(86,99,196,0.35)",
                                            "rgba(65,47,126,0.25)",
                                        ]}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={styles.genreGlowHalo}
                                    />
                                )}
                                <LinearGradient
                                    colors={["#896DA3", "#5663C4", "#412F7E"]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={[
                                        styles.genreButton,
                                        isSelected && styles.genreButtonSelected,
                                    ]}
                                >
                                    <Text style={styles.genreText}>{genreObj.name.split(" > ").pop()}</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        );
                    })}
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
    subHeader: {
        textAlign: "center",
        marginBottom: 16,
        color: "#fff",
        opacity: 0.8,
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
    genreButtonWrapper: {
        width: 160,
        height: 160,
        borderRadius: 80,
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
    },
    genreButton: {
        width: "100%",
        height: "100%",
        borderRadius: 80,
        borderWidth: 2,
        borderColor: "transparent",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#412F7E",
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 6,
        borderColor: "#FFFFFF",

    },
    genreButtonSelected: {
        borderColor: "#fff",
        shadowColor: "#896DA3",
        shadowOpacity: 0.5,
        shadowRadius: 12,
        elevation: 10,
    },
    genreText: {
        color: "#fff",
        fontSize: 20,
        fontFamily: "OutfitBold",
        textAlign: "center",
    },
    genreGlowHalo: {
        position: "absolute",
        top: -12,
        left: -12,
        width: 184,
        height: 184,
        borderRadius: 92,
        shadowColor: "white",
        shadowOpacity: 0.75,
        shadowRadius: 24,
        shadowOffset: { width: 0, height: 0 },
        elevation: 16,
    },
});