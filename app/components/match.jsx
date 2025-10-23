import { Audio } from "expo-av";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useContext, useEffect, useRef, useState } from "react";
import { Alert, Animated, Dimensions, Easing, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAudio } from "../components/audioContext";
import GuessBubble from "../components/guessBubble.jsx";
import RematchModal from "../components/modals/rematch.jsx";
import { BackgroundShaderContext } from "./backgroundShaderContext";
import BetweenRoundModalAlternatives from "./modals/betweenRoundModalAlternatives.jsx";
import BetweenRoundModalCustom from "./modals/betweenRoundModalCustom.jsx";
import BetweenRoundModalRandom from "./modals/betweenRoundModalRandom.jsx";
import PauseMatch from "./modals/pauseOngoingMatch.jsx";

const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get("window");

// --- Official iTunes genres ---
export const ITUNES_GENRES = [
    { id: 14, name: "Pop" },
    { id: 21, name: "Rock" },
    { id: 7, name: "Hip-Hop/Rap" },
    { id: 6, name: "Country" },
    { id: 15, name: "R&B/Soul" },
    { id: 17, name: "Dance" },
    { id: 19, name: "Alternative" },
    { id: 12, name: "Latino" },
    { id: 3, name: "Blues" },
    { id: 5, name: "Classical" },
    { id: 11, name: "Jazz" },
    { id: 2, name: "Soundtrack" }, //Kan ofta ge fel då den bara spelar låtar som varit med i filmer/serier
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


const SINGLE_BUBBLE_POSITIONS = {
    2: [
        { top: WINDOW_HEIGHT * 0.15, left: WINDOW_WIDTH * 0.27 },
        { top: WINDOW_HEIGHT * 0.15, left: WINDOW_WIDTH * 0.52 },
    ],
    3: [
        { top: WINDOW_HEIGHT * 0.15, left: WINDOW_WIDTH * 0.17 },
        { top: WINDOW_HEIGHT * 0.15, left: WINDOW_WIDTH * 0.39 },
        { top: WINDOW_HEIGHT * 0.15, left: WINDOW_WIDTH * 0.61 },
    ],
    4: [
        { top: WINDOW_HEIGHT * 0.15, left: WINDOW_WIDTH * 0.1 },
        { top: WINDOW_HEIGHT * 0.15, left: WINDOW_WIDTH * 0.3 },
        { top: WINDOW_HEIGHT * 0.15, left: WINDOW_WIDTH * 0.5 },
        { top: WINDOW_HEIGHT * 0.15, left: WINDOW_WIDTH * 0.7 },
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
    constructor({ nrOfPlayers, genreSetting, selectionOfGenre, nrOfSongsToWinRound, nrOfRoundsToWinMatch, songDuration, nrOfGuessesOnBoard }) {
        this.nrOfPlayers = nrOfPlayers;
        this.genreSetting = genreSetting;
        this.selectionOfGenre = selectionOfGenre || [];
        this.nrOfSongsToWinRound = nrOfSongsToWinRound;
        this.nrOfRoundsToWinMatch = nrOfRoundsToWinMatch;
        this.songDuration = songDuration;
        this.nrOfGuessesOnBoard = nrOfGuessesOnBoard;
    }
}

// Simple stopwatch utility
const makeTimer = (label) => {
  const start = Date.now();
  return {
    mark: (step) => {
      const diff = ((Date.now() - start) / 1000).toFixed(2);
      console.log(`⏱️ ${diff}s — ${step}`);
    },
    end: () => {
      const diff = ((Date.now() - start) / 1000).toFixed(2);
      console.log(`✅ Total ${diff}s ${label ? `(${label})` : ""}`);
    },
  };
};


// --- Main component ---
export default function Match() {
    const router = useRouter();
    const params = useLocalSearchParams();
    //const { dividerPos, setDividerPos } = useContext(BackgroundShaderContext);
    const [showPause, setShowPause] = useState(false);
    const { masterVolume, musicVolume } = useAudio();

    // Tillagda för att rematch sa funka
    const [showRematch, setShowRematch] = useState(false);
    const [matchWinner, setMatchWinner] = useState(null);

    //Between round modals visibility
    const [showBetweenRoundRandom, setShowBetweenRoundRandom] = useState(false);
    const [showBetweenRoundCustom, setShowBetweenRoundCustom] = useState(false);
    const [showBetweenRoundAlternatives, setShowBetweenRoundAlternatives] = useState(false);

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
    const { primaryBackgroundColorRef } = useContext(BackgroundShaderContext);
    const { secondaryBackgroundColorRef } = useContext(BackgroundShaderContext);
    const glowAnim = useRef(new Animated.Value(0)).current;
    const glowAnimRight = useRef(new Animated.Value(0)).current;

    // Player and round state
    const matchSettings = new MatchSettings({
        nrOfPlayers: params.nrOfPlayers ? parseInt(params.nrOfPlayers) : 2,
        genreSetting: params.genreSetting,
        //selectionOfGenre: params.genre ? JSON.parse(params.genre) : [], Moved up to all other consts bcs it needs to be dynamic
        nrOfSongsToWinRound: params.points ? parseInt(params.points) : 3,
        nrOfRoundsToWinMatch: params.rounds ? parseInt(params.rounds) : 1,
        songDuration: params.duration ? parseInt(params.duration) : 30,
        nrOfGuessesOnBoard: params.guesses ? parseInt(params.guesses) : 3,
        icon1: params.icon1 || null,  // <--- assign the object directly
        icon2: params.icon2 || null,  // <--- assign the object directly
    });

    const isSinglePlayer = matchSettings.nrOfPlayers === 1;
    const { nrOfGuessesOnBoard } = matchSettings;

    const [player1, setPlayer1] = useState(
        new Player({ playerId: 1, playerIcon: params.icon1 || null })
    );
    const [player2, setPlayer2] = useState(
        isSinglePlayer ? null : new Player({ playerId: 2, playerIcon: params.icon2 || null })
    );

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

    // 🧠 Prefetch state refs (add these near your other useRef hooks)
    const prewarming = useRef(false);
    const prewarmedData = useRef(null);
    const playCoreRunning = useRef(false);      // actual song playback
    const playCorePrefetching = useRef(false);  // background prefetch



    const shouldShowCounter = matchSettings.nrOfRoundsToWinMatch > 1;


    const [allPlayedTracks, setAllPlayedTracks] = useState([]); // only once at component level

    //Check if there was a track playing before pausing game
    const wasPlayingBeforePause = useRef(false);
    const pausedForModal = useRef(false);
    const canPause = useRef(false);
    const playedSongs = useRef([]); // starts as an empty array

    //Between-round modal and the next genre gathered from it
    const [isBetweenRoundModalVisible, setBetweenRoundModalVisible] = useState(false);
    const [nextGenre, setNextGenre] = useState(null);

    const [selectionOfGenre, setSelectionOfGenre] = useState(
        params.genre
            ? JSON.parse(params.genre) // if params.genre is already {id, name}, this works
            : { id: params.genreId ? parseInt(params.genreId) : null, name: params.genreName || "Unknown" } // fallback object with shape
    );

    const [dividerTimer, setDividerTimer] = useState(matchSettings.songDuration);
    const dividerTimerRef = useRef(null);

    const [initialCountdown, setInitialCountdown] = useState(3);
    const [showInitialCountdown, setShowInitialCountdown] = useState(false);
    const initialCountdownRef = useRef(null);

    const bubbleScalesRef = useRef([]);
    //const bubbleScalesRef = useRef([new Animated.Value(1), new Animated.Value(1), new Animated.Value(1)]);
    const [exitTriggers, setExitTriggers] = useState([]);

    const bubbleScalesRefShrinkGrow = useRef([]);
    const [pressedShrink, setPressedShrink] = useState({
        1: {}, // player 1
        2: {}, // player 2
    });
    const [pressedOnce, setPressedOnce] = useState({
        1: {}, // player 1
        2: {}, // player 2
    });
    //global tracker to ensure player 1/2 cant press buttons after player 1/2 has already won the round
    const [correctBubblePressed, setCorrectBubblePressed] = useState(false);



    const [wrongGlowIndices, setWrongGlowIndices] = useState({});
    const [correctGlowIndices, setCorrectGlowIndices] = useState({});

    // --- Helper functions ---

    const resetRound = () => {
        //setCurrentRoundGenre(null);
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
        setPressedOnce({
            1: {},
            2: {},
        });
        if (player1CooldownTimer.current) clearInterval(player1CooldownTimer.current);
        if (player2CooldownTimer.current) clearInterval(player2CooldownTimer.current);
    };

const startInitialCountdown = (onFinish) => {
    if (initialCountdownRef.current) {
        clearInterval(initialCountdownRef.current);
        initialCountdownRef.current = null;
    }

    setShowInitialCountdown(true);
    let count = 3;
    setInitialCountdown(count);

    // ⚡ Start prefetch for next song during countdown
    if (!prewarmedData.current && !playCorePrefetching.current) {
        playCorePrefetching.current = true;
        handlePlayCore({ prefetch: true }).then(result => {
            prewarmedData.current = result;
            playCorePrefetching.current = false;
        }).catch(e => {
            console.warn("Prefetch failed:", e);
            playCorePrefetching.current = false;
        });
    }

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
                    setupNextRound();
                    //nextRound(1);
                }
                return newVal;
            });
        } else if (winningPlayerNum === 2) {
            setPlayer2RoundsWon(prev => {
                const newVal = prev + 1;
                if (newVal >= matchSettings.nrOfRoundsToWinMatch) {
                    endMatch(2);
                } else {
                    setupNextRound();
                    //nextRound(2);
                }
                return newVal;
            });
        }
    };

    const setupNextRound = () => {
        if (matchSettings.genreSetting == "Random") {
            console.log("spawn between round RANDOM genre modal here");
            setShowBetweenRoundRandom(true);
            //executeNextRound();
        } else if (matchSettings.genreSetting == "Custom") {
            console.log("spawn between round CUSTOM genre modal here");
            setShowBetweenRoundCustom(true);
            //executeNextRound();
        } else if (matchSettings.genreSetting == "Alternatives") {
            console.log("spawn between round ALTERNATIVES genre modal here")
            setShowBetweenRoundAlternatives(true);
            //executeNextRound();
        } else{
            console.log("ERROR: Unexpected genre setting provided")
            executeNextRound();
        }
        setBetweenRoundModalVisible(true);

    }

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

    // --- Helper to start the song transition ---
    const startSongTransition = (whichPlayerWonTheRound) => {
    const glowDuration = 1600;
    canPause.current = false; // ⛔ disable pausing during transition

    setTimeout(() => {
        songOptions.forEach((_, idx) => {
            triggerBubbleExit(idx);
        });
        setLastGuessPhase(false);
    }, 1000);
    
    isSongTransitionPendingRef.current = true; // ✅ mark pending

    // Clear any previous timeout
    if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
        transitionTimeoutRef.current = null;
    }

    transitionTimeoutRef.current = setTimeout(() => {
        transitionTimeoutRef.current = null;
        isSongTransitionPendingRef.current = false; // ✅ not pending anymore

        if (whichPlayerWonTheRound == 1) {
            handleEndOfRound(1);
        } else if (whichPlayerWonTheRound == 2) {
            handleEndOfRound(2);
        } else {
            // 🧠 During this countdown, prewarming will start automatically
            startInitialCountdown(async () => {
                setSongOptions([]);
                setPressedOnce({ 1: {}, 2: {} });

                    if (prewarmedData.current) {
                        const { songObj, options, correctTrack, newSound } = prewarmedData.current;
                        prewarmedData.current = null;

                        console.log("⚡ Instant start from prewarm cache");

                        setCurrentSongObj(songObj);
                        setSongOptions(options);

                        // If prewarmed sound exists, play it
                        if (newSound) {
                            setSound(newSound);
                            setIsPlaying(true);
                            canPause.current = true;

                            // Timer logic
                            setDividerTimer(matchSettings.songDuration);
                            if (dividerTimerRef.current) clearInterval(dividerTimerRef.current);
                            dividerTimerRef.current = setInterval(() => {
                                setDividerTimer(prev => {
                                    if (prev <= 1) {
                                        clearInterval(dividerTimerRef.current);
                                        setIsPlaying(false);
                                        setLastGuessPhase(true);
                                        setLastGuessUsed({1:false,2:false});
                                        newSound.unloadAsync().catch(e=>console.warn("Unload error:", e));
                                        setSound(null);
                                        return 0;
                                    }
                                    return prev-1;
                                });
                            }, 1000);
                        }

                        prewarmNextRound(); // Background prefetch next song
                    } else {
                        // fallback if prewarm not ready
                        await handlePlayCore();
                    }


            });

        }
    }, glowDuration);
};

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
                duration: 150,
                easing: Easing.out(Easing.quad),
                useNativeDriver: false,
            }),
            Animated.timing(glowAnim, {
                toValue: 0,
                duration: 500,
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

            primaryBackgroundColorRef.current = mixed;
        });

        return () => {
            glowAnim.removeListener(listener);
        };
    }, [glowAnim]);

    const triggerGreenGlowBackgroundRight = () => {
        // Animate from 0 → 1 → 0
        glowAnimRight.setValue(0);
        Animated.sequence([
            Animated.timing(glowAnimRight, {
                toValue: 1,
                duration: 150,
                easing: Easing.out(Easing.quad),
                useNativeDriver: false,
            }),
            Animated.timing(glowAnimRight, {
                toValue: 0,
                duration: 150,
                easing: Easing.in(Easing.quad),
                useNativeDriver: false,
            }),
        ]).start();
    };

    useEffect(() => {
        const normalColor = [0.337, 0.388, 0.769]; // your purple base
        const greenColor = [0.0, 0.6, 0.4]; // bright green flash

        const listener = glowAnimRight.addListener(({ value }) => {
            // linear interpolation
            const mixed = [
                normalColor[0] + (greenColor[0] - normalColor[0]) * value,
                normalColor[1] + (greenColor[1] - normalColor[1]) * value,
                normalColor[2] + (greenColor[2] - normalColor[2]) * value,
            ];
            secondaryBackgroundColorRef.current = mixed;
        });

        return () => {
            glowAnimRight.removeListener(listener);
        };
    }, [glowAnimRight]);



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
        if (canPause.current === true) {
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
                setShowPause(true);

                // stop UI play flag
                setIsPlaying(false);
            } catch (e) {
                console.error("pauseAll error", e);
            }
        };
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
        setLastGuessPhase(false);
        resetRound();


        startInitialCountdown(() => {
            handlePlayCore(); // or your rematch-start logic
        });
    };
    const handleBackToMenu = () => {
        setShowRematch(false);
        router.push("/");
        //setDividerPos(1.1);
    };

    const handleBackToMenuFromPause = () => {
        setShowPause(false);
        router.push("/");
        //setDividerPos(1.1);
    };

    const executeNextRound = (newGenre) => {


        if (matchSettings.genreSetting == "Random") {
            setSelectionOfGenre(newGenre);
            console.log("New genre: ", selectionOfGenre.id, "name: ", selectionOfGenre.name);
        } else if (matchSettings.genreSetting == "Custom") {

        } else if (matchSettings.genreSetting == "Alternatives") {

        } else {
            console.log("ERROR: Unexpected genre setting provided")

        }

        //setMatchSettings(prev => ({ ...prev, selectionOfGenre: newGenre }));
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
                setTimeout(() => handlePlayCore({ genreOverride: newGenre }), 100);
            }
        }, 900);
    };

    // Put these near the top of your component
