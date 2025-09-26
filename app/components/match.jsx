import { Audio } from "expo-av";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Button, Text, View } from "react-native";

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

class Match {
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

  const handlePlay = async () => {
    try {
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }

      const track = await fetchRandomiTunesTrack();
      if (!track) {
        Alert.alert("No Preview", "Could not find a track with a preview.");
        return;
      }

      setCurrentTrack(track);

      console.log(`▶️ Playing: ${track.title} - ${track.artist}`);

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: track.previewUrl },
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
    } catch (err) {
      console.error("Error playing preview:", err);
      Alert.alert("Error", "Failed to play preview");
      setIsPlaying(false);
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
        disabled={isPlaying}
      />

      <View style={{ marginTop: 20 }}>
        <Button
          title="Go to Front Page"
          onPress={() => router.push("/")}
        />
      </View>
    </View>
  );
}
