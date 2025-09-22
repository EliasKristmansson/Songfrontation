import { useRouter } from "expo-router";
import { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const DARK_BLUE = "#1a237e";
const BUTTON_BG = "#232b4d";

// Ranodm genre ska då egentligen hämtas från API i denna funktio  och inte från den hårdkodade listan
const GENRES = [
  "Pop", "Rock", "Hip-Hop", "Jazz", "EDM", "Classical",
  "Country", "Metal", "Indie", "Folk", "R&B"
];

// Plockar en slumpad genre ur listan, byts til API sedan
function getRandomGenre(list) {
  return list[Math.floor(Math.random() * list.length)];
}

export default function Icon() {
  const router = useRouter();

  // Beräknas en gång vid mount
  const randomGenre = useMemo(() => getRandomGenre(GENRES), []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.roundedButton}
          onPress={() => router.push("../components/matchSettings")}
        >
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.headerText}>Selection of Genre</Text>

        <TouchableOpacity
          style={styles.roundedButton}
          onPress={() => router.push("../components/match")}
        >
          <Text style={styles.buttonText}>Match</Text>
        </TouchableOpacity>
      </View>

      {/* Visar en slumpad genre från listan, blir sedan den från API:t */}
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
    paddingTop: 40,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 30,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 10,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: DARK_BLUE,
    letterSpacing: 1,
  },
  roundedButton: {
    backgroundColor: BUTTON_BG,
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 32,
    minWidth: 100,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 2,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    letterSpacing: 0.5,
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
  },
  genreText: {
    fontSize: 40,
    fontWeight: "800",
    color: DARK_BLUE,
    letterSpacing: 1,
  },
});