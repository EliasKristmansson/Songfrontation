import { Audio } from "expo-av";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    StyleSheet,
    Text,
    View
} from "react-native";
import GuessBubble from "../components/guessBubble.jsx";

const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get("window");

// --- Official iTunes genres ---
export const ITUNES_GENRES = [
    { id: 14, name: "Music > Pop" },
    { id: 51, name: "Music > Pop > K-Pop" },
    { id: 52, name: "Music > Pop > Indie Pop" },
    { id: 21, name: "Music > Rock" },
    { id: 1152, name: "Music > Rock > Hard Rock" },
    { id: 1153, name: "Music > Rock > Indie Rock" },
    { id: 1154, name: "Music > Rock > Alternative Rock" },
    { id: 6, name: "Music > Country" },
    { id: 1006, name: "Music > Country > Contemporary Country" },
    { id: 1007, name: "Music > Country > Classic Country" },
    { id: 17, name: "Music > Dance" },
    { id: 1009, name: "Music > Dance > Electro Pop" },
    { id: 1010, name: "Music > Dance > House" },
    { id: 15, name: "Music > R&B/Soul" },
    { id: 1011, name: "Music > R&B/Soul > Contemporary R&B" },
    { id: 1012, name: "Music > R&B/Soul > Neo Soul" },
    { id: 11, name: "Music > Jazz" },
    { id: 1013, name: "Music > Jazz > Smooth Jazz" },
    { id: 1014, name: "Music > Jazz > Vocal Jazz" },
    { id: 7, name: "Music > Hip-Hop/Rap" },
    { id: 1015, name: "Music > Hip-Hop/Rap > Trap" },
    { id: 1016, name: "Music > Hip-Hop/Rap > Gangsta Rap" },
    { id: 5, name: "Music > Classical" },
    { id: 1017, name: "Music > Classical > Baroque" },
    { id: 1018, name: "Music > Classical > Romantic" },
    { id: 3, name: "Music > Blues" },
    { id: 1019, name: "Music > Blues > Electric Blues" },
    { id: 1020, name: "Music > Blues > Acoustic Blues" },
    { id: 50, name: "Music > Electronic" },
    { id: 1021, name: "Music > Electronic > Ambient" },
    { id: 1022, name: "Music > Electronic > Dance/Electronic" },
    { id: 10, name: "Music > Singer/Songwriter" },
    { id: 1023, name: "Music > Singer/Songwriter > Indie Singer/Songwriter" },
    { id: 1024, name: "Music > Singer/Songwriter > Folk Singer/Songwriter" },
    { id: 12, name: "Music > Easy Listening" },
    { id: 1025, name: "Music > Easy Listening > Lounge" },
    { id: 1026, name: "Music > Easy Listening > Soft Rock" },
    { id: 28, name: "Music > New Age" },
    { id: 1027, name: "Music > New Age > Meditation" },
    { id: 1028, name: "Music > New Age > Nature Sounds" },
    { id: 2, name: "Music > Soundtrack" },
    { id: 1029, name: "Music > Soundtrack > Movie Soundtrack" },
    { id: 1030, name: "Music > Soundtrack > Musical Theatre" },
    { id: 4, name: "Music > Holiday" },
    { id: 1031, name: "Music > Holiday > Christmas" },
    { id: 1032, name: "Music > Holiday > Halloween" },
];

// --- Bubble positions ---
const LEFT_BUBBLE_POSITIONS = [
    { top: 5, left: 200 },
    { top: 160, left: 160 },
    { top: 50, left: 50 },
];

const RIGHT_BUBBLE_POSITIONS = [
    { top: 5, right: 200 },
    { top: 160, right: 160 },
    { top: 50, right: 50 },
];

// --- Game classes ---
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

