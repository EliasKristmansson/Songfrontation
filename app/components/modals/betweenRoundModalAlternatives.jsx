import { LinearGradient } from "expo-linear-gradient";
import { useMemo, useState } from "react";
import { Dimensions, Modal, StyleSheet, Text, TouchableOpacity, View, } from "react-native";
import { ITUNES_GENRES } from "../match";

const windowWidth = Dimensions.get("window").width;

function getRandomGenres(list, n) {
  const shuffled = [...list].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
}

export default function BetweenRoundModalAlternatives({
  visible,
  roundWinner,
  currentGenre,
  onCloseAndProceed,
}) {
  const randomGenres = useMemo(() => getRandomGenres(ITUNES_GENRES, 3), []);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const newGenre = currentGenre.current;

  const headerText =
    roundWinner === null
      ? "Select first genre..."
      : `Player ${roundWinner} won the round. Select next genre...`;

  const content = (
    <View style={styles.container}>
      <Text style={styles.buttonText}>
        {headerText}
      </Text>
      <View style={styles.centerArea}>
        <View style={styles.genreButtonRow}>
          {randomGenres.map((genreObj) => {
            return (
              <TouchableOpacity
                key={genreObj.id}
                style={styles.genreButtonWrapper}
                onPress={() => {
                  setSelectedGenre(genreObj);
                  onCloseAndProceed(genreObj);
                }}
                activeOpacity={0.85}
              >

                <LinearGradient
                  colors={["#896DA3", "#5663C4", "#412F7E"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[
                    styles.genreButton,
                    styles.genreButtonSelected,
                  ]}
                >
                  <Text style={styles.genreText}>
                    {genreObj.name.split(" > ").pop()}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
        </View>
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
  container: {
    flex: 1,
    backgroundColor: "rgba(26,18,59,0.86)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  subHeader: {
    textAlign: "center",
    marginBottom: 16,
    color: "#fff",
    opacity: 0.8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 22,
    fontFamily: "OutfitBold",
    paddingBottom: 20,
  },
  centerArea: {
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
  genreButtonWrapper: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  genreButton: {
    width: "100%",
    height: "100%",
    borderRadius: 80,
    borderWidth: 2,
    borderColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#412F7E",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
    borderColor: "#FFFFFF",
  },
  genreButtonSelected: {
    borderColor: "#fff",
    shadowColor: "#896DA3",
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
  genreText: {
    color: "#fff",
    fontSize: 20,
    fontFamily: "OutfitBold",
    textAlign: "center",
  },
  genreGlowHalo: {
    position: "absolute",
    top: -12,
    left: -12,
    width: 184,
    height: 184,
    borderRadius: 92,
    shadowColor: "white",
    shadowOpacity: 0.75,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
    elevation: 16,
  },
  buttonsWrap: {
    width: "100%",
    alignItems: "center",
    shadowColor: "#8e7cc3",
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 10,
    paddingtop: 20,
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
});