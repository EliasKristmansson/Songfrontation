import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { ITUNES_GENRES } from "./match";
import PreGameMenuHeader from "./preGameMenuHeader";

function getRandomGenre(list) {
    return list[Math.floor(Math.random() * list.length)];
}

export default function GenreRandom() {
    const router = useRouter();
    const { rounds, duration, guesses, points, nrOfPlayers, from } = useLocalSearchParams();
    const randomGenre = useMemo(() => getRandomGenre(ITUNES_GENRES), []);

    return (
        <View style={styles.container}>
            <PreGameMenuHeader
                title="Selection of Genre"
                onBack={() => {
                    // ✅ preserve 'from' when going back
                    if (from === "main") router.push({ pathname: "../components/main" });
                    else router.push({ pathname: "../components/matchSettings", params: { from } });
                }}
                onProceed={() => {
                    router.push({
                        pathname: "../components/match",
                        params: {
                            genreId: randomGenre.id,
                            genreName: randomGenre.name,
                            rounds: String(rounds ?? "3"),
                            duration: String(duration ?? "29"),
                            guesses: String(guesses ?? "3"),
                            points: String(points ?? "3"),
                            nrOfPlayers,
                            from, // ✅ keep it here too
                        },
                    });
                }}
                canProceed={true}
                proceedLabel="Start"
            />

            <View style={styles.genreWrapper}>
                <Text style={styles.genreLabel}>Your genre:</Text>
                <Text style={styles.genreText}>{randomGenre.name}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, minHeight: Platform.OS === "web" ? "100vh" : undefined },
    genreWrapper: { flex: 1, alignItems: "center", justifyContent: "center", gap: 6 },
    genreLabel: { fontSize: 16, opacity: 0.7, color: "#fff", fontFamily: "OutfitRegular" },
    genreText: { fontSize: 40, fontWeight: "800", color: "#fff", letterSpacing: 1, fontFamily: "OutfitBold" },
});
