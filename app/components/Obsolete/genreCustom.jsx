import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ITUNES_GENRES } from "../match";
import PreGameMenuHeader from "../preGameMenuHeader";

const asStr = (v) => (Array.isArray(v) ? v[0] : v ?? "");

export default function GenreCustom() {
    const router = useRouter();
    const { rounds, duration, guesses, points, nrOfPlayers, from } = useLocalSearchParams();

    const [selectedGenre, setSelectedGenre] = useState(null);

    const scrollY = useRef(new Animated.Value(0)).current;
    const scrollRef = useRef(null);

    const bounce = (ref, animatedVal) => {
        Animated.sequence([
            Animated.timing(animatedVal, {
                toValue: 10,
                duration: 100,
                useNativeDriver: false,
                easing: Easing.out(Easing.quad),
            }),
            Animated.spring(animatedVal, {
                toValue: 0,
                friction: 10,
                tension: 40,
                useNativeDriver: false,
            }),
        ]).start();

        animatedVal.addListener(({ value }) => {
            ref.current?.scrollTo({ y: value, animated: false });
        });
    };

    useEffect(() => {
        setTimeout(() => {
            bounce(scrollRef, scrollY);
        }, 400);

        return () => {
            scrollY.removeAllListeners();
        };
    }, []);

    const onStartMatch = () => {
        if (!selectedGenre) return;
        router.push({
            pathname: "../components/match",
            params: {
                genreId: selectedGenre.id,
                genreSetting: String("Custom"),
                genreName: selectedGenre.name,
                rounds: String(asStr(rounds)),
                duration: String(asStr(duration)),
                guesses: String(asStr(guesses)),
                points: String(asStr(points)),
                nrOfPlayers,
                from,
            },
        });
    };

    return (
        <View style={styles.container}>
            <PreGameMenuHeader
                title="Selection of Genre"
                onBack={() => router.push({ pathname: "../components/matchSettings", params: { from } })}
                onProceed={onStartMatch}
                canProceed={!!selectedGenre}
                proceedLabel="Start"
            />

            <View style={styles.content}>
                <Text style={styles.subHeader}>
                    {selectedGenre ? `Selected: ${selectedGenre.name.split(" > ").pop()}` : "Choose one genre"}
                </Text>

                <View style={{ flex: 1 }}>
                    <ScrollView
                        ref={scrollRef}
                        contentContainerStyle={styles.iconList}
                        showsVerticalScrollIndicator={false}
                    >
                        {ITUNES_GENRES.map((g) => {
                            const isSelected = selectedGenre?.id === g.id;
                            return (
                                <TouchableOpacity
                                    key={g.id}
                                    onPress={() => setSelectedGenre(g)}
                                    style={[styles.iconWrapper, isSelected && styles.iconWrapperSelected]}
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

                                    <View style={styles.iconOuter}>
                                        <LinearGradient
                                            colors={["#896DA3", "#5663C4", "#412F7E"]}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 1 }}
                                            style={styles.iconInner}
                                        >
                                            <Text style={styles.iconText}>
                                                {g.name.split(" > ").pop()}
                                            </Text>
                                        </LinearGradient>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}

                    </ScrollView>

                    {/* Scrollindikator/gradient längst ner */}
                    <LinearGradient
                        colors={["transparent", "#20163B"]}
                        style={styles.scrollFadeBottom}
                        pointerEvents="none"
                    />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        minHeight: Platform.OS === "web" ? "100vh" : undefined,
        position: "relative",
    },
    content: {
        flex: 1,
        paddingTop: 16,
        paddingHorizontal: 20,
        position: "relative",
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
        paddingHorizontal: 12,
    },
    scrollFadeBottom: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 30,
        zIndex: 5,
    },
    iconWrapper: {
        width: "20%",
        aspectRatio: 1,
        marginHorizontal: "2%",
        marginVertical: 10,
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
    },
    iconWrapperSelected: {
        shadowColor: "#B2A2E2",
        shadowOpacity: 0.8,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 0 },
        elevation: 10,
        zIndex: 10000,
    },
    iconOuter: {
        width: "100%",
        height: "100%",
        borderRadius: 999,
        borderWidth: 2,
        borderColor: "#FFFFFF",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "transparent",
    },
    iconInner: {
        flex: 1,
        width: "100%",
        height: "100%",
        borderRadius: 999,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 6,
        overflow: "hidden",
    },
    iconText: {
        textAlign: "center",
        fontSize: 16,
        fontWeight: "bold",
        color: "#fff",
    },
    genreGlowHalo: {
        position: "absolute",
        top: 0, left: 0, right: 0, bottom: 0,
        borderRadius: 999,
        shadowColor: "white",
        shadowOpacity: 0.75,
        shadowRadius: 24,
        shadowOffset: { width: 0, height: 0 },
        elevation: 16,
        transform: [{ scale: 1.15 }],
    },
});