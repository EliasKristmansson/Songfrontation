import { LinearGradient } from "expo-linear-gradient";
import { useMemo } from "react";
import { Dimensions, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ITUNES_GENRES } from "../match";

const windowWidth = Dimensions.get("window").width;

function getRandomGenre(list) {
  return list[Math.floor(Math.random() * list.length)];
}

export default function BetweenRoundModalRandom({
  visible,
  proceedToNextRound,
  roundWinner,
  currentGenre,
  onCloseAndProceed,
  executeNextRound
}) {
  // ✅ Pick a new genre when the modal becomes visible
  const newGenre = useMemo(() => {
    if (!visible) return null;
    const filtered = ITUNES_GENRES.filter(g => g.id !== currentGenre?.id);
    return getRandomGenre(filtered);
  }, [visible]);

  const content = (
    <View style={styles.overlay}>
      <Text style={styles.buttonText}>
        Player {roundWinner} won the round. Next genre is... 
      </Text>
      <Text style={styles.genreText}>{newGenre?.name}</Text>

      <View style={styles.buttonsWrap}>
        <LinearGradient
          colors={["#242F7D", "#412F59", "#804D58"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.buttonGradient}
        >
          <TouchableOpacity
            style={styles.buttonTapArea}
            onPress={() => onCloseAndProceed(newGenre)}
 
            activeOpacity={0.9}
          >
            <Text style={styles.buttonText}>Start Next Round</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </View>
  );

  return (
    <Modal
      visible={!!visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      supportedOrientations={["portrait", "landscape"]}
    >
      <View style={{ flex: 1 }}>{content}</View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(26,18,59,0.86)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  buttonsWrap: {
    width: "100%",
    alignItems: "center",
    shadowColor: "#8e7cc3",
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 10,
  },
  buttonGradient: {
    width: Math.min(windowWidth * 0.78, 420),
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    marginVertical: 8,
    overflow: "hidden",
  },
  buttonTapArea: {
    paddingVertical: 18,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "OutfitBold",
  },
    genreText: {
    fontSize: 40,
    paddingTop: 60,
    paddingBottom: 60,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 1,
    fontFamily: "OutfitBold"
  },
});
