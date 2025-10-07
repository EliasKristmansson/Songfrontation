import { Audio } from "expo-av";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Animated, Dimensions, StyleSheet, Text, View } from "react-native";
import GuessBubble from "../components/guessBubble.jsx";
import RematchModal from "../components/modals/rematch.jsx";

const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get("window");

// --- Official iTunes genres ---
export const ITUNES_GENRES = [
    { id: 14, name: "Music > Pop" },
    { id: 21, name: "Music > Rock" },
    { id: 6, name: "Music > Country" },
    { id: 17, name: "Music > Dance" },
    { id: 15, name: "Music > R&B/Soul" },
    { id: 11, name: "Music > Jazz" },
    { id: 7, name: "Music > Hip-Hop/Rap" },
    { id: 5, name: "Music > Classical" },
    { id: 3, name: "Music > Blues" },
    { id: 50, name: "Music > Electronic" },
    { id: 10, name: "Music > Singer/Songwriter" },
    { id: 12, name: "Music > Easy Listening" },
    { id: 28, name: "Music > New Age" },
    { id: 2, name: "Music > Soundtrack" },
    { id: 4, name: "Music > Holiday" },
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

    // Tillagda för att rematch sa funka
    const [showRematch, setShowRematch] = useState(false);
    const [matchWinner, setMatchWinner] = useState(null);

    const genreId = params.genreId ? parseInt(params.genreId) : null;
    const genreName = params.genreName || "Unknown";


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

    const [allPlayedTracks, setAllPlayedTracks] = useState([]); // only once at component level


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

    const stopAllActivity = async () => {
        try {
            if (dividerTimerRef.current) {
                clearInterval(dividerTimerRef.current);
                dividerTimerRef.current = null;
            }
            if (player1CooldownTimer.current) {
                clearInterval(player1CooldownTimer.current);
                player1CooldownTimer.current = null;
            }
            if (player2CooldownTimer.current) {
                clearInterval(player2CooldownTimer.current);
                player2CooldownTimer.current = null;
            }
            if (sound) {
                await sound.unloadAsync();
                setSound(null);
            }
            setIsPlaying(false);
        } catch (e) {
            console.log("stopAllActivity error:", e);
        }
    };

    const endMatch = async (winner) => {
        try {
            await stopAllActivity();
        } catch { }
        setMatchWinner(winner);
        setShowRematch(true);
    };

    const handleRematch = () => {
        setPlayer1RoundsWon(0);
        setPlayer2RoundsWon(0);
        setPlayer1Points(0);
        setPlayer2Points(0);
        setPlayedTrackIds(new Set());
        setRoundWinner(null);
        setShowRematch(false);

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
                setTimeout(() => handlePlayCore({ force: true }), 120); // <— viktig ändring
            }
        }, 900);
    };
    const handleBackToMenu = () => {
        setShowRematch(false);
        router.push("/");
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
    // Uppdaterad för rematch sak funka
    const handlePlayCore = async (opts = {}) => {
        if (showRematch && !opts.force){
            tracksWithPreview([]);
            return;
        
        }
        try {
            setLoading(true);
            setCorrectPressed(false);
            setLastGuessPhase(false);
            setLastGuessUsed({ 1: false, 2: false });
            if (sound) {
                await sound.unloadAsync();
                setSound(null);
            }

            // Determine genre to use
            let expectedGenreId = genreId;
            let expectedGenreName = genreName;

            if (!expectedGenreId) {
                const randomGenre = ITUNES_GENRES[Math.floor(Math.random() * ITUNES_GENRES.length)];
                expectedGenreId = randomGenre.id;
                expectedGenreName = randomGenre.name;
                setCurrentRoundGenre(randomGenre);
            }

            // ✅ Console check
            console.log("Searching for genre:", expectedGenreName, "with genreId:", expectedGenreId);



            if (!genreId) {
                Alert.alert("Error", "No genre selected!");
                setLoading(false);
                return;
            }

            const randomLetter = String.fromCharCode(97 + Math.floor(Math.random() * 26)); // a-z

            const res = await fetch(
                `https://itunes.apple.com/search?term=${randomLetter}&media=music&entity=song&genreId=${genreId}&limit=200`
            );

            // ✅ Only parse JSON ONCE — never call res.json() again afterward!
            let responseData;
            try {
                responseData = await res.json();
            } catch (e) {
                console.error("Failed to parse JSON:", e);
                Alert.alert("API Error", "Could not fetch data from iTunes.");
                setLoading(false);
                return;
            }

            if (!responseData || !responseData.results || responseData.results.length === 0) {
                Alert.alert("No Preview", "Could not find a track with a preview.");
                setLoading(false);
                return;
            }


            console.log(
                "Filtered tracks:",
                (tracksWithPreview || []).map(t => ({ name: t.trackName, genre: t.primaryGenreName }))
            );

            // --- 0️⃣ Initialize allPlayedTracks state at the top of your component (outside this function) ---
        
            // --- 1️⃣ Filter new tracks ---
            let tracksWithPreview = responseData.results.filter(
                t =>
                    t.previewUrl &&
                    !playedTrackIds.has(t.trackId) &&
                    t.primaryGenreName?.toLowerCase().includes(expectedGenreName.split('>')[1].trim().toLowerCase())
            );

            console.log(
                "Filtered new tracks:",
                tracksWithPreview.map(t => ({ name: t.trackName, genre: t.primaryGenreName }))
            );

            // --- 2️⃣ Check if enough tracks exist ---
            if (tracksWithPreview.length + allPlayedTracks.length < 3) {
                Alert.alert("Not Enough Tracks", "Returning to front page.");
                setLoading(false);
                router.push("/");
                return;
            }

            // --- 3️⃣ Pick up to 3 unique NEW tracks ---
            const optionsTracks = [];
            while (optionsTracks.length < 3 && tracksWithPreview.length > 0) {
                const idx = Math.floor(Math.random() * tracksWithPreview.length);
                const track = tracksWithPreview.splice(idx, 1)[0];
                optionsTracks.push(track);
            }

            // --- 4️⃣ Fill missing slots from previously played tracks ---
            const playedArray = [...allPlayedTracks].filter(t => !optionsTracks.includes(t)); // avoid duplicates
            while (optionsTracks.length < 3 && playedArray.length > 0) {
                const idx = Math.floor(Math.random() * playedArray.length);
                const track = playedArray.splice(idx, 1)[0]; // remove used to prevent infinite loop
                if (track && track.previewUrl) optionsTracks.push(track);
            }

            // --- 5️⃣ If still <3 (should rarely happen), reroute ---
            if (optionsTracks.length < 3) {
                Alert.alert("Not Enough Tracks", "Returning to front page.");
                setLoading(false);
                router.push("/");
                return;
            }

            // --- 6️⃣ Pick random correct track ---
            let correctTrackIdx = Math.floor(Math.random() * optionsTracks.length);
            let correctTrack = optionsTracks[correctTrackIdx];

            // --- 7️⃣ Mark tracks as played ---
            setPlayedTrackIds(prev => {
                const newSet = new Set(prev);
                optionsTracks.forEach(t => newSet.add(t.trackId));
                return newSet;
            });

            // --- 8️⃣ Add all selected tracks to allPlayedTracks ---
            setAllPlayedTracks(prev => [...prev, ...optionsTracks]);


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

    useEffect(() => {
        return () => {
            if (player1CooldownTimer.current) clearInterval(player1CooldownTimer.current);
            if (player2CooldownTimer.current) clearInterval(player2CooldownTimer.current);
            if (dividerTimerRef.current) clearInterval(dividerTimerRef.current);
            if (sound) {
                sound.unloadAsync().catch(() => { });
            }
        };
    }, []);


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

    // seconds to block after a wrong guess — tweak as you like
    const WRONG_GUESS_COOLDOWN = 2;

    const startCooldown = (playerNum) => {
        if (playerNum === 1) {
            // clear existing just in case
            if (player1CooldownTimer.current) clearInterval(player1CooldownTimer.current);

            setPlayer1Cooldown(true);
            setPlayer1CooldownTime(WRONG_GUESS_COOLDOWN);

            player1CooldownTimer.current = setInterval(() => {
                setPlayer1CooldownTime(prev => {
                    if (prev <= 1) {
                        if (player1CooldownTimer.current) {
                            clearInterval(player1CooldownTimer.current);
                            player1CooldownTimer.current = null;
                        }
                        setPlayer1Cooldown(false);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            if (player2CooldownTimer.current) clearInterval(player2CooldownTimer.current);

            setPlayer2Cooldown(true);
            setPlayer2CooldownTime(WRONG_GUESS_COOLDOWN);

            player2CooldownTimer.current = setInterval(() => {
                setPlayer2CooldownTime(prev => {
                    if (prev <= 1) {
                        if (player2CooldownTimer.current) {
                            clearInterval(player2CooldownTimer.current);
                            player2CooldownTimer.current = null;
                        }
                        setPlayer2Cooldown(false);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
    };


    const handleGuess = async (isCorrect, playerNum, idx) => {
        // --- Last-guess-phase handling (unchanged) ---
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

        // --- Respect active cooldown (only in normal play) ---
        if ((playerNum === 1 && player1Cooldown) || (playerNum === 2 && player2Cooldown)) {
            // you can provide feedback here (e.g. small vibration or toast)
            return;
        }

        // --- Normal (non-last-guess) flow ---
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
            // wrong guess -> glow + start cooldown
            triggerRedGlow(playerNum, idx);
            startCooldown(playerNum);
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
                <View style={[styles.cooldownOverlay, styles.cooldownOverlayLeft]} pointerEvents="auto">
                    <View style={styles.cooldownBubble}>
                        <Text style={styles.cooldownTextBig}>{player1CooldownTime}</Text>
                    </View>
                </View>
            )}

            {/* Player 2 Cooldown Overlay */}
            {player2Cooldown && !isSinglePlayer && (
                <View style={[styles.cooldownOverlay, styles.cooldownOverlayRight]} pointerEvents="auto">
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
                        <Text style={styles.dividerTimerText}>{dividerTimer}</Text>
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

            {/* Return Overlay */}
            <RematchModal
                visible={showRematch}
                onRematch={handleRematch}
                onBackToMenu={handleBackToMenu}
            />
        </View>
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
    lastGuessOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1100,
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