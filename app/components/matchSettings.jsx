import Slider from "@react-native-community/slider";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { playButtonSound } from "../utils/playButtonSound";
import PreGameMenuHeader from "./preGameMenuHeader";

export default function MatchSettings() {
    const router = useRouter();
    const { from } = useLocalSearchParams();

    const [genre, setGenre] = useState("Random");
    const [rounds, setRounds] = useState(1);
    const [duration, setDuration] = useState(29);
    const [guesses, setGuesses] = useState(3);
    const [points, setPoints] = useState(3);

    // Scroller
    const [scrollPos, setScrollPos] = useState(0);
    const [scrollContentHeight, setScrollContentHeight] = useState(1);
    const [scrollViewHeight, setScrollViewHeight] = useState(1);

    const getSelectedMatchMode = () => {
        if (genre === "Random") return "../components/genreRandom";
        if (genre === "Alternatives") return "../components/genreAlternatives";
        if (genre === "Custom") return "../components/genreCustom";
        return null;
    };

    const canProceed = !!getSelectedMatchMode();

    const handleNext = () => {
        const nextPath = getSelectedMatchMode();
        if (!nextPath) return;

        const params = {
            genre,
            rounds: String(rounds),
            duration: String(duration),
            guesses: String(guesses),
            points: String(points),
            nrOfPlayers: from === "iconSinglePlayer" ? 1 : 2,
            from, // ✅ preserve the original 'from'
        };

        router.push({ pathname: nextPath, params });
    };

    // Scroller logic
    const thumbHeight = Math.max(
        (scrollViewHeight / scrollContentHeight) * scrollViewHeight,
        30
    );
    const maxThumbTop = scrollViewHeight - thumbHeight;
    const thumbTop = Math.min(
        (scrollPos / (scrollContentHeight - scrollViewHeight)) * maxThumbTop || 0,
        maxThumbTop
    );

    return (
        <View style={styles.container}>
            <PreGameMenuHeader
                title="Match Settings"
                proceedLabel="Next"
                onProceed={canProceed ? handleNext : undefined}
                proceedDisabled={!canProceed}
                onBack={() => router.push("../components/icon")}
            />

            <View style={{ flex: 1 }}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    onScroll={e => setScrollPos(e.nativeEvent.contentOffset.y)}
                    onContentSizeChange={(_, h) => setScrollContentHeight(h)}
                    onLayout={e => setScrollViewHeight(e.nativeEvent.layout.height)}
                    scrollEventThrottle={16}
                >
                    <View style={styles.cardsColumn}>
                        {/* Genre Selection */}
                        <View style={styles.card}>
                            <Text style={styles.cardLabel}>Selection of Genre</Text>
                            <View style={styles.optionsRow}>
                                {["Random", "Alternatives", "Custom"].map((option) => (
                                    <TouchableOpacity
                                        key={option}
                                        style={[
                                            styles.optionButton,
                                            genre === option && styles.optionButtonSelected,
                                        ]}
                                        onPress={() => {
                                            playButtonSound();
                                            setGenre(option)}}
                                    >
                                        <Text
                                            style={
                                                genre === option
                                                    ? styles.optionTextSelected
                                                    : styles.optionText
                                            }
                                        >
                                            {option}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                        
                        {/* Points to Win Round */}
                        <View style={styles.card}>
                            <Text style={styles.cardLabel}>Songs to Win Round</Text>
                            <View style={styles.optionsRow}>
                                {[1, 3, 5].map((option) => (
                                    <TouchableOpacity
                                        key={option}
                                        style={[
                                            styles.optionButton,
                                            points === option && styles.optionButtonSelected,
                                        ]}
                                        onPress={() => {
                                            playButtonSound();
                                            setPoints(option)
                                        }}
                                    >
                                        <Text
                                            style={
                                                points === option
                                                    ? styles.optionTextSelected
                                                    : styles.optionText
                                            }
                                        >
                                            {option}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Number of Rounds */}
                        <View style={styles.card}>
                            <Text style={styles.cardLabel}>Rounds to Win Match</Text>
                            <View style={styles.optionsRow}>
                                {[1, 2, 3].map((option) => (
                                    <TouchableOpacity
                                        key={option}
                                        style={[
                                            styles.optionButton,
                                            rounds === option && styles.optionButtonSelected,
                                        ]}
                                        onPress={() => {
                                            playButtonSound();
                                            setRounds(option);
                                        }}
                                    >
                                        <Text
                                            style={
                                                rounds === option
                                                    ? styles.optionTextSelected
                                                    : styles.optionText
                                            }
                                        >
                                            {option}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Round Duration */}
                        <View style={styles.card}>
                            <Text style={styles.cardLabel}>Song Duration</Text>
                            <View style={styles.sliderRow}>
                                <Text style={styles.sliderLabel}>5s</Text>
                                <Slider
                                    style={styles.slider}
                                    minimumValue={5}
                                    maximumValue={29}
                                    step={1}
                                    value={duration}
                                    onValueChange={setDuration}
                                    minimumTrackTintColor="#fff"
                                    maximumTrackTintColor="rgba(255,255,255,0.3)"
                                    thumbTintColor="white"
                                />
                                <Text style={styles.sliderLabel}>29s</Text>
                            </View>
                            <Text style={styles.sliderInfo}>{duration} seconds</Text>
                        </View>

                        {/* Guesses on Board */}
                        <View style={styles.card}>
                            <Text style={styles.cardLabel}>Guesses on Board</Text>
                            <View style={styles.optionsRow}>
                                {[2, 3, 4].map((option) => (
                                    <TouchableOpacity
                                        key={option}
                                        style={[
                                            styles.optionButton,
                                            guesses === option && styles.optionButtonSelected,
                                        ]}
                                        onPress={() => {
                                            playButtonSound();
                                            setGuesses(option);}}
                                    >
                                        <Text
                                            style={
                                                guesses === option
                                                    ? styles.optionTextSelected
                                                    : styles.optionText
                                            }
                                        >
                                            {option}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        
                    </View>
                </ScrollView>

                {/* Scrollbar */}
                <View style={styles.scrollbarTrack}>
                    <View
                        style={[
                            styles.scrollbarThumb,
                            { height: thumbHeight, top: thumbTop },
                        ]}
                    />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, minHeight: Platform.OS === "web" ? "100vh" : undefined },
    scrollContent: { alignItems: "center", paddingHorizontal: 16, paddingBottom: 40 },
    cardsColumn: { width: "100%", alignItems: "center" },
    card: {
        backgroundColor: "rgba(0,0,0,0.35)",
        borderRadius: 14,
        padding: 16,
        marginVertical: 12,
        width: "95%",
        maxWidth: 500,
        alignItems: "center",
    },
    cardLabel: { fontSize: 16, fontFamily: "OutfitBold", color: "#fff", marginBottom: 8 },
    optionsRow: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 10 },
    optionButton: {
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 20,
        margin: 4,
        borderWidth: 2,
        borderColor: "transparent",
        backgroundColor: "rgba(255,255,255,0.05)",
    },
    optionButtonSelected: {
        borderColor: "#fff",
        backgroundColor: "rgba(255,255,255,0.15)",
    },
    optionText: { color: "#fff", fontSize: 15, fontFamily: "OutfitRegular" },
    optionTextSelected: { color: "#fff", fontSize: 15, fontFamily: "OutfitBold" },
    sliderRow: { flexDirection: "row", alignItems: "center", width: "100%" },
    slider: { flex: 1, marginHorizontal: 8, height: 8 },
    sliderLabel: { fontSize: 12, color: "#ddd", width: 32, textAlign: "center" },
    sliderInfo: { fontSize: 14, fontFamily: "OutfitBold", color: "white", marginTop: 6 },
    scrollbarTrack: { position: "absolute", right: 6, top: 0, bottom: 0, width: 5 },
    scrollbarThumb: { position: "absolute", left: 0, right: 0, backgroundColor: "rgba(0,0,0,0.35)", borderRadius: 3 },
});
