import { Audio } from "expo-av";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Button, Text, TouchableOpacity, View } from "react-native";

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

// Fetch random track from iTunes
async function fetchRandomiTunesTrack() {
  try {
    const randomTerm = SEARCH_TERMS[Math.floor(Math.random() * SEARCH_TERMS.length)];
    const res = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(randomTerm)}&entity=song&limit=25`
    );

    const data = await res.json();
    if (!data.results || data.results.length === 0) return null;

    // Pick a random track with a preview
    const tracksWithPreview = data.results.filter(t => t.previewUrl);
    if (tracksWithPreview.length === 0) return null;

    const track = tracksWithPreview[Math.floor(Math.random() * tracksWithPreview.length)];

    return {
      title: track.trackName,
      artist: track.artistName,
      previewUrl: track.previewUrl,
    };
  } catch (err) {
    console.error("Error fetching random iTunes track:", err);
    return null;
  }
}



export default function Match() {
  const router = useRouter();
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [songOptions, setSongOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [correctPressed, setCorrectPressed] = useState(false);

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
  const handleGuess = async (isCorrect) => {
    if (isCorrect) {
      setCorrectPressed(true);
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
        setIsPlaying(false);
      }
      Alert.alert("Correct!", "You guessed the right song!", [
        { text: "OK", onPress: () => router.push("/") }
      ]);
    } else {
      Alert.alert("Wrong!", "Try again!");
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 22, marginBottom: 20 }}>Song Quiz 🎵</Text>

      {currentTrack && (
        <Text style={{ marginBottom: 10 }}>
          🎶 Now Playing: {currentTrack.title} - {currentTrack.artist}
        </Text>
      )}

      <Button
        title="Play Random Song Preview"
        onPress={handlePlay}
        disabled={isPlaying || loading}
      />

      {loading && (
        <ActivityIndicator size="large" color="#5C66C5" style={{ marginTop: 20 }} />
      )}

      {/* Game Board */}
      {songOptions.length === 3 && (
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 30 }}>
          {/* Player 1 */}
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={{ fontWeight: "bold", marginBottom: 10 }}>Player 1</Text>
            {songOptions.map((option, idx) => (
              <TouchableOpacity
                key={`p1-${idx}`}
                style={{
                  backgroundColor: "#5C66C5",
                  padding: 12,
                  borderRadius: 10,
                  marginVertical: 6,
                  width: 180,
                }}
                onPress={() => handleGuess(option.isCorrect)}
                disabled={correctPressed || !isPlaying}
              >
                <Text style={{ color: "white", textAlign: "center" }}>
                  {option.title}{"\n"}<Text style={{ fontSize: 12, color: "#e0e0e0" }}>{option.artist}</Text>
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {/* Player 2 */}
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={{ fontWeight: "bold", marginBottom: 10 }}>Player 2</Text>
            {songOptions.map((option, idx) => (
              <TouchableOpacity
                key={`p2-${idx}`}
                style={{
                  backgroundColor: "#5C66C5",
                  padding: 12,
                  borderRadius: 10,
                  marginVertical: 6,
                  width: 180,
                }}
                onPress={() => handleGuess(option.isCorrect)}
                disabled={correctPressed || !isPlaying}
              >
                <Text style={{ color: "white", textAlign: "center" }}>
                  {option.title}{"\n"}<Text style={{ fontSize: 12, color: "#e0e0e0" }}>{option.artist}</Text>
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <View style={{ marginTop: 30 }}>
        <Button
          title="Go to Front Page"
          onPress={() => router.push("/")}
        />
      </View>
    </View>
  );
}
