import { Audio } from "expo-av";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Button, Text, View } from "react-native";

// Common search terms for randomness
const SEARCH_TERMS = [
  "love", "dance", "night", "fire", "heart", "baby", "party",
  "dream", "light", "girl", "boy", "rock", "pop", "life"
];

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
