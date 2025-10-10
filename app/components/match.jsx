import { Audio } from "expo-av";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useContext, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Animated, Dimensions, Easing, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAudio } from "../components/audioContext";
import GuessBubble from "../components/guessBubble.jsx";
import RematchModal from "../components/modals/rematch.jsx";
import { BackgroundShaderContext } from "./backgroundShaderContext";
import PauseMatch from "./modals/pauseOngoingMatch.jsx";
const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get("window");

// --- Official iTunes genres ---
export const ITUNES_GENRES = [
    { id: 14, name: "Pop" },
    { id: 21, name: "Rock" },
    { id: 6, name: "Country" },
    { id: 17, name: "Dance" },
    { id: 15, name: "R&B/Soul" },
    { id: 11, name: "Jazz" },
    { id: 7, name: "Hip-Hop/Rap" },
    { id: 5, name: "Classical" },
    { id: 3, name: "Blues" },
    { id: 50, name: "Electronic" },
];

// --- Predefined bubble positions ---
const LEFT_BUBBLE_POSITIONS = {
    2: [
        { top: 0, right: 40 },
        { top: 130, right: 150 },
    ],
    3: [
        { top: 5, left: 200 },
        { top: 160, left: 160 },
        { top: 50, left: 50 },
    ],
    4: [
        { top: 0, right: 40 },
        { top: 160, right: 20 },
        { top: 5, right: 200 },
        { top: 165, right: 185 },
    ],
};

