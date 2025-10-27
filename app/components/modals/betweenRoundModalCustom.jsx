import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, Easing, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ITUNES_GENRES } from "../match";

const windowWidth = Dimensions.get("window").width;

export default function BetweenRoundModalCustom({
  visible,
  roundWinner,
  currentGenre,
  onCloseAndProceed,
}) {
  const [selectedGenre, setSelectedGenre] = useState(null);
  const newGenre = currentGenre.current;
  const scrollRef = useRef(null);
  const scrollY = useRef(new Animated.Value(0)).current;


  const headerText =
    roundWinner === null
      ? "Select first genre..."
      : `Player ${roundWinner} won the round. Select next genre...`;

  const bounce = (ref, animatedVal) => {
    Animated.sequence([
      Animated.timing(animatedVal, {
        toValue: 10,
        duration: 100,
        useNativeDriver: false,
        easing: Easing.out(Easing.quad),
      }),
      Animated.spring(animatedVal, {
        toValue: 0,
        friction: 10,
        tension: 40,
        useNativeDriver: false,
      }),
    ]).start();

    animatedVal.addListener(({ value }) => {
      ref.current?.scrollTo({ y: value, animated: false });
    });
  };

  useEffect(() => {
    setTimeout(() => {
      bounce(scrollRef, scrollY);
    }, 400);

    return () => {
      scrollY.removeAllListeners();
    };
  }, []);

  const content = (
    <View style={styles.container}>
      <Text style={styles.buttonText}>
        {headerText}
      </Text>
      <View style={styles.centerArea}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.iconList}
          showsVerticalScrollIndicator={false}
        >
          {ITUNES_GENRES.map((g) => {
            const isSelected = selectedGenre?.id === g.id;
            return (
              <TouchableOpacity
                key={g.id}
                onPress={() => onCloseAndProceed(g)}
                style={[styles.iconWrapper, isSelected && styles.iconWrapperSelected]}
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

                <View style={styles.iconOuter}>
                  <LinearGradient
                    colors={["#896DA3", "#5663C4", "#412F7E"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.iconInner}
                  >
                    <Text style={styles.iconText}>
                      {g.name.split(" > ").pop()}
                    </Text>
                  </LinearGradient>
                </View>
              </TouchableOpacity>
            );
          })}

        </ScrollView>
        {/* Scrollindikator/gradient längst ner */}
        <LinearGradient
          colors={["transparent", "#20163B"]}
          style={styles.scrollFadeBottom}
          pointerEvents="none"
        />
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
    position: "relative",
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
    paddingTop: 100,
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
  iconList: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    paddingBottom: 32,
    paddingHorizontal: 12,
  },
  scrollFadeBottom: {
    height: 30,
    paddingTop: 100,
    zIndex: 5,
  },
  iconWrapper: {
    width: "20%",
    aspectRatio: 1,
    marginHorizontal: "2%",
    marginVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  iconWrapperSelected: {
    shadowColor: "#B2A2E2",
    shadowOpacity: 0.8,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
    zIndex: 10000,
  },
  iconOuter: {
    width: "100%",
    height: "100%",
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  iconInner: {
    flex: 1,
    width: "100%",
    height: "100%",
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
    overflow: "hidden",
  },
  iconText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
});