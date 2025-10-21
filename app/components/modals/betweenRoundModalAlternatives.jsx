import { LinearGradient } from "expo-linear-gradient";
import { useMemo, useState } from "react";
import { Dimensions, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ITUNES_GENRES } from "../match";


const windowWidth = Dimensions.get("window").width;

function getRandomGenres(list, n) {
    const shuffled = [...list].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, n);
}

export default function BetweenRoundModalAlternatives({
  visible,
  proceedToNextRound,
  roundWinner,
  currentGenre,
  onCloseAndProceed,
}) {    
    
    const randomGenres = useMemo(() => getRandomGenres(ITUNES_GENRES, 3), []);
    const [selectedGenre, setSelectedGenre] = useState(null);
    const newGenre = currentGenre.current;

  const content = (
    <View style={styles.overlay}>
      <Text style={styles.buttonText}>
        Player {roundWinner} won the round. Next genre is {newGenre?.name}...
      </Text>

    <Text style={styles.subHeader}>
                    {selectedGenre ? `Selected: ${selectedGenre.name.split(" > ").pop()}` : "Choose one genre"}
                </Text>
    
                <View style={styles.centerArea}>
                    <View style={styles.genreButtonRow}>
                        {randomGenres.map((genreObj) => {
                            const isSelected = selectedGenre === genreObj;
                            return (
                                <TouchableOpacity
                                    key={genreObj.id}
                                    style={styles.genreButtonWrapper}
                                    onPress={() => setSelectedGenre(genreObj)}
                                    activeOpacity={0.85}
                                >
                                    {isSelected && (
                                        <LinearGradient
                                            colors={[
                                                "rgba(137,109,163,0.45)",
                                                "rgba(86,99,196,0.35)",
                                                "rgba(65,47,126,0.25)",
                                            ]}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 1 }}
                                            style={styles.genreGlowHalo}
                                        />
                                    )}
                                    <LinearGradient
                                        colors={["#896DA3", "#5663C4", "#412F7E"]}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={[
                                            styles.genreButton,
                                            isSelected && styles.genreButtonSelected,
                                        ]}
                                    >
                                        <Text style={styles.genreText}>{genreObj.name.split(" > ").pop()}</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>





      <View style={styles.buttonsWrap}>
        <LinearGradient
          colors={["#242F7D", "#412F59", "#804D58"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.buttonGradient}
        >
          <TouchableOpacity
            style={styles.buttonTapArea}
            onPress={() => onCloseAndProceed(selectedGenre)} // ✅ Pass new genre back
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
});