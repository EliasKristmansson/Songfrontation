import Slider from "@react-native-community/slider";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import PreGameMenuHeader from "./preGameMenuHeader";

const BUTTON_BG = "#232b4d";

export default function Icon() {
    const router = useRouter();
    const [genre, setGenre] = useState("Choose");
    const [rounds, setRounds] = useState(1);
    const [duration, setDuration] = useState(5);
    const [guesses, setGuesses] = useState(3);
    const [points, setPoints] = useState(3);

    // Next-knappens routing logik + skicka med parametrar
    const getSelectedMatchMode = () => {
        const params = { genre, rounds: String(rounds), duration: String(duration), guesses: String(guesses), points: String(points) };

        if (genre === "Random") return "../components/genreRandom";
        if (genre === "Alternatives") return "../components/genreAlternatives";
        if (genre === "Custom") return "../components/genreCustom";
        return null; // Not ready  
    };

    return (
        <View>
            {/* Header at the top */}
            <PreGameMenuHeader
                title="Match Settings"
                onBack={() => router.push("../components/icon")}
                onProceed={() => {
                    const nextPath = getSelectedMatchMode();
                    if (nextPath) {
                        const params = { genre, rounds: String(rounds), duration: String(duration), guesses: String(guesses), points: String(points) };
                        router.push({ pathname: nextPath, params });
                    }
                }}
                canProceed={!!getSelectedMatchMode()}
            />

            <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>

                {/* Selection of Genre */}
                <View style={styles.genreRow}>
                    <Text style={styles.genreLabelInline}>Selection of Genre</Text>
                    {["Random", "Alternatives", "Custom"].map(option => (
                        <TouchableOpacity
                            key={option}
                            style={[
                                styles.toggleButton,
                                genre === option && styles.toggleButtonSelected
                            ]}
                            onPress={() => setGenre(option)}
                        >
                            <Text style={genre === option ? styles.toggleTextSelected : styles.toggleText}>
                                {option}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Number of rounds */}
                <View style={styles.genreRow}>
                    <Text style={styles.genreLabelInline}>Number of rounds</Text>
                    {[1, 2, 3].map(option => (
                        <TouchableOpacity
                            key={option}
                            style={[
                                styles.toggleButton,
                                rounds === option && styles.toggleButtonSelected
                            ]}
                            onPress={() => setRounds(option)}
                        >
                            <Text style={rounds === option ? styles.toggleTextSelected : styles.toggleText}>
                                {option}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Round duration (slider) */}
                <View style={styles.genreRow}>
                    <Text style={styles.genreLabelInline}>Round duration</Text>
                    <Text style={styles.sliderLabel}>5 s</Text>
                    <Slider
                        style={{ flex: 1, marginHorizontal: 10 }}
                        minimumValue={5}
                        maximumValue={29}
                        step={1}
                        value={duration}
                        onValueChange={setDuration}
                        minimumTrackTintColor={"#fff"}
                        maximumTrackTintColor="#bbb"
                        thumbTintColor={"#fff"}
                    />
                    <Text style={styles.sliderLabel}>29 s</Text>
                    <Text style={styles.durationValue}>{duration} s</Text>
                </View>

                {/* Guesses on board */}
                <View style={styles.genreRow}>
                    <Text style={styles.genreLabelInline}>Guesses on board</Text>
                    {[2, 3, 4].map(option => (
                        <TouchableOpacity
                            key={option}
                            style={[
                                styles.toggleButton,
                                guesses === option && styles.toggleButtonSelected
                            ]}
                            onPress={() => setGuesses(option)}
                        >
                            <Text style={guesses === option ? styles.toggleTextSelected : styles.toggleText}>
                                {option}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Points to win round */}
                <View style={styles.genreRow}>
                    <Text style={styles.genreLabelInline}>Points to win round</Text>
                    {[1, 3, 5].map(option => (
                        <TouchableOpacity
                            key={option}
                            style={[
                                styles.toggleButton,
                                points === option && styles.toggleButtonSelected
                            ]}
                            onPress={() => setPoints(option)}
                        >
                            <Text style={points === option ? styles.toggleTextSelected : styles.toggleText}>
                                {option}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
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
        color: "#fff",
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
    genreRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 22,
        marginBottom: 10,
        gap: 10,
        backgroundColor: "rgba(0,0,0,0.35)",
        borderRadius: 16,
        paddingVertical: 12,
        paddingHorizontal: 10,
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 1,
    },
    genreLabelInline: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#fff",
        marginRight: 10,
        minWidth: 120,
    },
    toggleButton: {
        backgroundColor: "rgba(0,0,0,0)",
        borderRadius: 20,
        paddingVertical: 10,
        paddingHorizontal: 22,
        marginHorizontal: 2,
        borderWidth: 2,
        borderColor: "transparent",
        minWidth: 48,
        alignItems: "center",
    },
    toggleButtonSelected: {
        backgroundColor: "rgba(0,0,0,0)",
        borderColor: "#fff",
    },
    toggleText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    toggleTextSelected: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    sliderLabel: {
        fontSize: 16,
        color: "#fff",
        marginHorizontal: 2,
    },
    durationValue: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#fff",
        marginLeft: 10,
        minWidth: 48,
        textAlign: "right",
    },
    durationInput: {
        width: 50,
        height: 35,
        borderColor: "#bbb",
        borderWidth: 1,
        borderRadius: 8,
        textAlign: "center",
        fontSize: 16,
        marginHorizontal: 8,
        backgroundColor: "#fff",
    },
});