const searchCacheRef = useRef(new Map()); // key = `${genreId}|${term}`
const cacheTTL = 60 * 1000; // 60s
const concurrentLimit = 3; // how many fetches to run at once (tuneable)
const maxAttempts = 10;

// Utility helpers
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

async function fetchSearchTerm(term, genreId, signal) {
  const cacheKey = `${genreId}|${term}`;
  const cached = searchCacheRef.current.get(cacheKey);
  const now = Date.now();
  if (cached && (now - cached.ts) < cacheTTL) {
    return cached.data;
  }

  const params = new URLSearchParams({
    term,
    media: "music",
    entity: "song",
    genreId: String(genreId),
    limit: "200"
  });

  try {
    const res = await fetch(`https://itunes.apple.com/search?${params.toString()}`, { signal });
    const json = await res.json();
    searchCacheRef.current.set(cacheKey, { ts: Date.now(), data: json });
    return json;
  } catch (e) {
    // fetch aborted or network error
    if (e.name === "AbortError") return null;
    console.warn("fetchSearchTerm error", term, e);
    return null;
  }
}

const previouslyPlayedArtists = new Set(
  (playedSongs.current || []).map(s => s.artistName?.toLowerCase())
);


/**
 * Run batched concurrent searches for a list of terms until we find >= needed tracks.
 * - terms: array of candidate terms (already shuffled)
 * - genreId, expectedGenreSub, playedTrackIds (Set), needed (nrOfGuesses)
 */
