import { Audio } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Animated,
    Button,
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";

const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get("window");

// Common search terms for randomness
const SEARCH_TERMS = [
    "love", "dance", "night", "fire", "heart", "baby", "party",
    "dream", "light", "girl", "boy", "rock", "pop", "life"
];

// --- Game Engine/Logic Classes ---
class Player {
    constructor({ playerId, playerIcon }) {
        this.playerId = playerId;
        this.playerIcon = playerIcon;
        this.currentPoints = 0;
        this.currentWonRounds = 0;
        this.currentAvaliableGuesses = 0;
        this.currentTimeout = 0;
        this.currentGuess = null;
        this.correctGuess = false;
        this.hasWonRound = false;
        this.hasWonMatch = false;
    }
}

class Song {
    constructor({ songId, songGenre, songFile, songTitle, songArtist, songDuration, songArtistAlternatives }) {
        this.songId = songId;
        this.songGenre = songGenre;
        this.songFile = songFile;
        this.songTitle = songTitle;
        this.songArtist = songArtist;
        this.songDuration = songDuration;
        this.songArtistAlternatives = songArtistAlternatives || [];
        this.currentTimeLeft = songDuration;
        this.hasWonSong = false;
        this.songWinnerId = null;
    }
}

class Round {
    constructor({ roundId, roundGenre, songObjects, pointsToWinRound }) {
        this.roundId = roundId;
        this.roundGenre = roundGenre;
        this.songObjects = songObjects || [];
        this.currentSong = null;
        this.pointsToWinRound = pointsToWinRound;
        this.roundWinnerId = null;
    }
}

class MatchSettings {
    constructor({ nrOfPlayers, selectionOfGenre, nrOfSongsToWinRound, nrOfRoundsToWinMatch, songDuration, nrOfGuessesOnBoard }) {
        this.nrOfPlayers = nrOfPlayers;
        this.selectionOfGenre = selectionOfGenre || [];
        this.nrOfSongsToWinRound = nrOfSongsToWinRound;
        this.nrOfRoundsToWinMatch = nrOfRoundsToWinMatch;
        this.songDuration = songDuration;
        this.nrOfGuessesOnBoard = nrOfGuessesOnBoard;
    }
}

class MatchGame {
    constructor({ players, matchSettings }) {
        this.currentRound = 0;
        this.players = players || [];
        this.hasMatchWinner = false;
        this.matchSettings = matchSettings;
        this.rematch = false;
        this.matchWinnerId = null;
    }
}
// --- End Game Engine/Logic Classes ---

