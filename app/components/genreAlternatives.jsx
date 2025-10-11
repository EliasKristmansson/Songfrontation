import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ITUNES_GENRES } from "./match";
import PreGameMenuHeader from "./preGameMenuHeader";

function getRandomGenres(list, n) {
    const shuffled = [...list].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, n);
}

const asStr = (v) => (Array.isArray(v) ? v[0] : v ?? "");

export default function GenreAlternatives() {
    const router = useRouter();
    const { rounds, duration, guesses, points, nrOfPlayers } = useLocalSearchParams();

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
                            genreId: selectedGenre.id,
                            genreName: selectedGenre.name,
                            rounds: String(asStr(rounds) ?? ""),
                            duration: String(asStr(duration) ?? ""),
                            guesses: String(asStr(guesses) ?? ""),
                            points: String(asStr(points) ?? ""),
                            nrOfPlayers,
                        }
                    });
                }}
                canProceed={!!selectedGenre}
                proceedLabel="Start"
            />

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
});