const RIGHT_BUBBLE_POSITIONS = {
    2: [
        { top: 0, left: 40 },
        { top: 130, left: 150 },
    ],
    3: [
        { top: 5, right: 200 },
        { top: 160, right: 160 },
        { top: 50, right: 50 },
    ],
    4: [
        { top: 0, left: 40 },
        { top: 160, left: 20 },
        { top: 5, left: 200 },
        { top: 165, left: 185 },
    ],
};


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
    const { dividerPos, setDividerPos } = useContext(BackgroundShaderContext);
    const [showPause, setShowPause] = useState(false);
    const { masterVolume, musicVolume } = useAudio();

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

    // Transition state for between songs
    const [showSongTransition, setShowSongTransition] = useState(false);
    const [songTransitionCountdown, setSongTransitionCountdown] = useState(3);

    //Shader background color context
    const { setPrimaryBackgroundColor, primaryBackgroundColor } = useContext(BackgroundShaderContext);
    const { secondaryBackgroundColor, setSecondaryBackgroundColor } = useContext(BackgroundShaderContext);
    const glowAnim = useRef(new Animated.Value(0)).current;

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
    const { nrOfGuessesOnBoard } = matchSettings;

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
    const transitionTimeoutRef = useRef(null);
    const isSongTransitionPendingRef = useRef(false);



    const [allPlayedTracks, setAllPlayedTracks] = useState([]); // only once at component level

    //Check if there was a track playing before pausing game
    const wasPlayingBeforePause = useRef(false);
    const pausedForModal = useRef(false);

    const [dividerTimer, setDividerTimer] = useState(matchSettings.songDuration);
    const dividerTimerRef = useRef(null);

    const [initialCountdown, setInitialCountdown] = useState(3);
    const [showInitialCountdown, setShowInitialCountdown] = useState(true);
    const initialCountdownRef = useRef(null);


    const bubbleScalesRef = useRef([new Animated.Value(1), new Animated.Value(1), new Animated.Value(1)]);
    const bubbleScalesRefShrinkGrow = useRef([]);

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

    const startInitialCountdown = (onFinish) => {
        // Clear any leftover interval
        if (initialCountdownRef.current) {
            clearInterval(initialCountdownRef.current);
            initialCountdownRef.current = null;
        }

        setShowInitialCountdown(true);
        let count = 3;
        setInitialCountdown(count);

        initialCountdownRef.current = setInterval(() => {
            count -= 1;
            setInitialCountdown(count);

            if (count <= 0) {
                clearInterval(initialCountdownRef.current);
                initialCountdownRef.current = null;
                setShowInitialCountdown(false);
                onFinish();
            }
        }, 900);
    };

    // Volymkontroll
    useEffect(() => {
        if (!sound) return;
        const effectiveVol = Math.max(
            0,
            Math.min(1, (masterVolume ?? 1) * (musicVolume ?? 1))
        );
        sound.setVolumeAsync(effectiveVol).catch(() => { });
    }, [masterVolume, musicVolume, sound]);


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


    const animateBubblesOut = () => {
        const animations = bubbleScalesRef.current.map(scale =>
            Animated.timing(scale, { toValue: 0, duration: 250, useNativeDriver: true })
        );
        Animated.stagger(50, animations).start(() => {
            setSongOptions([]); // only clear after animation completes
        });
    };
    // --- Helper to start the song transition ---
    const startSongTransition = () => {
        setSongOptions([]);
        const glowDuration = 1600;

        isSongTransitionPendingRef.current = true; // ✅ mark pending

        // Clear any previous timeout
        if (transitionTimeoutRef.current) {
            clearTimeout(transitionTimeoutRef.current);
            transitionTimeoutRef.current = null;
        }

        transitionTimeoutRef.current = setTimeout(() => {
            transitionTimeoutRef.current = null;
            isSongTransitionPendingRef.current = false; // ✅ not pending anymore
            startInitialCountdown(() => {
                handlePlayCore();
            });
        }, glowDuration);
    };

    useEffect(() => {
        bubbleScalesRefShrinkGrow.current = songOptions.map(() => new Animated.Value(1));
    }, [songOptions]);

    const mix = (a, b, t) => [
        a[0] + (b[0] - a[0]) * t,
        a[1] + (b[1] - a[1]) * t,
        a[2] + (b[2] - a[2]) * t,
    ];

    const triggerGreenGlowBackground = () => {
        // Animate from 0 → 1 → 0
        glowAnim.setValue(0);
        Animated.sequence([
            Animated.timing(glowAnim, {
                toValue: 1,
                duration: 400,
                easing: Easing.out(Easing.quad),
                useNativeDriver: false,
            }),
            Animated.timing(glowAnim, {
                toValue: 0,
                duration: 1200,
                easing: Easing.in(Easing.quad),
                useNativeDriver: false,
            }),
        ]).start();
    };

    useEffect(() => {
        const normalColor = [0.255, 0.184, 0.494]; // your purple base
        const greenColor = [0.0, 0.6, 0.4]; // bright green flash

        const listener = glowAnim.addListener(({ value }) => {
            // linear interpolation
            const mixed = [
                normalColor[0] + (greenColor[0] - normalColor[0]) * value,
                normalColor[1] + (greenColor[1] - normalColor[1]) * value,
                normalColor[2] + (greenColor[2] - normalColor[2]) * value,
            ];
            setPrimaryBackgroundColor(mixed);
        });

        return () => {
            glowAnim.removeListener(listener);
        };
    }, [glowAnim, setPrimaryBackgroundColor]);



    // --- Helper to (re)start divider interval ---
    const startDividerInterval = () => {
        if (dividerTimerRef.current) clearInterval(dividerTimerRef.current);
        // only start if there's time left
        if (dividerTimer <= 0) return;
        dividerTimerRef.current = setInterval(() => {
            setDividerTimer(prev => {
                if (prev <= 1) {
                    clearInterval(dividerTimerRef.current);
                    dividerTimerRef.current = null;
                    setIsPlaying(false);
                    setLastGuessPhase(true);
                    setLastGuessUsed({ 1: false, 2: false });
                    if (sound) {
                        // unload in background; ignore errors
                        sound.unloadAsync().then(() => setSound(null)).catch(() => { });
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    // --- Helpers to (re)start player cooldown timers if they have remaining time ---
    const startPlayer1CooldownInterval = () => {
        if (player1CooldownTimer.current) clearInterval(player1CooldownTimer.current);
        if (player1CooldownTime <= 0) return;
        setPlayer1Cooldown(true);
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
    };

    const startPlayer2CooldownInterval = () => {
        if (player2CooldownTimer.current) clearInterval(player2CooldownTimer.current);
        if (player2CooldownTime <= 0) return;
        setPlayer2Cooldown(true);
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
    };

    // --- Pause everything (audio + intervals) ---
    const pauseAll = async () => {
        try {
            pausedForModal.current = true;
            wasPlayingBeforePause.current = isPlaying; // remember if we were playing
            // pause audio if it exists and is playing
            if (sound && isPlaying) {
                try { await sound.pauseAsync(); } catch (e) { console.warn("pauseAll: pauseAsync failed", e); }
            }
            // clear divider interval
            if (dividerTimerRef.current) {
                clearInterval(dividerTimerRef.current);
                dividerTimerRef.current = null;
            }
            // clear cooldown intervals
            if (player1CooldownTimer.current) {
                clearInterval(player1CooldownTimer.current);
                player1CooldownTimer.current = null;
            }
            if (player2CooldownTimer.current) {
                clearInterval(player2CooldownTimer.current);
                player2CooldownTimer.current = null;
            }
            if (initialCountdownRef.current) {
                clearInterval(initialCountdownRef.current);
                initialCountdownRef.current = null;
            }

            if (transitionTimeoutRef.current) {
                clearTimeout(transitionTimeoutRef.current);
                transitionTimeoutRef.current = null;
            }


            // stop UI play flag
            setIsPlaying(false);
        } catch (e) {
            console.error("pauseAll error", e);
        }
    };

    // --- Resume everything (continue from remaining times) ---
    const resumeAll = async () => {
        try {
            pausedForModal.current = false;
            // resume audio only if we had been playing before pause
            if (sound && wasPlayingBeforePause.current) {
                try { await sound.playAsync(); setIsPlaying(true); } catch (e) { console.warn("resumeAll: playAsync failed", e); }
            }
            // restart divider if there is time left and we are not in last-guess or initial countdown
            if (dividerTimer > 0 && !lastGuessPhase && !showInitialCountdown) {
                startDividerInterval();
            }
            // restart cooldown timers if they had remaining time
            if (player1CooldownTime > 0) startPlayer1CooldownInterval();
            if (player2CooldownTime > 0) startPlayer2CooldownInterval();

            if (showInitialCountdown && initialCountdown > 0) {
                let count = initialCountdown;
                initialCountdownRef.current = setInterval(() => {
                    count -= 1;
                    setInitialCountdown(count);
                    if (count <= 0) {
                        clearInterval(initialCountdownRef.current);
                        initialCountdownRef.current = null;
                        setShowInitialCountdown(false);
                        handlePlayCore();
                    }
                }, 900);
                return; // don't restart timers below
            }

            if (isSongTransitionPendingRef.current) {
                startSongTransition();
                return; // so you don't double-start anything else
            }

        } catch (e) {
            console.error("resumeAll error", e);
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


        startInitialCountdown(() => {
            handlePlayCore(); // or your rematch-start logic
        });
    };
    const handleBackToMenu = () => {
        setShowRematch(false);
        router.push("/");
        setDividerPos(1.1);
    };

    const handleBackToMenuFromPause = () => {
        setShowPause(false);
        router.push("/");
        setDividerPos(1.1);
    };

    const nextRound = () => {

        // Immediately start the countdown for the next round
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
    };

    // --- Core play logic ---
    // Uppdaterad för rematch sak funka
    const handlePlayCore = async (opts = {}) => {
        try {
            if (showRematch && !opts.force) {
                setShowRematch(false);
                return;
            }

            setLoading(true);
            setCorrectPressed(false);
            setLastGuessPhase(false);
            setLastGuessUsed({ 1: false, 2: false });

            if (sound) {
                try {
                    await sound.unloadAsync();
                } catch (e) {
                    console.warn("Warning unloading previous sound:", e);
                }
                setSound(null);
            }

            let expectedGenreId = genreId;
            let expectedGenreName = genreName;

            if (!expectedGenreId) {
                const randomGenre = ITUNES_GENRES[Math.floor(Math.random() * ITUNES_GENRES.length)];
                expectedGenreId = randomGenre.id;
                expectedGenreName = randomGenre.name;
                setCurrentRoundGenre(randomGenre);
            }

            console.log("Searching for genre:", expectedGenreName, "with genreId:", expectedGenreId);

            if (!expectedGenreId) {
                Alert.alert("Error", "No genre selected!");
                setLoading(false);
                return;
            }

            const nrOfGuesses = matchSettings.nrOfGuessesOnBoard || 3;

            const allowedLetters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'r', 's', 't', 'u', 'v', 'w'];
            const jazzTerms = [
                "jazz", "sax", "swing", "blue", "bebop", "smooth", "fusion", "cool", "trumpet", "piano"
            ];
            const bluesTerms = [
                "blues", "delta", "guitar", "soul", "rhythm", "shuffle", "harmonica", "slide", "bottleneck", "bluesrock"
            ];

            let failedTerms = new Set();
            let responseData = null;
            let tracksWithPreview = [];

            for (let attempt = 1; attempt <= 10; attempt++) {
                const usableLetters = allowedLetters.filter(l => !failedTerms.has(l));
                const usableJazz = jazzTerms.filter(t => !failedTerms.has(t));
                const usableBlues = bluesTerms.filter(t => !failedTerms.has(t));

                if ((expectedGenreId === 11 && usableJazz.length === 0) ||
                    (expectedGenreId === 3 && usableBlues.length === 0) ||
                    (expectedGenreId !== 11 && usableLetters.length === 0)) {
                    break;
                }

                const searchTerm =
                    expectedGenreId === 11
                        ? usableJazz[Math.floor(Math.random() * usableJazz.length)]
                        : expectedGenreId === 3
                            ? usableBlues[Math.floor(Math.random() * usableBlues.length)]
                            : usableLetters[Math.floor(Math.random() * usableLetters.length)];

                console.log(`Attempt ${attempt}: Trying term "${searchTerm}"`);

                const res = await fetch(
                    `https://itunes.apple.com/search?term=${searchTerm}&media=music&entity=song&genreId=${expectedGenreId}&limit=200`
                );

                try {
                    responseData = await res.json();
                } catch (e) {
                    console.error("Failed to parse JSON:", e);
                    responseData = null;
                }

                const expectedGenreSub = expectedGenreName && expectedGenreName.includes(">")
                    ? expectedGenreName.split(">")[1].trim().toLowerCase()
                    : (expectedGenreName || "").toLowerCase();

                tracksWithPreview = (responseData?.results || []).filter(
                    t =>
                        t.previewUrl &&
                        !playedTrackIds.has(t.trackId) &&
                        (t.primaryGenreName || "").toLowerCase().includes(expectedGenreSub)
                );

                if (tracksWithPreview.length >= nrOfGuesses) {
                    console.log(`✅ Success with term "${searchTerm}" — found ${tracksWithPreview.length} usable tracks`);
                    break;
                }

                console.warn(`❌ "${searchTerm}" returned only ${tracksWithPreview.length} usable tracks (<${nrOfGuesses}). Skipping next time.`);
                failedTerms.add(searchTerm);
            }

            if (tracksWithPreview.length < nrOfGuesses) {
                console.warn("No new tracks found after all attempts, using previously played tracks.");
                tracksWithPreview = allPlayedTracks.filter(
                    t =>
                        t.previewUrl &&
                        (t.primaryGenreName || "").toLowerCase().includes(
                            expectedGenreName && expectedGenreName.includes(">")
                                ? expectedGenreName.split(">")[1].trim().toLowerCase()
                                : (expectedGenreName || "").toLowerCase()
                        )
                );

                if (tracksWithPreview.length === 0) {
                    Alert.alert("No Preview", `Could not find at least ${nrOfGuesses} tracks even in previously played songs.`);
                    setLoading(false);
                    return;
                }
            }

            const optionsTracks = [];

            while (optionsTracks.length < nrOfGuesses && tracksWithPreview.length > 0) {
                const idx = Math.floor(Math.random() * tracksWithPreview.length);
                const track = tracksWithPreview.splice(idx, 1)[0];
                if (track && track.previewUrl) optionsTracks.push(track);
            }

            const playedFallback = allPlayedTracks.filter(t => !optionsTracks.some(o => o.trackId === t.trackId));
            while (optionsTracks.length < nrOfGuesses && playedFallback.length > 0) {
                const idx = Math.floor(Math.random() * playedFallback.length);
                const track = playedFallback.splice(idx, 1)[0];
                if (track && track.previewUrl) optionsTracks.push(track);
            }

            if (optionsTracks.length < nrOfGuesses) {
                Alert.alert("Not Enough Tracks", "Returning to front page.");
                setLoading(false);
                router.push("/");
                return;
            }

            let correctTrackIdx = Math.floor(Math.random() * optionsTracks.length);
            let correctTrack = optionsTracks[correctTrackIdx];

            setPlayedTrackIds(prev => {
                const newSet = new Set(prev);
                optionsTracks.forEach(t => newSet.add(t.trackId));
                return newSet;
            });

            setAllPlayedTracks(prev => {
                const existingIds = new Set(prev.map(p => p.trackId));
                const toAppend = optionsTracks.filter(t => !existingIds.has(t.trackId));
                return [...prev, ...toAppend];
            });

            const songObj = new Song({
                songId: correctTrack.trackId,
                songGenre: correctTrack.primaryGenreName,
                songFile: correctTrack.previewUrl,
                songTitle: correctTrack.trackName,
                songArtist: correctTrack.artistName,
                songDuration: matchSettings.songDuration || 30,
                songArtistAlternatives: [],
            });
            setCurrentSongObj(songObj);

            const options = optionsTracks.slice(0, nrOfGuesses).map((t, idx) => ({
                title: t.trackName || "Unknown Title",
                artist: t.artistName || "Unknown Artist",
                previewUrl: t.previewUrl,
                isCorrect: idx === correctTrackIdx,
            }));

            if (!options.some(o => o.isCorrect)) {
                console.warn("Correct track fell outside visible options — forcing one to be correct.");
                correctTrackIdx = 0;
                options[0].isCorrect = true;
                correctTrack = optionsTracks[0];
            }

            setSongOptions(options);

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
                        setIsPlaying(false);
                        setLastGuessPhase(true);
                        setLastGuessUsed({ 1: false, 2: false });
                        if (newSound) {
                            newSound.unloadAsync().catch(e => console.warn("Unload error:", e));
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
                    newSound.unloadAsync().catch(e => console.warn("Unload error:", e));
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
        setShowInitialCountdown(true);
        let count = 3;
        setInitialCountdown(count);

        initialCountdownRef.current = setInterval(() => {
            count -= 1;
            setInitialCountdown(count);

            if (count <= 0) {
                clearInterval(initialCountdownRef.current);
                initialCountdownRef.current = null;
                setShowInitialCountdown(false);
                handlePlayCore();
            }
        }, 900);

        return () => {
            if (initialCountdownRef.current) {
                clearInterval(initialCountdownRef.current);
            }
        };
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

            const guesser = playerNum; // the one who guessed
            const opponent = playerNum === 1 ? 2 : 1; // the other player

            if (isCorrect) {
                // ✅ Correct: point to guesser
                if (guesser === 1) setPlayer1Points(prev => prev + 1);
                else setPlayer2Points(prev => prev + 1);
                triggerGreenGlow(guesser, idx);
            } else {
                // ❌ Wrong: point to opponent
                if (opponent === 1) setPlayer1Points(prev => prev + 1);
                else setPlayer2Points(prev => prev + 1);
                triggerRedGlow(guesser, idx);
            }

            // Check if anyone reached win condition
            const updatedP1 = (guesser === 1 ? player1Points + (isCorrect ? 1 : 0) : player1Points + (!isCorrect ? 1 : 0));
            const updatedP2 = (guesser === 2 ? player2Points + (isCorrect ? 1 : 0) : player2Points + (!isCorrect ? 1 : 0));

            if (updatedP1 >= matchSettings.nrOfSongsToWinRound) handleEndOfRound(1);
            else if (updatedP2 >= matchSettings.nrOfSongsToWinRound) handleEndOfRound(2);
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
                if (newPoints >= matchSettings.nrOfSongsToWinRound) {
                    handleEndOfRound(1);
                }
                else {
                    startSongTransition();
                    triggerGreenGlowBackground(playerNum);
                }
            } else {
                const newPoints = player2Points + 1;
                setPlayer2Points(newPoints);
                if (newPoints >= matchSettings.nrOfSongsToWinRound) handleEndOfRound(2);
                else startSongTransition();
                triggerGreenGlowBackground(playerNum);
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

            <View style={styles.topRightButtons}>
                <TouchableOpacity
                    style={styles.settingsButton}
                    onPress={() => { setShowPause(true); pauseAll(); }}
                >
                    <Text style={styles.settingsText}>⏸</Text>
                </TouchableOpacity>
            </View>

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
                    {songOptions
                        .filter(Boolean)
                        .slice(0, nrOfGuessesOnBoard) // 👈 only show this many
                        .map((option, idx) => (
                            <GuessBubble
                                key={`p1-${idx}`}
                                option={option}
                                onPress={() => handleGuess(option.isCorrect, 1, idx)}
                                animatedIndex={idx}
                                positionStyle={LEFT_BUBBLE_POSITIONS[nrOfGuessesOnBoard][idx]}
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
                        {songOptions
                            .filter(Boolean)
                            .slice(0, nrOfGuessesOnBoard) // 👈 same here
                            .map((option, idx) => (
                                <GuessBubble
                                    key={`p2-${idx}`}
                                    option={option}
                                    onPress={() => handleGuess(option.isCorrect, 2, idx)}
                                    animatedIndex={idx}
                                    positionStyle={RIGHT_BUBBLE_POSITIONS[nrOfGuessesOnBoard][idx]}
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
            <PauseMatch
                visible={showPause}
                resumeMatch={() => { setShowPause(false); resumeAll(); }}
                onBackToMenu={handleBackToMenuFromPause}
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
        flex: 1,
        height: 320,
        alignItems: "center",
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
    topRightButtons: {
        position: "absolute",
        right: 30,
        top: 10,
    },
    settingsButton: {
        padding: 4,
        borderRadius: 50,
        backgroundColor: "#6466bc",
        borderWidth: 2,
        borderColor: "white",
        shadowColor: "#8e7cc3",
        shadowOpacity: 0.5,
        shadowRadius: 8,
        elevation: 10,
    },
    settingsText: {
        fontSize: 24,
    }
});