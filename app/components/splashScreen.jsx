import { Text, View, ActivityIndicator, StyleSheet } from "react-native";

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.iconBox}>
        {/* Placeholder for app icon */}
        <Text style={styles.iconText}>Icon</Text>
      </View>

      <View style={styles.textRow}>
        <Text style={styles.loadingText}>loading the game</Text>
        <ActivityIndicator size="small" color="#333" style={{ marginLeft: 8 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // fills screen instead of 100vh
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  iconBox: {
    width: 120,
    height: 120,
    backgroundColor: "#e0e0e0",
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
  },
  iconText: {
    fontSize: 32,
    color: "#aaa",
  },
  textRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 24,
    color: "#333",
    fontWeight: "bold",
    letterSpacing: 1,
  },
});
