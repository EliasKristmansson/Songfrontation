import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import PreGameMenuHeader from "./preGameMenuHeader";

const DARKER_PURPLE = "#3a2a6b";

const GENRES = [
  "Pop", "Rock", "Hip-Hop", "Jazz", "EDM", "Classical",
  "Country", "Metal", "Indie", "Folk", "R&B", "Random"
];

// Hjälp: expo-router kan ge string | string[]
const asStr = (v) => (Array.isArray(v) ? v[0] : v ?? "");

function getRandomGenres(list, n) {
  const shuffled = [...list].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
}

export default function Icon() {
  const router = useRouter();
  const { rounds, duration, guesses, points } = useLocalSearchParams();

  const randomGenres = useMemo(() => getRandomGenres(GENRES, 3), []);
  const [selectedGenre, setSelectedGenre] = useState(null);

  return (
    <View style={styles.container}>
      <PreGameMenuHeader
        title="Selection of Genre"
        onBack={() => router.push("../components/matchSettings")}
        onProceed={() =>
          router.push({
            pathname: "../components/match",
            params: {
              // Skickar vidare vald genre + tidigar einställningar från MatchSettings
              genre: selectedGenre ?? "Random",
              rounds: String(asStr(rounds) ?? ""),
              duration: String(asStr(duration) ?? ""),
              guesses: String(asStr(guesses) ?? ""),
              points: String(asStr(points) ?? ""),
            },
          })
        }
        canProceed={!!selectedGenre}
        proceedLabel="Start"
      />

      <View style={styles.centerArea}>
        <View style={styles.genreButtonRow}>
          {randomGenres.map((genre) => (
            <TouchableOpacity
              key={genre}
              style={[
                styles.genreButton,
                selectedGenre === genre && styles.genreButtonSelected,
              ]}
              onPress={() => setSelectedGenre(genre)}
              activeOpacity={0.85}
            >
              <Text style={styles.genreText}>{genre}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: Platform.OS === "web" ? "100vh" : undefined,
    paddingHorizontal: 10,
  },
  centerArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 16,
  },
  genreButtonRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },
  genreButton: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: DARKER_PURPLE,
    borderWidth: 2,
    borderColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  genreButtonSelected: { borderColor: "#fff" },
  genreText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});