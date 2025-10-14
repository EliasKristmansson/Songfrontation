import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { Dimensions, Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions, Pressable, } from "react-native";

const windowHeight = Dimensions.get("window").height;

export default function Help({ visible, onClose }) {
  const { width, height } = useWindowDimensions();

  const content = (
    <View style={styles.overlay}>
      {/* Klick utanför rutan för att stänga */}
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

      {/* Rutan i sig */}
      <View style={[styles.modalContent, { width: width * 0.75, maxHeight: height * 0.65 }]}>
        <LinearGradient
          colors={["#1A123B", "#242F7D", "#412F59", "#804D58"]}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.8, y: 1 }}
          style={styles.gradient}
        >
          {/* Header row */}
          <View style={styles.headerRow}>
            <Text style={[styles.title, { fontFamily: "OutfitBold" }]}>
              Help & Instructions
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={[styles.closeText, { fontFamily: "OutfitBold" }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView>
            <Text style={[styles.body, { fontFamily: "OutfitRegular" }]}>
              Welcome to Songfrontation! 🎵 {"\n\n"}
              - Quick Match: premade rules.{"\n"}
              - Custom Match: choose your own rules.{"\n"}
              - Tap settings to adjust options.{"\n\n"}
              Game modes:{"\n"}
              - Random: 1 random genre.{"\n"}
              - Pick from 3: pick 1 of 3 genres.{"\n"}
              - Pick from all: pick from all genres.{"\n\n"}
              Inside the Match: {"\n"}
              - 3s countdown, then the track plays; timer shows between icons.{"\n"}
              - Tap the bubble with the correct title & artist.{"\n"}
              - Right = +1 point. Wrong = 2s cooldown.{"\n"}
              - If time runs out: Last Guess — right wins the point; wrong gives it to the opponent.{"\n"}
              - After a point: 3s countdown → next track, until round target is reached.{"\n"}
              - When a round is won: next round starts after 3s.{"\n"}
              - Big indicators = points this round; small indicators = rounds won.{"\n\n"}
              End of Match: {"\n"}
              - Rematch with same settings/icons, or return to main menu.{"\n"}
              - Pause anytime (top right) to resume or exit.{"\n\n"}
              Have fun battling with music! 🎶{"\n"}{"\n"}
            </Text>
          </ScrollView>
        </LinearGradient>
      </View>
    </View>
  );

  if (Platform.OS === "ios") {
    if (!visible) return null;
    return (
      <View pointerEvents={visible ? "auto" : "none"} style={styles.absoluteContainer}>
        {content}
      </View>
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      presentationStyle="overFullScreen"
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1 }}>{content}</View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  absoluteContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  overlay: {
    flex: 1,
    position: "relative",
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  modalContent: {
    borderRadius: 25,
    borderColor: "white",
    borderWidth: 2,
    shadowColor: "#8e7cc3",
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 12,
    backgroundColor: "#1A123B",
    overflow: "hidden",
  },
  gradient: {
    width: "100%",
    borderRadius: 25,
    padding: 20,
    flexGrow: 1,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    color: "white",
  },
  scrollContainer: {
    maxHeight: windowHeight * 0.5,
  },
  scrollContent: {
    paddingBottom: 0,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "left",
    color: "white",
  },
  closeText: {
    color: "white",
    fontSize: 22,
    fontWeight: "600",
  },
});