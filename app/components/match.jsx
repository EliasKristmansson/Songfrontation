import { Audio } from "expo-av";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Button,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import PreGameMenuHeader from "./preGameMenuHeader";

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
    const [currentSongObj, setCurrentSongObj] = useState(null); // Song class instance
    const [songOptions, setSongOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [correctPressed, setCorrectPressed] = useState(false);

    // Score and round state
    const [player1, setPlayer1] = useState(new Player({ playerId: 1, playerIcon: "🎤" }));
    const [player2, setPlayer2] = useState(new Player({ playerId: 2, playerIcon: "🎸" }));
    const [player1Points, setPlayer1Points] = useState(0);
    const [player2Points, setPlayer2Points] = useState(0);
    const [roundWinner, setRoundWinner] = useState(null);

    // Match settings: first to 3 points wins the round, first to 1 round wins the match
    const matchSettings = new MatchSettings({
        nrOfPlayers: 2,
        selectionOfGenre: [],
        nrOfSongsToWinRound: 3,
        nrOfRoundsToWinMatch: 1,
        songDuration: 30,
        nrOfGuessesOnBoard: 3,
    });
    const matchGame = new MatchGame({ players: [player1, player2], matchSettings });

    // Helper to reset points for new round
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
    };

    // Fetch 25 random songs and pick 3 for the board
    const handlePlay = async () => {
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

            // Pick a random track with a preview
            const tracksWithPreview = data.results.filter(t => t.previewUrl);
            if (tracksWithPreview.length < 3) {
                Alert.alert("Not enough previews", "Could not find enough tracks with previews.");
                setLoading(false);
                return;
            }

            // Pick the correct song
            const correctTrackIdx = Math.floor(Math.random() * tracksWithPreview.length);
            const correctTrack = tracksWithPreview[correctTrackIdx];

            // Create Song class instance for the correct song
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

            // Pick 2 other random tracks (not the correct one)
            let indices = [correctTrackIdx];
            while (indices.length < 3) {
                const idx = Math.floor(Math.random() * tracksWithPreview.length);
                if (!indices.includes(idx)) indices.push(idx);
            }
            // Shuffle indices for randomness
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

            newSound.setOnPlaybackStatusUpdate(status => {
                if (status.didJustFinish) {
                    setIsPlaying(false);
                    newSound.unloadAsync();
                    setSound(null);
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

    // Handle answer selection
    const handleGuess = async (isCorrect, playerNum) => {
        if (isCorrect) {
            setCorrectPressed(true);
            if (sound) {
                await sound.unloadAsync();
                setSound(null);
                setIsPlaying(false);
            }
            // Update Song object state
            if (currentSongObj) {
                currentSongObj.hasWonSong = true;
                currentSongObj.songWinnerId = playerNum;
            }
            // Update player score
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
                        { text: "Next Song", onPress: resetRound }
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
                        { text: "Next Song", onPress: resetRound }
                    ]);
                }
            }
        } else {
            Alert.alert("Wrong!", "Try again!");
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <PreGameMenuHeader title="Song Quiz" style={styles.header} />

            {/* Scoreboard & Rounds */}
            <View style={styles.scoreboard}>
                <View style={styles.playerColumn}>
                    <Text style={styles.playerIcon}>{player1.playerIcon}</Text>
                    <Text style={styles.playerName}>Player 1</Text>
                    <Text>Score: {player1Points} / {matchSettings.nrOfSongsToWinRound}</Text>
                </View>
                <View style={styles.playerColumn}>
                    <Text style={styles.playerIcon}>{player2.playerIcon}</Text>
                    <Text style={styles.playerName}>Player 2</Text>
                    <Text>Score: {player2Points} / {matchSettings.nrOfSongsToWinRound}</Text>
                </View>
            </View>
            <Text style={styles.instructions}>
                First to {matchSettings.nrOfSongsToWinRound} points wins the match!
            </Text>

            {currentTrack && (
                <Text style={styles.nowPlaying}>
                    🎶 Now Playing: {currentTrack.title} - {currentTrack.artist}
                </Text>
            )}

            <Button
                title="Play Random Song Preview"
                onPress={handlePlay}
                disabled={isPlaying || loading || !!roundWinner}
            />

            {loading && <ActivityIndicator size="large" color="#5C66C5" style={styles.loader} />}

            {/* Game Board */}
            {songOptions.length === 3 && !roundWinner && (
                <View style={styles.gameBoard}>
                    {/* Player 1 */}
                    <View style={styles.playerGuessColumn}>
                        <Text style={styles.playerGuessLabel}>Player 1</Text>
                        {songOptions.map((option, idx) => (
                            <TouchableOpacity
                                key={`p1-${idx}`}
                                style={styles.optionButton}
                                onPress={() => handleGuess(option.isCorrect, 1)}
                                disabled={correctPressed || !isPlaying}
                            >
                                <Text style={styles.optionText}>
                                    {option.title}{"\n"}
                                    <Text style={styles.optionArtist}>{option.artist}</Text>
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    {/* Player 2 */}
                    <View style={styles.playerGuessColumn}>
                        <Text style={styles.playerGuessLabel}>Player 2</Text>
                        {songOptions.map((option, idx) => (
                            <TouchableOpacity
                                key={`p2-${idx}`}
                                style={styles.optionButton}
                                onPress={() => handleGuess(option.isCorrect, 2)}
                                disabled={correctPressed || !isPlaying}
                            >
                                <Text style={styles.optionText}>
                                    {option.title}{"\n"}
                                    <Text style={styles.optionArtist}>{option.artist}</Text>
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            )}

            <View style={styles.footer}>
                <Button
                    title="Go to Front Page"
                    onPress={() => router.push("/")}
                />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        flexGrow: 1,
    },
    header: {
        fontSize: 22,
        marginBottom: 20,
        fontFamily: "OutfitBold",
        color:"white",
    },
    scoreboard: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 20,
    },
    playerColumn: {
        alignItems: "center",
        flex: 1,
    },
    playerIcon: {
        fontSize: 28,
    },
    playerName: {
        fontWeight: "bold",
    },
    instructions: {
        textAlign: "center",
        marginBottom: 10,
    },
    nowPlaying: {
        marginBottom: 10,
    },
    loader: {
        marginTop: 20,
    },
    gameBoard: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 30,
    },
    playerGuessColumn: {
        flex: 1,
        alignItems: "center",
    },
    playerGuessLabel: {
        fontWeight: "bold",
        marginBottom: 10,
    },
    optionButton: {
        backgroundColor: "#5C66C5",
        padding: 12,
        borderRadius: 10,
        marginVertical: 6,
        width: 180,
    },
    optionText: {
        color: "white",
        textAlign: "center",
    },
    optionArtist: {
        fontSize: 12,
        color: "#e0e0e0",
    },
    footer: {
        marginTop: 30,
    },
});