async function findTracksConcurrently({
  terms,
  genreId,
  expectedGenreSub,
  playedTrackIds,
  needed,
  disallowedArtists = new Set(),   // 👈 already-played artists
  enforceUniqueArtists = true      // 👈 filter duplicates within same batch
}) {
  const controllers = [];
  const maxAttempts = 10;
  let attempts = 0;
  let candidates = [];

  while (candidates.length < needed && attempts < maxAttempts) {
    attempts++;
    console.log(`🔄 findTracksConcurrently attempt ${attempts}`);

    const shuffledTerms = [...terms];
    shuffleArray(shuffledTerms); // change order each attempt

    for (const term of shuffledTerms) {
      const controller = new AbortController();
      controllers.push(controller);

      try {
        const data = await fetchSearchTerm(term, genreId, controller.signal);
        if (!data?.results?.length) continue;

        const usable = data.results.filter(t => {
          const artist = t.artistName?.toLowerCase() || "";
          return (
            t.previewUrl &&
            !playedTrackIds.has(t.trackId) &&
            (t.primaryGenreName || "").toLowerCase().includes(expectedGenreSub) &&
            !disallowedArtists.has(artist) // 👈 skip already-played artist
          );
        });

        // add usable tracks, enforcing unique artists inside this batch
        for (const t of usable) {
          const artist = t.artistName?.toLowerCase() || "";

          // enforce unique artists among candidates
          if (enforceUniqueArtists && candidates.some(c => c.artistName?.toLowerCase() === artist)) {
            continue;
          }

          if (!candidates.find(c => c.trackId === t.trackId)) {
            candidates.push(t);
          }

          if (candidates.length >= needed) break;
        }

        if (candidates.length >= needed) break;

      } catch (err) {
        console.warn(`⚠️ Term "${term}" fetch failed:`, err);
      }
    }

    if (candidates.length >= needed) {
      // done — abort remaining
      controllers.forEach(c => c.abort && c.abort());
      break;
    }
  }

  // cleanup and dedupe
  controllers.forEach(c => { try { c.abort(); } catch (_) {} });
  const uniqueById = Array.from(new Map(candidates.map(t => [t.trackId, t])).values());
  return uniqueById;
}



