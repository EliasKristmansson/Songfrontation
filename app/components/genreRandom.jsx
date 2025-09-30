import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import PreGameMenuHeader from "./preGameMenuHeader";


const GENRES = [
  "Pop","Rock","Hip-Hop","Jazz","EDM","Classical",
  "Country","Metal","Indie","Folk","R&B"
];

function getRandomGenre(list) {
  return list[Math.floor(Math.random() * list.length)];
}

export default function Icon() {
  const router = useRouter();
  const { rounds, duration, guesses, points } = useLocalSearchParams();

  // Slumpa genre
  const randomGenre = useMemo(() => getRandomGenre(GENRES), []);

  return (
    <View style={styles.container}>
      <PreGameMenuHeader
        title="Selection of Genre"
        onBack={() => router.push("../components/matchSettings")}
        onProceed={() => {
          router.push({
            pathname: "../components/match",
            params: {
              // Skicka med alla valda inställningar till match
              genre: randomGenre,
              rounds: String(rounds ?? ""),
              duration: String(duration ?? ""),
              guesses: String(guesses ?? ""),
              points: String(points ?? ""),
            },
          });
        }}
        canProceed={true}
        proceedLabel="Start"
      />

      <View style={styles.genreWrapper}>
        <Text style={styles.genreLabel}>Your genre:</Text>
        <Text style={styles.genreText}>{randomGenre}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
    minHeight: Platform.OS === "web" ? "100vh" : undefined,
  },
  genreWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  genreLabel: {
    fontSize: 16,
    opacity: 0.7,
    color: "#fff",
  },
  genreText: {
    fontSize: 40,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 1,
  },
});