export default function Match() {
    const router = useRouter();
    const [sound, setSound] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTrack, setCurrentTrack] = useState(null);
    const [currentSongObj, setCurrentSongObj] = useState(null);
    const [songOptions, setSongOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [correctPressed, setCorrectPressed] = useState(false);

    // Score and round state
    const [player1, setPlayer1] = useState(new Player({ playerId: 1, playerIcon: "🎤" }));
    const [player2, setPlayer2] = useState(new Player({ playerId: 2, playerIcon: "🎸" }));
    const [player1Points, setPlayer1Points] = useState(0);
    const [player2Points, setPlayer2Points] = useState(0);
    const [roundWinner, setRoundWinner] = useState(null);

    // Match settings
    const matchSettings = new MatchSettings({
        nrOfPlayers: 2,
        selectionOfGenre: [],
        nrOfSongsToWinRound: 3,
        nrOfRoundsToWinMatch: 1,
        songDuration: 30,
        nrOfGuessesOnBoard: 3,
    });
    const matchGame = new MatchGame({ players: [player1, player2], matchSettings });

    // UI state for countdown overlay
    const [initialCountdown, setInitialCountdown] = useState(3);
    const [showInitialCountdown, setShowInitialCountdown] = useState(true);

    // timer display on divider
    const [dividerTimer, setDividerTimer] = useState(matchSettings.songDuration);
    const dividerTimerRef = useRef(null);

    // Bubble animation refs
    const bubbleScalesRef = useRef([new Animated.Value(1), new Animated.Value(1), new Animated.Value(1)]);

    // Randomized vertical positions for each player's bubbles
    const [player1Offsets, setPlayer1Offsets] = useState([]);
    const [player2Offsets, setPlayer2Offsets] = useState([]);

    const resetRound = () => {
        setPlayer1Points(0);
        setPlayer2Points(0);
        setCorrectPressed(false);
        setCurrentTrack(null);
        setSongOptions([]);
        setCurrentSongObj(null);
        setIsPlaying(false);
        setLoading(false);
        setRoundWinner(null);
        setDividerTimer(matchSettings.songDuration);
        setPlayer1Offsets([]);
        setPlayer2Offsets([]);
    };

    // Core play logic
    const handlePlayCore = async () => {
        try {
            setLoading(true);
            setCorrectPressed(false);
            if (sound) {
                await sound.unloadAsync();
                setSound(null);
            }

            const randomTerm = SEARCH_TERMS[Math.floor(Math.random() * SEARCH_TERMS.length)];
            const res = await fetch(
                `https://itunes.apple.com/search?term=${encodeURIComponent(randomTerm)}&entity=song&limit=25`
            );
            const data = await res.json();
            if (!data.results || data.results.length === 0) {
                Alert.alert("No Preview", "Could not find a track with a preview.");
                setLoading(false);
                return;
            }

            const tracksWithPreview = data.results.filter(t => t.previewUrl);
            if (tracksWithPreview.length < 3) {
                Alert.alert("Not enough previews", "Could not find enough tracks with previews.");
                setLoading(false);
                return;
            }

            const correctTrackIdx = Math.floor(Math.random() * tracksWithPreview.length);
            const correctTrack = tracksWithPreview[correctTrackIdx];

            const songObj = new Song({
                songId: correctTrack.trackId,
                songGenre: correctTrack.primaryGenreName,
                songFile: correctTrack.previewUrl,
                songTitle: correctTrack.trackName,
                songArtist: correctTrack.artistName,
                songDuration: 30,
                songArtistAlternatives: [],
            });
            setCurrentSongObj(songObj);

            let indices = [correctTrackIdx];
            while (indices.length < 3) {
                const idx = Math.floor(Math.random() * tracksWithPreview.length);
                if (!indices.includes(idx)) indices.push(idx);
            }
            indices.sort(() => Math.random() - 0.5);

            const options = indices.map(idx => ({
                title: tracksWithPreview[idx].trackName,
                artist: tracksWithPreview[idx].artistName,
                previewUrl: tracksWithPreview[idx].previewUrl,
                isCorrect: idx === correctTrackIdx,
            }));

            setSongOptions(options);
            setCurrentTrack({
                title: correctTrack.trackName,
                artist: correctTrack.artistName,
                previewUrl: correctTrack.previewUrl,
            });

            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri: correctTrack.previewUrl },
                { shouldPlay: true }
            );

            setSound(newSound);
            setIsPlaying(true);

            setDividerTimer(matchSettings.songDuration);
            if (dividerTimerRef.current) clearInterval(dividerTimerRef.current);
            dividerTimerRef.current = setInterval(() => {
                setDividerTimer(prev => {
                    if (prev <= 1) {
                        clearInterval(dividerTimerRef.current);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            newSound.setOnPlaybackStatusUpdate(status => {
                if (status.didJustFinish) {
                    setIsPlaying(false);
                    newSound.unloadAsync();
                    setSound(null);
                    if (dividerTimerRef.current) clearInterval(dividerTimerRef.current);
                }
            });

            // Random vertical positions for bubbles (between 20 and 300 px)
            setPlayer1Offsets(options.map(() => 20 + Math.random() * 280));
            setPlayer2Offsets(options.map(() => 20 + Math.random() * 280));

            setLoading(false);
        } catch (err) {
            console.error("Error playing preview:", err);
            Alert.alert("Error", "Failed to play preview");
            setIsPlaying(false);
            setLoading(false);
        }
    };

    useEffect(() => {
        let mounted = true;
        const runInitialCountdown = async () => {
            setShowInitialCountdown(true);
            let count = 3;
            setInitialCountdown(count);
            while (count > 0 && mounted) {
                await new Promise(res => setTimeout(res, 900));
                count -= 1;
                setInitialCountdown(count);
            }
            if (!mounted) return;
            setShowInitialCountdown(false);
            handlePlayCore();
        };
        runInitialCountdown();
        return () => { mounted = false; };
    }, []);

    const handleGuess = async (isCorrect, playerNum) => {
        if (isCorrect) {
            setCorrectPressed(true);
            if (sound) {
                await sound.unloadAsync();
                setSound(null);
                setIsPlaying(false);
                if (dividerTimerRef.current) clearInterval(dividerTimerRef.current);
            }
            if (currentSongObj) {
                currentSongObj.hasWonSong = true;
                currentSongObj.songWinnerId = playerNum;
            }
            if (playerNum === 1) {
                const newPoints = player1Points + 1;
                setPlayer1Points(newPoints);
                if (newPoints >= matchSettings.nrOfSongsToWinRound) {
                    setRoundWinner(1);
                    Alert.alert("Game Over", "Player 1 wins the match!", [
                        { text: "OK", onPress: () => router.push("/") }
                    ]);
                } else {
                    Alert.alert("Correct!", `Player 1 scored!`, [
                        { text: "Next Song", onPress: () => handlePlayCore() }
                    ]);
                }
            } else {
                const newPoints = player2Points + 1;
                setPlayer2Points(newPoints);
                if (newPoints >= matchSettings.nrOfSongsToWinRound) {
                    setRoundWinner(2);
                    Alert.alert("Game Over", "Player 2 wins the match!", [
                        { text: "OK", onPress: () => router.push("/") }
                    ]);
                } else {
                    Alert.alert("Correct!", `Player 2 scored!`, [
                        { text: "Next Song", onPress: () => handlePlayCore() }
                    ]);
                }
            }
        } else {
            Alert.alert("Wrong!", "Try again!");
        }
    };

    const BubbleOption = ({ option, onPress, disabled, animatedIndex, offsetY }) => {
        const scale = bubbleScalesRef.current[animatedIndex] || new Animated.Value(1);

        return (
            <Animated.View style={{ transform: [{ scale }], marginVertical: 6, top: offsetY, position: 'absolute' }}>
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={onPress}
                    disabled={disabled}
                    style={[styles.bubbleOption, disabled && styles.bubbleDisabled]}
                >
                    {/* Gradient content */}
                    <LinearGradient
                        colors={["#B77586", "#896DA3", "#5663C4", "#412F7E"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.bubbleOptionInner}
                    >
                        <Text style={styles.optionText}>{option.title}</Text>
                        <Text style={styles.optionArtist}>{option.artist}</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    const PointsRow = ({ points }) => {
        const circles = [0, 1, 2];
        return (
            <View style={styles.pointsRow}>
                {circles.map(i => (
                    <View key={i} style={[styles.pointCircle, points > i ? styles.pointCircleFilled : null]} />
                ))}
            </View>
        );
    };

    return (
        <View style={{ flex: 1 }}>
            <View contentContainerStyle={styles.container}>

                {/* HEADER (icons + dividerBlock + line) */}
                <View style={styles.headerRow}>
                    {/* LEFT SIDE: points + mic */}
                    <View style={styles.sideRow}>
                        <PointsRow points={player1Points} />
                        <View style={styles.largeIconCircle}>
                            <Text style={styles.largeIconText}>{player1.playerIcon}</Text>
                        </View>
                    </View>

                    {/* DIVIDER (block + vertical line) */}
                    <View style={styles.dividerContainer}>
                        <View style={styles.dividerBlock}>
                            <Text style={styles.dividerTimerText}>{dividerTimer}</Text>
                        </View>
                    </View>

                    {/* RIGHT SIDE: guitar + points */}
                    <View style={styles.sideRow}>
                        <View style={styles.largeIconCircle}>
                            <Text style={styles.largeIconText}>{player2.playerIcon}</Text>
                        </View>
                        <PointsRow points={player2Points} />
                    </View>
                </View>

                <View style={styles.playArea}>
                    {/* LEFT SIDE */}
                    <View style={styles.sideColumn}>
                        {songOptions.map((option, idx) => (
                            <BubbleOption
                                key={`p1-${idx}`}
                                option={option}
                                onPress={() => handleGuess(option.isCorrect, 1)}
                                disabled={correctPressed || !isPlaying}
                                animatedIndex={idx}
                                offsetY={player1Offsets[idx] || idx * 60}
                            />
                        ))}
                    </View>

                    {/* Vertical Divider (absolute in middle) */}
                    <View style={styles.playDividerLine} />

                    {/* RIGHT SIDE */}
                    <View style={styles.sideColumn}>
                        {songOptions.map((option, idx) => (
                            <BubbleOption
                                key={`p2-${idx}`}
                                option={option}
                                onPress={() => handleGuess(option.isCorrect, 2)}
                                disabled={correctPressed || !isPlaying}
                                animatedIndex={idx}
                                offsetY={player2Offsets[idx] || idx * 60}
                            />
                        ))}
                    </View>
                </View>

                {loading && <ActivityIndicator size="large" color="#5C66C5" style={styles.loader} />}

                <View style={styles.footer}>
                    <Button title="Play Random Song Preview" onPress={() => handlePlayCore()} disabled={isPlaying || loading || !!roundWinner} />
                    <View style={{ height: 10 }} />
                    <Button title="Reset Round" onPress={resetRound} />
                    <View style={{ height: 12 }} />
                    <Button title="Go to Front Page" onPress={() => router.push("/")} />
                </View>
            </View>

            {showInitialCountdown && (
                <View style={styles.countdownOverlay} pointerEvents="none">
                    <View style={styles.countdownBubble}>
                        <Text style={styles.countdownText}>{initialCountdown > 0 ? initialCountdown : 'Go!'}</Text>
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 12,
        paddingBottom: 40,
        minHeight: WINDOW_HEIGHT - 40,
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    sideRow: {
        flexDirection: "row",
        alignItems: "center",
        marginHorizontal: 8,
    },
    playArea: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        position: "relative",
    },
    sideColumn: {
        width: (WINDOW_WIDTH - 2) / 2,
        alignItems: 'center',
        height: 320, // container height for random bubble positions
        position: 'relative'
    },
    playDividerLine: {
        position: "absolute",
        left: WINDOW_WIDTH / 2,
        top: 0,
        width: 2,
        height: WINDOW_HEIGHT,
        backgroundColor: "white",
        zIndex: 5,
    },
    largeIconCircle: {
        width: 40,
        height: 40,
        borderRadius: 24,
        backgroundColor: "#111827",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        marginHorizontal: 6,
        borderColor: "white",
    },
    largeIconText: { fontSize: 26 },
    pointsRow: { flexDirection: "row" },
    pointCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: "#9CA3AF",
        marginHorizontal: 4,
        backgroundColor: 'transparent',
    },
    pointCircleFilled: {
        backgroundColor: "#5C66C5",
        borderColor: "#5C66C5",
    },
    dividerContainer: { width: 80, alignItems: "center" },
    dividerBlock: {
        width: 80,
        height: 46,
        backgroundColor: "white",
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        zIndex: 3,
    },
    dividerTimerText: { color: "black", fontSize: 18 },
    bubbleOption: {
        width: 120,
        height: 120,
        borderRadius: 60,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: 'white',
        shadowOpacity: 1,
        shadowRadius: 8,
        elevation: 6,
        borderWidth: 2,
        borderColor: '#896DA3',
        overflow: 'hidden',
        backgroundColor: '#412F7E',
    },
    bubbleOptionInner: {
        flex: 1,
        width: '100%',
        height: '100%',
        borderRadius: 60,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bubbleDisabled: { opacity: 0.5 },
    optionText: { color: 'white', fontWeight: '700', fontSize: 14, textAlign: 'center' },
    optionArtist: { fontSize: 11, color: '#D1D5DB' },
    loader: { marginTop: 20 },
    footer: { marginTop: 22, alignItems: 'center' },
    countdownOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.45)',
        zIndex: 1000,
    },
    countdownBubble: {
        width: 160,
        height: 160,
        borderRadius: 80,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 6,
        borderColor: '#5C66C5',
    },
    countdownText: {
        color: 'white',
        fontSize: 48,
        fontWeight: '800',
    }
});