/**
 * Optional helper: call this during your 3-second countdown to prewarm searches.
 * It stores result in cache so handlePlayCore can resolve quickly.
 * Example usage: On countdown start -> prewarmNextRound(selectionOfGenre)
 */
const prewarmNextRound = async () => {
  if (prewarming.current || playCoreRunning.current) return;

  prewarming.current = true;
  console.log("🔥 Prewarming next round...");

  try {
    const nextRoundData = await handlePlayCore({ prefetch: true });
    if (nextRoundData) prewarmedData.current = nextRoundData;
  } catch (e) {
    console.warn("Prewarm failed:", e);
  } finally {
    prewarming.current = false;
  }
};



const handlePlayCore = async (opts = {}) => {
    const prefetchMode = opts.prefetch ?? false;
    const timer = makeTimer("handlePlayCore");
    const startTime = Date.now();

    

    // 🔒 separate locks for playback vs prefetch
    if (prefetchMode) {
        if (playCorePrefetching.current) {
            console.log("⏳ handlePlayCore prefetch skipped — already running");
            return null;
        }
        playCorePrefetching.current = true;
    } else {
        if (playCoreRunning.current) {
            console.log("⏳ handlePlayCore skipped — already running");
            return null;
        }
        playCoreRunning.current = true;
    }

    console.log("🎵 handlePlayCore start", prefetchMode ? "(prefetch)" : "");

    try {
        timer.mark("init start");

        // Reset states for playback
        if (!prefetchMode) {
            if (showRematch) setShowRematch(false);
            setLoading(true);
            setCorrectPressed(false);
            setLastGuessPhase(false);
            setLastGuessUsed({ 1: false, 2: false });

            if (sound) {
                sound.unloadAsync().catch(e => console.warn("Warning unloading previous sound:", e));
                setSound(null);
            }
        }

        // Determine genre
        let expectedGenreId = opts.genreOverride?.id ?? selectionOfGenre?.id;
        let expectedGenreName = opts.genreOverride?.name ?? selectionOfGenre?.name;

        if (!expectedGenreId) {
            const randomGenre = ITUNES_GENRES[Math.floor(Math.random() * ITUNES_GENRES.length)];
            expectedGenreId = randomGenre.id;
            expectedGenreName = randomGenre.name;
            if (!prefetchMode) setCurrentRoundGenre(randomGenre);
        }

        if (!expectedGenreId) {
            Alert.alert("Error", "No genre selected!");
            if (!prefetchMode) setLoading(false);
            return;
        }

        const nrOfGuesses = matchSettings.nrOfGuessesOnBoard || 3;
        const playedSet = new Set(Array.from(playedTrackIds || []));

        // Generate candidate terms for search
        const allowedLetters = 'abcdefghijklmnopqrstuvwxyz'.split('');
        const jazzTerms = ["jazz","sax","swing","blue","bebop","smooth","fusion","cool","trumpet","piano"];
        const bluesTerms = ["blues","delta","guitar","soul","rhythm","shuffle","harmonica","slide","bottleneck","bluesrock"];
        let candidateTerms = expectedGenreId === 11 ? [...jazzTerms]
                            : expectedGenreId === 3 ? [...bluesTerms]
                            : [...allowedLetters];
        shuffleArray(candidateTerms);

        // --- 🔄 Retry loop for prefetch or rare genres ---
        let optionsTracks = [];
        let attempts = 0;
        while (optionsTracks.length < nrOfGuesses && attempts < 5) {
            console.log(prefetchMode ? `🔥 Prefetch attempt ${attempts+1}` : `🔄 Find tracks attempt ${attempts+1}`);
            optionsTracks = await findTracksConcurrently({
            terms: opts.terms || candidateTerms,
            genreId: expectedGenreId,
            expectedGenreSub: expectedGenreName.toLowerCase(),
            playedTrackIds: playedSet,
            needed: nrOfGuesses,
            disallowedArtists: previouslyPlayedArtists, 
            enforceUniqueArtists: true                  
            });

            attempts++;
        }

        if (optionsTracks.length < nrOfGuesses && !prefetchMode) {
            console.warn("⚠️ Not enough tracks found after retries");
            Alert.alert("Not Enough Tracks", "Returning to front page.");
            setLoading(false);
            router.push("/");
            return null;
        }

        // Pick correct track
        let correctTrackIdx = Math.floor(Math.random()*optionsTracks.length);
        let correctTrack = optionsTracks[correctTrackIdx];

        if (!prefetchMode) {
            // Update played tracks
            playedSongs.current.push({ trackName: correctTrack.trackName, artistName: correctTrack.artistName });
            setPlayedTrackIds(prev => {
                const newSet = new Set(prev);
                optionsTracks.forEach(t => newSet.add(t.trackId));
                return newSet;
            });
            setAllPlayedTracks(prev => {
                const existingIds = new Set(prev.map(p=>p.trackId));
                return [...prev, ...optionsTracks.filter(t=>!existingIds.has(t.trackId))];
            });
        }

        // Build Song object
        const songObj = new Song({
            songId: correctTrack.trackId,
            songGenre: correctTrack.primaryGenreName,
            songFile: correctTrack.previewUrl,
            songTitle: correctTrack.trackName,
            songArtist: correctTrack.artistName,
            songDuration: matchSettings.songDuration || 30,
            songArtistAlternatives: [],
        });

        const options = optionsTracks.slice(0,nrOfGuesses).map((t, idx) => ({
            title: t.trackName || "Unknown Title",
            artist: t.artistName || "Unknown Artist",
            previewUrl: t.previewUrl,
            isCorrect: idx === correctTrackIdx,
        }));

        if (!options.some(o => o.isCorrect)) {
            correctTrackIdx = 0;
            options[0].isCorrect = true;
            correctTrack = optionsTracks[0];
        }

        if (!prefetchMode) {
            setCurrentSongObj(songObj);
            setSongOptions(options);
        }

        // Create sound
        const { sound: newSound } = await Audio.Sound.createAsync(
            { uri: correctTrack.previewUrl },
            { shouldPlay: !prefetchMode }
        );

        if (!prefetchMode) {
            setSound(newSound);
            setIsPlaying(true);
            canPause.current = true;

            // Timer logic
            setDividerTimer(matchSettings.songDuration);
            if (dividerTimerRef.current) clearInterval(dividerTimerRef.current);
            dividerTimerRef.current = setInterval(() => {
                setDividerTimer(prev => {
                    if (prev <= 1) {
                        clearInterval(dividerTimerRef.current);
                        setIsPlaying(false);
                        setLastGuessPhase(true);
                        setLastGuessUsed({ 1:false, 2:false });
                        newSound.unloadAsync().catch(e => console.warn("Unload error:", e));
                        setSound(null);
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
        }

        timer.mark("after Audio.Sound.createAsync (sound ready)");

        if (prefetchMode) {
            console.log(`✅ Prefetched in ${(Date.now()-startTime)/1000}s`);
            return { songObj, options, newSound, correctTrack };
        }

        setLoading(false);
        timer.end();

    } catch(err) {
        console.error("Error playing preview:", err);
        if (!prefetchMode) {
            Alert.alert("Error", "Failed to play preview");
            setIsPlaying(false);
            setLoading(false);
        }
        timer.end();
    } finally {
        if (prefetchMode) playCorePrefetching.current = false;
        else playCoreRunning.current = false;
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

    useEffect(() => {
        setExitTriggers(songOptions.map(() => false));
    }, [songOptions]);

    // useEffect(() => {
    //     bubbleScalesRef.current = songOptions.map(() => new Animated.Value(1));
    // }, [songOptions]);

    useEffect(() => {
        setExitTriggers(songOptions.map(() => false));
        setPressedShrink({ 1: {}, 2: {} });
    }, [songOptions]);

    // Initial countdown
    useEffect(() => {
        setupNextRound();
        console.log("STARTING INITIAL COUNTDOWN ON MOUNT");
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

    const triggerBubbleExit = (index) => {
        setExitTriggers(prev => {
            const updated = [...prev];
            updated[index] = true;
            return updated;
        });
    };

    const triggerPressedShrink = (playerNumber, index) => {
        setPressedShrink((prev) => ({
            ...prev,
            [playerNumber]: {
                ...prev[playerNumber],
                [index]: true,
            },
        }));
    };

    const shrinkAllExceptCorrect = (playerNum) => {
        // playerNum = the player who pressed the correct bubble

        [1, 2].forEach((side) => {
            songOptions.forEach((option, idx) => {
                // On the side of the player who pressed correctly, skip correct bubble
                if (side === playerNum && option.isCorrect) return;

                // Otherwise, shrink
                triggerPressedShrink(side, idx);
            });
        });
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

        //Refuse guesses after right guess has been made this song, needed now when buttons dont disappear immediately
        if (correctPressed) return;

        // Prevent multiple presses on same bubble 
        if (pressedOnce[playerNum]?.[idx]) return;

        // mark bubble as pressed
        setPressedOnce(prev => ({
            ...prev,
            [playerNum]: {
                ...prev[playerNum],
                [idx]: true,
            },
        }));


        // --- Last-guess-phase handling (unchanged) ---
        if (lastGuessPhase) {
            if (lastGuessUsed[playerNum]) return;
            setLastGuessUsed(prev => ({ ...prev, [playerNum]: true }));

            const guesser = playerNum; // the one who guessed
            const opponent = playerNum === 1 ? 2 : 1; // the other player

            if (isCorrect) {
                // ✅ Correct: point to guesser
                if (guesser === 1) {
                    const newPoints = player1Points + 1;
                    setPlayer1Points(newPoints);
                    triggerGreenGlowBackground();
                    shrinkAllExceptCorrect(1)
                    triggerGreenGlow(guesser, idx);

                    if (newPoints >= matchSettings.nrOfSongsToWinRound) {
                        setRoundWinner(1);
                        startSongTransition(1);
                    } else { startSongTransition(null); }
                }
                else {
                    const newPoints = player2Points + 1;
                    setPlayer2Points(newPoints);
                    triggerGreenGlowBackgroundRight();
                    shrinkAllExceptCorrect(2)
                    triggerGreenGlow(guesser, idx);

                    if (newPoints >= matchSettings.nrOfSongsToWinRound) {
                        setRoundWinner(2);
                        startSongTransition(2);
                    } else { startSongTransition(null); }
                }


            } else {
                // ❌ Wrong: point to opponent
                if (opponent === 1) {
                    const newPoints = player1Points + 1;
                    setPlayer1Points(newPoints);
                    triggerGreenGlowBackground();
                    shrinkAllExceptCorrect(1)
                    triggerRedGlow(guesser, idx);

                    if (newPoints >= matchSettings.nrOfSongsToWinRound) {
                        setRoundWinner(1);
                        startSongTransition(1);
                    } else { startSongTransition(null); }

                }
                else {
                    const newPoints = player2Points + 1;
                    setPlayer2Points(newPoints);
                    triggerGreenGlowBackgroundRight();
                    shrinkAllExceptCorrect(2)
                    triggerRedGlow(guesser, idx);

                    if (newPoints >= matchSettings.nrOfSongsToWinRound) {
                        setRoundWinner(2);
                        startSongTransition(2);
                    } else { startSongTransition(null); }
                }

            }

            // Check if anyone reached win condition, oved into if-statements above
            // const updatedP1 = (guesser === 1 ? player1Points + (isCorrect ? 1 : 0) : player1Points + (!isCorrect ? 1 : 0));
            // const updatedP2 = (guesser === 2 ? player2Points + (isCorrect ? 1 : 0) : player2Points + (!isCorrect ? 1 : 0));

            // if (updatedP1 >= matchSettings.nrOfSongsToWinRound) startSongTransition(1);
            // else if (updatedP2 >= matchSettings.nrOfSongsToWinRound) startSongTransition(2);
            // else handlePlayCore();

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

            bubbleScalesRef.current.forEach((anim, i) => {
                Animated.spring(anim, {
                    toValue: 0,
                    friction: 6,
                    tension: 100,
                    useNativeDriver: true,
                }).start();
            });
            if (playerNum === 1) {
                const newPoints = player1Points + 1;
                setPlayer1Points(newPoints);
                if (newPoints >= matchSettings.nrOfSongsToWinRound) {
                    setRoundWinner(1);
                    startSongTransition(1);
                    //handleEndOfRound(1); moved into songtransition
                    triggerGreenGlowBackground();
                    shrinkAllExceptCorrect(1)
                }
                else {
                    shrinkAllExceptCorrect(1)
                    startSongTransition(null);

                    triggerGreenGlowBackground();
                }
            } else {
                const newPoints = player2Points + 1;
                setPlayer2Points(newPoints);
                if (newPoints >= matchSettings.nrOfSongsToWinRound) {
                    //handleEndOfRound(2);
                    setRoundWinner(2);
                    startSongTransition(2);
                    shrinkAllExceptCorrect(2)
                    triggerGreenGlowBackgroundRight();
                }
                else startSongTransition(null);
                shrinkAllExceptCorrect(2)

                triggerGreenGlowBackgroundRight();
            }

            triggerGreenGlow(playerNum, idx);
        } else {
            // wrong guess -> glow + start cooldown
            triggerRedGlow(playerNum, idx);
            triggerPressedShrink(playerNum, idx);
            startCooldown(playerNum);
        }
    };


    // --- Render helpers ---
    const PointsRow = ({ points }) => (
        <View style={{ flexDirection: "row" }}>
            {Array.from({ length: Math.max(1, matchSettings.nrOfSongsToWinRound) }).map((_, i) => (
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

            {canPause.current && (
                <View style={styles.topRightButtons}>
                    <TouchableOpacity
                        onPress={() => { pauseAll(); }}
                        style={styles.settingsButton}
                    >
                        <Text style={styles.settingsText}>⏸</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Singleplayer Cooldown Overlay */}
            {player1Cooldown && isSinglePlayer && (
                <View style={[styles.cooldownOverlayFull]} pointerEvents="auto">
                    <View style={styles.cooldownBubble}>
                        <Text style={styles.cooldownTextBig}>{player1CooldownTime}</Text>
                    </View>
                </View>
            )}

            {/* Player 1 Cooldown Overlay */}
            {player1Cooldown && !isSinglePlayer && (
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
                {/* Left side (Player 1) */}
                <View style={styles.sideWrapperLeft}>
                    <View style={styles.sideRow}>
                        <View style={styles.pointsAndRoundRowPlayer1}>
                            <PointsRow points={player1Points} style={styles.player1PointsCss} />
                            {shouldShowCounter && (
                                <RoundsRow
                                    won={player1RoundsWon}
                                    total={matchSettings.nrOfRoundsToWinMatch}
                                    filledStyle={styles.roundCircleFilledP1}
                                />
                            )}
                        </View>

                        <View style={styles.largeIconCircle}>
                            <Text style={styles.largeIconText}>{player1.playerIcon}</Text>
                        </View>
                    </View>
                </View>

                {/* Center divider */}
                <View style={styles.dividerContainer}>
                    <View style={styles.dividerBlock}>
                        <Text style={styles.dividerTimerText}>{dividerTimer}</Text>
                        <View
                            style={[
                                styles.dividerBar,
                                { width: `${(dividerTimer / matchSettings.songDuration) * 100}%` },
                            ]}
                        />
                    </View>
                </View>

                {/* Right side (Player 2 placeholder or actual player) */}
                <View style={styles.sideWrapperRight}>
                    {!isSinglePlayer && (
                        <View style={styles.sideRow}>
                            <View style={styles.largeIconCircle}>
                                <Text style={styles.largeIconText}>{player2.playerIcon}</Text>
                            </View>

                            <View style={styles.pointsAndRoundRowPlayer2}>
                                <PointsRow points={player2Points} />
                                {shouldShowCounter && (
                                    <RoundsRow
                                        won={player2RoundsWon}
                                        total={matchSettings.nrOfRoundsToWinMatch}
                                        filledStyle={styles.roundCircleFilledP2}
                                    />
                                )}
                            </View>
                        </View>
                    )}
                </View>
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
                {isSinglePlayer ? (
                    // 🧍 Single Player Mode
                    <View style={styles.singleColumn}>
                        {songOptions
                            .filter(Boolean)
                            .slice(0, nrOfGuessesOnBoard)
                            .map((option, idx) => (
                                <GuessBubble
                                    key={`sp-${idx}`}
                                    option={option}
                                    onPress={() => handleGuess(option.isCorrect, 1, idx)}
                                    animatedIndex={idx}
                                    positionStyle={SINGLE_BUBBLE_POSITIONS[nrOfGuessesOnBoard][idx]}
                                    externalScale={bubbleScalesRef.current[idx]}
                                    exitTrigger={exitTriggers[idx]}
                                    pressedShrink={pressedShrink[1]?.[idx]}
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
                ) : (
                    // 👥 Multiplayer Mode
                    <View style={styles.playArea}>
                        <View style={styles.sideColumn}>
                            {songOptions
                                .filter(Boolean)
                                .slice(0, nrOfGuessesOnBoard)
                                .map((option, idx) => (
                                    <GuessBubble
                                        key={`p1-${idx}`}
                                        option={option}
                                        onPress={() => handleGuess(option.isCorrect, 1, idx)}
                                        animatedIndex={idx}
                                        positionStyle={LEFT_BUBBLE_POSITIONS[nrOfGuessesOnBoard][idx]}
                                        exitTrigger={exitTriggers[idx]}
                                        pressedShrink={pressedShrink[1]?.[idx]}
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

                        <View style={styles.sideColumn}>
                            {songOptions
                                .filter(Boolean)
                                .slice(0, nrOfGuessesOnBoard)
                                .map((option, idx) => (
                                    <GuessBubble
                                        key={`p2-${idx}`}
                                        option={option}
                                        onPress={() => handleGuess(option.isCorrect, 2, idx)}
                                        animatedIndex={idx}
                                        positionStyle={RIGHT_BUBBLE_POSITIONS[nrOfGuessesOnBoard][idx]}
                                        exitTrigger={exitTriggers[idx]}
                                        pressedShrink={pressedShrink[2]?.[idx]}
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
                    </View>
                )}
            </View>

            {/* Loading Overlay
            {loading && (
                <View style={styles.loaderOverlay}>
                    <ActivityIndicator size="large" color="#5C66C5" />
                    <Text style={styles.loaderText}>Loading song preview..</Text>
                </View>
            )} */}


            {/* Return Overlay */}
            <RematchModal
                visible={showRematch}
                onRematch={handleRematch}
                onBackToMenu={handleBackToMenu}
                matchWinnerId={matchWinner}
                playedSongs={playedSongs.current}
            />
            <PauseMatch
                visible={showPause}
                resumeMatch={() => { setShowPause(false); resumeAll(); }}
                onBackToMenu={handleBackToMenuFromPause}
            />

            <BetweenRoundModalRandom
                visible={showBetweenRoundRandom}
                roundWinner={roundWinner}
                currentGenre={matchSettings.selectionOfGenre}
                onCloseAndProceed={(newGenre) => {
                    setShowBetweenRoundRandom(false);
                    executeNextRound(newGenre);
                }}
            />
            
            <BetweenRoundModalAlternatives
                visible={showBetweenRoundAlternatives}
                roundWinner={roundWinner}
                currentGenre={matchSettings.selectionOfGenre}
                onCloseAndProceed={(newGenre) => {
                    setShowBetweenRoundAlternatives(false);
                    executeNextRound(newGenre);
                }}
            />

            <BetweenRoundModalCustom
                visible={showBetweenRoundCustom}
                roundWinner={roundWinner}
                currentGenre={matchSettings.selectionOfGenre}
                onCloseAndProceed={(newGenre) => {
                    setShowBetweenRoundCustom(false);
                    executeNextRound(newGenre);
                }}
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
    cooldownOverlayFull: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        width: '100%',
        height: '100%',
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
        fontFamily: 'OutfitBold',
        fontSize: 54,
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",

    },
    sideWrapperLeft: {
        flex: 1, // ensures equal space left and right
        alignItems: "flex-end",
    },
    sideWrapperRight: {
        flex: 1, // ensures equal space left and right
        alignItems: "flex-start",
    },
    sideRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginHorizontal: 8,

    },
    pointsAndRoundRowPlayer1: {
        alignItems: "flex-end",
        gap: 3,
    },
    pointsAndRoundRowPlayer2: {
        alignItems: "flex-start",
        gap: 3,
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
        backgroundColor: "transparent",
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

    dividerContainer: {
        width: 100, // or match your dividerBlock width
        alignItems: "center",
        justifyContent: "center",
    },
    dividerBlock: {
        width: 80,
        height: 46,
        backgroundColor: "white",
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10,
    },
    dividerTimerText: { color: "black", fontSize: 18 },
    loaderOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.6)", // semi-transparent overlay
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999, // keep above everything else
    },

    loaderText: {
        color: "#fff",
        marginTop: 10,
        fontSize: 16,
    },

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
        zindex: 9999,
    },
    settingsText: {
        fontSize: 24,
    }
});