// --- Main component ---
export default function Match() {
    const router = useRouter();
    const params = useLocalSearchParams();

    const [sound, setSound] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentSongObj, setCurrentSongObj] = useState(null);
    const [songOptions, setSongOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [correctPressed, setCorrectPressed] = useState(false);
    const [currentRoundGenre, setCurrentRoundGenre] = useState(null);
    const [playedTrackIds, setPlayedTrackIds] = useState(new Set());

    const [lastGuessPhase, setLastGuessPhase] = useState(false);
    const [lastGuessUsed, setLastGuessUsed] = useState({ 1: false, 2: false });

    // Player and round state
    const matchSettings = new MatchSettings({
        nrOfPlayers: params.nrOfPlayers ? parseInt(params.nrOfPlayers) : 2,
        selectionOfGenre: params.genre ? JSON.parse(params.genre) : [],
        nrOfSongsToWinRound: params.points ? parseInt(params.points) : 3,
        nrOfRoundsToWinMatch: params.rounds ? parseInt(params.rounds) : 1,
        songDuration: params.duration ? parseInt(params.duration) : 30,
        nrOfGuessesOnBoard: params.guesses ? parseInt(params.guesses) : 3,
    });
    const isSinglePlayer = matchSettings.nrOfPlayers === 1;

    const [player1, setPlayer1] = useState(new Player({ playerId: 1, playerIcon: "🎤" }));
    const [player2, setPlayer2] = useState(isSinglePlayer ? null : new Player({ playerId: 2, playerIcon: "🎸" }));

    const [player1Points, setPlayer1Points] = useState(0);
    const [player2Points, setPlayer2Points] = useState(0);
    const [player1RoundsWon, setPlayer1RoundsWon] = useState(0);
    const [player2RoundsWon, setPlayer2RoundsWon] = useState(0);
    const [roundWinner, setRoundWinner] = useState(null);

    const [player1Cooldown, setPlayer1Cooldown] = useState(false);
    const [player2Cooldown, setPlayer2Cooldown] = useState(false);
    const [player1CooldownTime, setPlayer1CooldownTime] = useState(0);
    const [player2CooldownTime, setPlayer2CooldownTime] = useState(0);
    const player1CooldownTimer = useRef(null);
    const player2CooldownTimer = useRef(null);

    const [dividerTimer, setDividerTimer] = useState(matchSettings.songDuration);
    const dividerTimerRef = useRef(null);

    const [initialCountdown, setInitialCountdown] = useState(3);
    const [showInitialCountdown, setShowInitialCountdown] = useState(true);

    const bubbleScalesRef = useRef([new Animated.Value(1), new Animated.Value(1), new Animated.Value(1)]);

    const [wrongGlowIndices, setWrongGlowIndices] = useState({});
    const [correctGlowIndices, setCorrectGlowIndices] = useState({});

    // --- Helper functions ---

    const resetRound = () => {
        setCurrentRoundGenre(null);
        setPlayer1Points(0);
        setPlayer2Points(0);
        setCorrectPressed(false);
        setCurrentSongObj(null);
        setSongOptions([]);
        setIsPlaying(false);
        setLoading(false);
        setRoundWinner(null);
        setDividerTimer(matchSettings.songDuration);
        setPlayer1Cooldown(false);
        setPlayer2Cooldown(false);
        setPlayer1CooldownTime(0);
        setPlayer2CooldownTime(0);
        setLastGuessPhase(false);
        setLastGuessUsed({ 1: false, 2: false });
        if (player1CooldownTimer.current) clearInterval(player1CooldownTimer.current);
        if (player2CooldownTimer.current) clearInterval(player2CooldownTimer.current);
    };

    const handleEndOfRound = (winningPlayerNum) => {
        if (winningPlayerNum === 1) {
            setPlayer1RoundsWon(prev => {
                const newVal = prev + 1;
                if (newVal >= matchSettings.nrOfRoundsToWinMatch) {
                    endMatch(1);
                } else {
                    nextRound(1);
                }
                return newVal;
            });
        } else if (winningPlayerNum === 2) {
            setPlayer2RoundsWon(prev => {
                const newVal = prev + 1;
                if (newVal >= matchSettings.nrOfRoundsToWinMatch) {
                    endMatch(2);
                } else {
                    nextRound(2);
                }
                return newVal;
            });
        }
    };

    const endMatch = (winner) => {
        Alert.alert("Match Over", `Player ${winner} wins the match!`, [
            { text: "OK", onPress: () => router.push("/") }
        ]);
    };

    const nextRound = (winner) => {
        Alert.alert("Round Over", `Player ${winner} wins the round!`, [
            {
                text: "Next Round", onPress: () => {
                    setShowInitialCountdown(true);
                    let count = 3;
                    setInitialCountdown(count);
                    const countdown = setInterval(() => {
                        count -= 1;
                        setInitialCountdown(count);
                        if (count <= 0) {
                            clearInterval(countdown);
                            setShowInitialCountdown(false);
                            resetRound();
                            setTimeout(() => handlePlayCore(), 100);
                        }
                    }, 900);
                }
            }
        ]);
    };

    // --- Core play logic ---
const handlePlayCore = async () => {
    try {
        setLoading(true);
        setCorrectPressed(false);
        setLastGuessPhase(false);
        setLastGuessUsed({ 1: false, 2: false });

        if (sound) {
            await sound.unloadAsync();
            setSound(null);
        }

        // Pick genre if not yet set for this round
        let genreToUse = currentRoundGenre;
        if (!genreToUse) {
            const randomGenre = ITUNES_GENRES[Math.floor(Math.random() * ITUNES_GENRES.length)];
            genreToUse = randomGenre;
            setCurrentRoundGenre(randomGenre);
        }

        // Fetch tracks from iTunes
        const res = await fetch(
            `https://itunes.apple.com/search?term=${encodeURIComponent(genreToUse.name)}&entity=song&limit=50&genreId=${genreToUse.id}`
        );
        const data = await res.json();

        if (!data.results || data.results.length === 0) {
            Alert.alert("No Preview", "Could not find a track with a preview.");
            setLoading(false);
            return;
        }

        // Filter out previously played tracks and tracks without preview
        let tracksWithPreview = data.results.filter(
            t => t.previewUrl && !playedTrackIds.has(t.trackId)
        );

        if (tracksWithPreview.length === 0) {
            Alert.alert("No New Tracks", "No new tracks available for this genre.");
            setLoading(false);
            return;
        }

        // Pick up to 3 unique tracks (fill with repeats if < 3)
        const optionsTracks = [];
        while (optionsTracks.length < 3) {
            if (tracksWithPreview.length === 0) break;
            const idx = Math.floor(Math.random() * tracksWithPreview.length);
            optionsTracks.push(tracksWithPreview[idx]);
            tracksWithPreview.splice(idx, 1);
        }

        // If fewer than 3 tracks, fill with already played tracks
        while (optionsTracks.length < 3) {
            const fallback = data.results[Math.floor(Math.random() * data.results.length)];
            if (fallback.previewUrl) optionsTracks.push(fallback);
        }

        // Pick random correct track
        const correctTrackIdx = Math.floor(Math.random() * optionsTracks.length);
        const correctTrack = optionsTracks[correctTrackIdx];

        // Mark tracks as played
        setPlayedTrackIds(prev => {
            const newSet = new Set(prev);
            optionsTracks.forEach(t => newSet.add(t.trackId));
            return newSet;
        });

        // Create Song object
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

        // Map options for display (always 3)
        const options = optionsTracks.map((t, idx) => ({
            title: t.trackName || "Unknown Title",
            artist: t.artistName || "Unknown Artist",
            previewUrl: t.previewUrl,
            isCorrect: idx === correctTrackIdx,
        }));
        setSongOptions(options);

        // Play the correct track
        const { sound: newSound } = await Audio.Sound.createAsync(
            { uri: correctTrack.previewUrl },
            { shouldPlay: true }
        );
        setSound(newSound);
        setIsPlaying(true);

        // Divider timer
        setDividerTimer(matchSettings.songDuration);
        if (dividerTimerRef.current) clearInterval(dividerTimerRef.current);
        dividerTimerRef.current = setInterval(() => {
            setDividerTimer(prev => {
                if (prev <= 1) {
                    clearInterval(dividerTimerRef.current);
                    setIsPlaying(false);
                    setLastGuessPhase(true);
                    setLastGuessUsed({ 1: false, 2: false });
                    if (newSound) {
                        newSound.unloadAsync();
                        setSound(null);
                    }
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

        setLoading(false);
    } catch (err) {
        console.error("Error playing preview:", err);
        Alert.alert("Error", "Failed to play preview");
        setIsPlaying(false);
        setLoading(false);
    }
};


    // Initial countdown
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

    // --- Guess handling ---
    const triggerRedGlow = (playerNum, idx) => {
        setWrongGlowIndices(prev => ({ ...prev, [playerNum]: [...(prev[playerNum] || []), idx] }));
        setTimeout(() => {
            setWrongGlowIndices(prev => ({ ...prev, [playerNum]: (prev[playerNum] || []).filter(i => i !== idx) }));
        }, 300);
    };

    const triggerGreenGlow = (playerNum, idx) => {
        setCorrectGlowIndices(prev => ({ ...prev, [playerNum]: [...(prev[playerNum] || []), idx] }));
        setTimeout(() => {
            setCorrectGlowIndices(prev => ({ ...prev, [playerNum]: (prev[playerNum] || []).filter(i => i !== idx) }));
        }, 300);
    };

    const handleGuess = async (isCorrect, playerNum, idx) => {
        if (lastGuessPhase) {
            if (lastGuessUsed[playerNum]) return;
            setLastGuessUsed(prev => ({ ...prev, [playerNum]: true }));

            let newPoints = playerNum === 1 ? player1Points : player2Points;
            newPoints += isCorrect ? 1 : 0;
            if (playerNum === 1) setPlayer1Points(newPoints); else setPlayer2Points(newPoints);

            if (isCorrect) triggerGreenGlow(playerNum, idx); else triggerRedGlow(playerNum, idx);

            if (newPoints >= matchSettings.nrOfSongsToWinRound) handleEndOfRound(playerNum);
            else handlePlayCore();
            return;
        }

        if (isCorrect) {
            setCorrectPressed(true);
            if (sound) {
                await sound.unloadAsync();
                setSound(null);
                setIsPlaying(false);
                if (dividerTimerRef.current) clearInterval(dividerTimerRef.current);
            }

            if (playerNum === 1) {
                const newPoints = player1Points + 1;
                setPlayer1Points(newPoints);
                if (newPoints >= matchSettings.nrOfSongsToWinRound) handleEndOfRound(1);
                else handlePlayCore();
            } else {
                const newPoints = player2Points + 1;
                setPlayer2Points(newPoints);
                if (newPoints >= matchSettings.nrOfSongsToWinRound) handleEndOfRound(2);
                else handlePlayCore();
            }

            triggerGreenGlow(playerNum, idx);
        } else {
            // TODO: implement cooldown for incorrect guess
            triggerRedGlow(playerNum, idx);
        }
    };

    // --- Render helpers ---
    const PointsRow = ({ points }) => (
        <View style={{ flexDirection: "row" }}>
            {[0, 1, 2].map(i => (
                <View key={i} style={[styles.pointCircle, points > i && styles.pointCircleFilled]} />
            ))}
        </View>
    );

    const RoundsRow = ({ won, total, filledStyle }) => (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
            {Array.from({ length: Math.max(1, total) }).map((_, i) => (
                <View key={i} style={[styles.roundCircle, i < won && filledStyle]} />
            ))}
        </View>
    );

return (
    <View style={{ flex: 1 }}>
        {/* Countdown overlay */}
        {showInitialCountdown && (
            <View style={styles.countdownOverlay} pointerEvents="none">
                <View style={styles.countdownBubble}>
                    <Text style={styles.countdownText}>
                        {initialCountdown > 0 ? initialCountdown : "Go!"}
                    </Text>
                </View>
            </View>
        )}

        {/* Player 1 Cooldown Overlay */}
        {player1Cooldown && (
            <View style={[styles.cooldownOverlay, styles.cooldownOverlayLeft]} pointerEvents="none">
                <View style={styles.cooldownBubble}>
                    <Text style={styles.cooldownTextBig}>{player1CooldownTime}</Text>
                </View>
            </View>
        )}

        {/* Player 2 Cooldown Overlay */}
        {player2Cooldown && !isSinglePlayer && (
            <View style={[styles.cooldownOverlay, styles.cooldownOverlayRight]} pointerEvents="none">
                <View style={styles.cooldownBubble}>
                    <Text style={styles.cooldownTextBig}>{player2CooldownTime}</Text>
                </View>
            </View>
        )}

        {/* Header */}
        <View style={styles.headerRow}>
            <View style={styles.sideRow}>
                <PointsRow points={player1Points} />
                <RoundsRow won={player1RoundsWon} total={matchSettings.nrOfRoundsToWinMatch} filledStyle={styles.roundCircleFilledP1} />
                <View style={styles.largeIconCircle}>
                    <Text style={styles.largeIconText}>{player1.playerIcon}</Text>
                </View>
            </View>

            <View style={styles.dividerContainer}>
                <View style={styles.dividerBlock}>
                    <Text style={styles.dividerTimerText}>{dividerTimer}s</Text>
                    <View style={[styles.dividerBar, { width: `${(dividerTimer / matchSettings.songDuration) * 100}%` }]} />
                </View>
            </View>

            {!isSinglePlayer && (
                <View style={styles.sideRow}>
                    <View style={styles.largeIconCircle}>
                        <Text style={styles.largeIconText}>{player2.playerIcon}</Text>
                    </View>
                    <PointsRow points={player2Points} />
                    <RoundsRow won={player2RoundsWon} total={matchSettings.nrOfRoundsToWinMatch} filledStyle={styles.roundCircleFilledP2} />
                </View>
            )}
        </View>

        {/* Last Guess Phase Overlay */}
        {lastGuessPhase && (
            <View style={styles.lastGuessOverlay} pointerEvents="none">
                <Text style={styles.lastGuessText}>Time's up</Text>
                <Text style={styles.lastGuessText2}>Last Guess!</Text>
            </View>
        )}

        {/* Song Options */}
        <View style={styles.playArea}>
            <View style={styles.sideColumn}>
                {songOptions.filter(Boolean).map((option, idx) => (
                    <GuessBubble
                        key={`p1-${idx}`}
                        option={option}
                        onPress={() => handleGuess(option.isCorrect, 1, idx)}
                        animatedIndex={idx}
                        positionStyle={LEFT_BUBBLE_POSITIONS[idx] || {}}
                        glowColor={
                            correctGlowIndices[1]?.includes(idx)
                                ? "green"
                                : wrongGlowIndices[1]?.includes(idx)
                                ? "red"
                                : null
                        }
                    />
                ))}
            </View>

            {!isSinglePlayer && (
                <View style={styles.sideColumn}>
                    {songOptions.filter(Boolean).map((option, idx) => (
                        <GuessBubble
                            key={`p2-${idx}`}
                            option={option}
                            onPress={() => handleGuess(option.isCorrect, 2, idx)}
                            animatedIndex={idx}
                            positionStyle={RIGHT_BUBBLE_POSITIONS[idx] || {}}
                            glowColor={
                                correctGlowIndices[2]?.includes(idx)
                                    ? "green"
                                    : wrongGlowIndices[2]?.includes(idx)
                                    ? "red"
                                    : null
                            }
                        />
                    ))}
                </View>
            )}
        </View>

        {/* Loading Overlay */}
        {loading && (
            <View style={styles.loaderOverlay}>
                <ActivityIndicator size="large" color="#5C66C5" />
                <Text style={{ color: "#fff", marginTop: 10 }}>Loading song preview...</Text>
            </View>
        )}
    </View>
);

}

const styles = StyleSheet.create({
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 40,
    },
    sideRow: {
        alignItems: "center",
    },
    largeIconCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: "#333",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 10,
    },
    largeIconText: {
        fontSize: 28,
    },
    pointCircle: {
        width: 12,
        height: 12,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: "#fff",
        margin: 2,
    },
    pointCircleFilled: {
        backgroundColor: "#fff",
    },
    roundCircle: {
        width: 18,
        height: 18,
        borderRadius: 9,
        borderWidth: 1,
        borderColor: "#fff",
        margin: 2,
    },
    roundCircleFilledP1: {
        backgroundColor: "#4CAF50",
    },
    roundCircleFilledP2: {
        backgroundColor: "#F44336",
    },
    dividerContainer: {
        flex: 1,
        alignItems: "center",
    },
    dividerBlock: {
        alignItems: "center",
    },
    dividerText: {
        color: "#fff",
        marginBottom: 4,
        fontSize: 16,
    },
    dividerBar: {
        height: 6,
        backgroundColor: "#fff",
        borderRadius: 3,
    },
    optionsContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.7)",
        justifyContent: "center",
        alignItems: "center",
    },
    countdownOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 10,
    },
    countdownBubble: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: "#000",
        justifyContent: "center",
        alignItems: "center",
    },
    countdownText: {
        fontSize: 48,
        color: "#fff",
        fontWeight: "bold",
    },
});
