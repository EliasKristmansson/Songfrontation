import { Audio } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
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
    View,
} from "react-native";
import GuessBubble from "../components/guessBubble.jsx"; // ⬅️ NEW

const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get("window");

// Common search terms for randomness
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


// Absolute positions for bubbles
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
    constructor({
        songId,
        songGenre,
        songFile,
        songTitle,
        songArtist,
        songDuration,
        songArtistAlternatives,
    }) {
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
    constructor({
        nrOfPlayers,
        selectionOfGenre,
        nrOfSongsToWinRound,
        nrOfRoundsToWinMatch,
        songDuration,
        nrOfGuessesOnBoard,
    }) {
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
    const params = useLocalSearchParams();
    const [sound, setSound] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTrack, setCurrentTrack] = useState(null);
    const [currentSongObj, setCurrentSongObj] = useState(null);
    const [songOptions, setSongOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [correctPressed, setCorrectPressed] = useState(false);
    // Last guess phase state
    const [lastGuessPhase, setLastGuessPhase] = useState(false);
    const [lastGuessUsed, setLastGuessUsed] = useState({ 1: false, 2: false });

    // Score and round state
    const [player1, setPlayer1] = useState(
        new Player({ playerId: 1, playerIcon: "🎤" })
    );

    const [player2, setPlayer2] = useState(
        isSinglePlayer ? null : new Player({ playerId: 2, playerIcon: "🎸" })
    );

    const [player1Points, setPlayer1Points] = useState(0);
    const [player2Points, setPlayer2Points] = useState(0);
    const [roundWinner, setRoundWinner] = useState(null);
    // Track rounds won per player
    const [player1RoundsWon, setPlayer1RoundsWon] = useState(0);
    const [player2RoundsWon, setPlayer2RoundsWon] = useState(0);

    // --- Cooldown state ---
    const [player1Cooldown, setPlayer1Cooldown] = useState(false);
    const [player2Cooldown, setPlayer2Cooldown] = useState(false);
    const [player1CooldownTime, setPlayer1CooldownTime] = useState(0);
    const [player2CooldownTime, setPlayer2CooldownTime] = useState(0);
    const player1CooldownTimer = useRef(null);
    const player2CooldownTimer = useRef(null);

    // Match settings: use params if present (from Custom Game), else fallback to defaults
    const matchSettings = new MatchSettings({
        nrOfPlayers: params.nrOfPlayers ? parseInt(params.nrOfPlayers) : 2,
        selectionOfGenre: params.genre ? [params.genre] : [],
        nrOfSongsToWinRound: params.points ? parseInt(params.points) : 3,
        nrOfRoundsToWinMatch: params.rounds ? parseInt(params.rounds) : 1,
        songDuration: params.duration ? parseInt(params.duration) : 30,
        nrOfGuessesOnBoard: params.guesses ? parseInt(params.guesses) : 3,
    });
    const isSinglePlayer = matchSettings.nrOfPlayers === 1;
    const matchGame = new MatchGame({
        players: isSinglePlayer ? [player1] : [player1, player2],
        matchSettings,
    });


    // UI state for countdown overlay
    const [initialCountdown, setInitialCountdown] = useState(3);
    const [showInitialCountdown, setShowInitialCountdown] = useState(true);

    // timer display on divider
    const [dividerTimer, setDividerTimer] = useState(matchSettings.songDuration);
    const dividerTimerRef = useRef(null);

    // bubble scales ref (if your code expects it elsewhere)
    const bubbleScalesRef = useRef([new Animated.Value(1), new Animated.Value(1), new Animated.Value(1)]);



    // Helper to reset round state
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

                // check if P1 has enough rounds to win the match
                if (newVal >= matchSettings.nrOfRoundsToWinMatch) {
                    endMatch(1);
                } else if (newVal + player2RoundsWon >= matchSettings.nrOfRoundsToWinMatch) {
                    // all rounds played, higher count wins
                    const winner = newVal > player2RoundsWon ? 1 : 2;
                    endMatch(winner);
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
                } else if (newVal + player1RoundsWon >= matchSettings.nrOfRoundsToWinMatch) {
                    const winner = newVal > player1RoundsWon ? 2 : 1;
                    endMatch(winner);
                } else {
                    nextRound(2);
                }
                return newVal;
            });
        }
    };

    const endMatch = (winner) => {
        if (winner === 1) {
            Alert.alert("Match Over", "Player 1 wins the match!", [
                { text: "OK", onPress: () => router.push("/") }
            ]);
        } else {
            Alert.alert("Match Over", "Player 2 wins the match!", [
                { text: "OK", onPress: () => router.push("/") }
            ]);
        }
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

    // Core play logic
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

            const randomGenre = ITUNES_GENRES[Math.floor(Math.random() * ITUNES_GENRES.length)];

            const res = await fetch(
            `https://itunes.apple.com/search?term=${encodeURIComponent(randomGenre.name)}&entity=song&limit=50&genreId=${randomGenre.id}`
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
                        // Timer ran out, enter last guess phase
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

    const [wrongGlowIndices, setWrongGlowIndices] = useState({}); // { playerNum: [index, ...] }
    const [correctGlowIndices, setCorrectGlowIndices] = useState({}); // { playerNum: [index, ...] }

    // Helper to trigger red glow
    const triggerRedGlow = (playerNum, bubbleIndex) => {
        setWrongGlowIndices(prev => ({
            ...prev,
            [playerNum]: [...(prev[playerNum] || []), bubbleIndex],
        }));
        setTimeout(() => {
            setWrongGlowIndices(prev => ({
                ...prev,
                [playerNum]: (prev[playerNum] || []).filter(i => i !== bubbleIndex),
            }));
        }, 300); // glow lasts 300ms
    };

    const triggerGreenGlow = (playerNum, bubbleIndex) => {
        setCorrectGlowIndices(prev => ({
            ...prev,
            [playerNum]: [...(prev[playerNum] || []), bubbleIndex],
        }));
        setTimeout(() => {
            setCorrectGlowIndices(prev => ({
                ...prev,
                [playerNum]: (prev[playerNum] || []).filter(i => i !== bubbleIndex),
            }));
        }, 300);
    };

    const handleGuess = async (isCorrect, playerNum, bubbleIndex) => {
        if (lastGuessPhase) {
            if (lastGuessUsed[playerNum]) return;
            setLastGuessUsed(prev => ({ ...prev, [playerNum]: true }));

            let newPoints;
            let winnerId;

            if (isCorrect) {
                setCorrectPressed(true);
                if (currentSongObj) {
                    currentSongObj.hasWonSong = true;
                    currentSongObj.songWinnerId = playerNum;
                }
                if (playerNum === 1) {
                    newPoints = player1Points + 1;
                    setPlayer1Points(newPoints);
                    winnerId = 1;
                } else {
                    newPoints = player2Points + 1;
                    setPlayer2Points(newPoints);
                    winnerId = 2;
                }

                triggerGreenGlow(playerNum, bubbleIndex);
            } else {
                setCorrectPressed(true);
                if (currentSongObj) {
                    currentSongObj.hasWonSong = true;
                    currentSongObj.songWinnerId = playerNum === 1 ? 2 : 1;
                }

                if (playerNum === 1) {
                    newPoints = player2Points + 1;
                    setPlayer2Points(newPoints);
                    winnerId = 2;
                } else {
                    newPoints = player1Points + 1;
                    setPlayer1Points(newPoints);
                    winnerId = 1;
                }

                triggerRedGlow(playerNum, bubbleIndex);
            }

            // --- NEW: handle round end if points threshold is reached ---
            if (newPoints >= matchSettings.nrOfSongsToWinRound) {
                setRoundWinner(winnerId);
                handleEndOfRound(winnerId);
            } else {
                // Otherwise, just proceed to next song
                handlePlayCore();
            }

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
            if (currentSongObj) {
                currentSongObj.hasWonSong = true;
                currentSongObj.songWinnerId = playerNum;
            }
            if (playerNum === 1) {
                const newPoints = player1Points + 1;
                setPlayer1Points(newPoints);
                if (newPoints >= matchSettings.nrOfSongsToWinRound) {
                    setRoundWinner(1);
                    handleEndOfRound(1);
                } else {
                    handlePlayCore(); // directly go to next song
                }
            } else {
                const newPoints = player2Points + 1;
                setPlayer2Points(newPoints);
                if (newPoints >= matchSettings.nrOfSongsToWinRound) {
                    setRoundWinner(2);
                    handleEndOfRound(2);
                } else {
                    handlePlayCore(); // directly go to next song
                }
            }
            triggerGreenGlow(playerNum, bubbleIndex);
        } else {
            // --- Cooldown logic ---
            if (playerNum === 1) {
                if (!player1Cooldown) {
                    setPlayer1Cooldown(true);
                    setPlayer1CooldownTime(2);
                    if (player1CooldownTimer.current) clearInterval(player1CooldownTimer.current);
                    player1CooldownTimer.current = setInterval(() => {
                        setPlayer1CooldownTime(prev => {
                            if (prev <= 1) {
                                clearInterval(player1CooldownTimer.current);
                                setPlayer1Cooldown(false);
                                return 0;
                            }
                            return prev - 1;
                        });
                    }, 1000);
                }
            } else if (playerNum === 2) {
                if (!player2Cooldown) {
                    setPlayer2Cooldown(true);
                    setPlayer2CooldownTime(2);
                    if (player2CooldownTimer.current) clearInterval(player2CooldownTimer.current);
                    player2CooldownTimer.current = setInterval(() => {
                        setPlayer2CooldownTime(prev => {
                            if (prev <= 1) {
                                clearInterval(player2CooldownTimer.current);
                                setPlayer2Cooldown(false);
                                return 0;
                            }
                            return prev - 1;
                        });
                    }, 1000);
                }
            }

            // --- RED GLOW INSTEAD OF ALERT ---
            triggerRedGlow(playerNum, bubbleIndex);
        }
    };

    const BubbleOption = ({ option, onPress, disabled, animatedIndex, positionStyle }) => {
        const scale = bubbleScalesRef.current[animatedIndex] || new Animated.Value(1);

        return (
            <Animated.View style={[{ transform: [{ scale }] }, styles.bubbleWrapper, positionStyle]}>
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={onPress}
                    disabled={disabled}
                    style={[styles.bubbleOption, disabled && styles.bubbleDisabled]}
                >
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

    // Small helper for score circles (points)
    const PointsRow = ({ points }) => {
        const circles = [0, 1, 2];
        return (
            <View style={styles.pointsRow}>
                {circles.map((i) => (
                    <View
                        key={i}
                        style={[
                            styles.pointCircle,
                            points > i ? styles.pointCircleFilled : null,
                        ]}
                    />
                ))}
            </View>
        );
    };

    // New helper for rounds visual indicator
    const RoundsRow = ({ won, total, filledStyle }) => {
        const arr = Array.from({ length: Math.max(1, total) });
        return (
            <View style={styles.roundsRow}>
                {arr.map((_, i) => (
                    <View
                        key={i}
                        style={[
                            styles.roundCircle,
                            i < won ? filledStyle : null,
                        ]}
                    />
                ))}
            </View>
        );
    };

    return (
        <View style={{ flex: 1 }}>
            {/* Player 1 Cooldown Overlay */}
            {player1Cooldown && (
                <View style={[styles.cooldownOverlay, styles.cooldownOverlayLeft]} pointerEvents="none">
                    <View style={styles.cooldownBubble}>
                        <Text style={styles.cooldownTextBig}>{player1CooldownTime}</Text>
                    </View>
                </View>
            )}
            {/* Player 2 Cooldown Overlay */}
            {player2Cooldown && (
                <View style={[styles.cooldownOverlay, styles.cooldownOverlayRight]} pointerEvents="none">
                    <View style={styles.cooldownBubble}>
                        <Text style={styles.cooldownTextBig}>{player2CooldownTime}</Text>
                    </View>
                </View>
            )}
            {/* Last guess phase overlay */}
            {lastGuessPhase && (
                <View
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1100,
                    }}
                    pointerEvents="none"
                >
                    <Text style={styles.lastGuessText}>
                        Time's up
                    </Text>
                    <Text style={styles.lastGuessText2}>

                        Last Guess!
                    </Text>
                </View>
            )}

            <View contentContainerStyle={styles.container}>
                {/* HEADER */}
                <View style={styles.headerRow}>
                    {/* LEFT SIDE */}
                    <View style={styles.sideRow}>
                        <View style={{ alignItems: "flex-end" }}>
                            {/* Points row */}
                            <PointsRow points={player1Points} />
                            {/* Rounds won circles below */}
                            <View style={{ marginTop: 4 }}>
                                <RoundsRow
                                    won={player1RoundsWon}
                                    total={matchSettings.nrOfRoundsToWinMatch}
                                    filledStyle={styles.roundCircleFilledP1}
                                />
                            </View>
                        </View>

                        {/* Player icon */}
                        <View style={styles.largeIconCircle}>
                            <Text style={styles.largeIconText}>{player1.playerIcon}</Text>
                        </View>
                    </View>

                    {/* DIVIDER */}
                    <View style={styles.dividerContainer}>
                        <View style={styles.dividerBlock}>
                            <Text style={styles.dividerTimerText}>{dividerTimer}</Text>
                        </View>
                    </View>

                    {!isSinglePlayer && (
                        <View style={styles.sideRow}>
                            {/* Player icon FIRST */}
                            <View style={styles.largeIconCircle}>
                                <Text style={styles.largeIconText}>{player2.playerIcon}</Text>
                            </View>

                            <View style={{ alignItems: "flex-start" }}>
                                {/* Points row */}
                                <PointsRow points={player2Points} />
                                {/* Rounds won circles below */}
                                <View style={{ marginTop: 4 }}>
                                    <RoundsRow
                                        won={player2RoundsWon}
                                        total={matchSettings.nrOfRoundsToWinMatch}
                                        filledStyle={styles.roundCircleFilledP2}
                                    />
                                </View>
                            </View>
                        </View>
                    )}
                </View>

                {/* PLAY AREA */}
                <View style={styles.playArea}>
                    {/* LEFT SIDE */}
                    <View style={styles.sideColumn}>
                        {songOptions.map((option, idx) => (
                            <GuessBubble
                                key={`p1-${idx}`}
                                option={option}
                                onPress={() => handleGuess(option.isCorrect, 1, idx)}
                                disabled={
                                    correctPressed ||
                                    (lastGuessPhase
                                        ? lastGuessUsed[1]
                                        : (!isPlaying || player1Cooldown))
                                }
                                animatedIndex={idx}
                                positionStyle={LEFT_BUBBLE_POSITIONS[idx] || {}}
                                glowColor={
                                    correctGlowIndices[1]?.includes(idx)
                                        ? 'green'
                                        : wrongGlowIndices[1]?.includes(idx)
                                            ? 'red'
                                            : null
                                }
                            />
                        ))}
                    </View>

                    {!isSinglePlayer && (
                        // render Player 2’s UI
                        < View style={styles.sideColumn}>
                            {songOptions.map((option, idx) => (
                                <GuessBubble
                                    key={`p2-${idx}`}
                                    option={option}
                                    onPress={() => handleGuess(option.isCorrect, 2, idx)}
                                    disabled={
                                        correctPressed ||
                                        (lastGuessPhase
                                            ? lastGuessUsed[2]
                                            : (!isPlaying || player2Cooldown))
                                    }
                                    animatedIndex={idx}
                                    positionStyle={RIGHT_BUBBLE_POSITIONS[idx] || {}}
                                    glowColor={
                                        correctGlowIndices[2]?.includes(idx)
                                            ? 'green'
                                            : wrongGlowIndices[2]?.includes(idx)
                                                ? 'red'
                                                : null
                                    }
                                />
                            ))}
                        </View>
                    )}


                </View>

                {loading && (
                    <ActivityIndicator size="large" color="#5C66C5" style={styles.loader} />
                )}

                <View style={styles.footer}>
                    <Button
                        title="Play Random Song Preview"
                        onPress={() => handlePlayCore()}
                        disabled={isPlaying || loading || !!roundWinner}
                    />
                    <View style={{ height: 10 }} />
                    <Button title="Reset Round" onPress={resetRound} />
                    <View style={{ height: 12 }} />
                    <Button title="Go to Front Page" onPress={() => router.push("/")} />
                </View>
            </View>

            {/* Countdown */}
            {
                showInitialCountdown && (
                    <View style={styles.countdownOverlay} pointerEvents="none">
                        <View style={styles.countdownBubble}>
                            <Text style={styles.countdownText}>
                                {initialCountdown > 0 ? initialCountdown : "Go!"}
                            </Text>
                        </View>
                    </View>
                )
            }
        </View >
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 12,
        paddingBottom: 40,
        minHeight: WINDOW_HEIGHT - 40,
    },
    // Remove old cooldownIndicator and cooldownText styles
    cooldownOverlay: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: '50%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(248,113,113,0.25)', // semi-transparent red
        zIndex: 100,
    },
    cooldownOverlayLeft: {
        left: 0,
        borderTopLeftRadius: 40,
        borderBottomLeftRadius: 40,
    },
    cooldownOverlayRight: {
        right: 0,
        borderTopRightRadius: 40,
        borderBottomRightRadius: 40,
    },
    cooldownBubble: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#F87171',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 4,
        borderColor: '#fff',
        marginBottom: 20,
    },
    cooldownTextBig: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 54,
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
        alignItems: "center",
        height: 320,
        position: "relative",
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
        backgroundColor: "transparent",
    },
    pointCircleFilled: {
        backgroundColor: "#5C66C5",
        borderColor: "#5C66C5",
    },

    // NEW: rounds visuals
    roundsRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    roundCircle: {
        width: 14,
        height: 14,
        borderRadius: 7,
        borderWidth: 1.5,
        borderColor: "#9CA3AF",
        marginHorizontal: 3,
        backgroundColor: "transparent",
    },
    roundCircleFilledP1: {
        backgroundColor: "#ff6b6b",
        borderColor: "#ff6b6b",
    },
    roundCircleFilledP2: {
        backgroundColor: "#4ecdc4",
        borderColor: "#4ecdc4",
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
        zIndex: 1000,
    },
    dividerTimerText: { color: "black", fontSize: 18 },
    loader: { marginTop: 20 },
    footer: { marginTop: 22, alignItems: "center" },
    lastGuessText: {
        fontFamily: "OutfitBold",
        color: 'white',
        fontSize: 24,
    },
    lastGuessText2: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 36,
        fontFamily: "OutfitBold",
    },
    countdownOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.45)",
        zIndex: 1000,
    },
    countdownBubble: {
        width: 160,
        height: 160,
        borderRadius: 80,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 6,
        borderColor: "#5C66C5",
    },
    countdownText: {
        color: "white",
        fontSize: 48,
        fontWeight: "800",
    },
});