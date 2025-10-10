// ./modals/help.jsx
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
    Dimensions,
    Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View
} from "react-native";

const windowWidth = Dimensions.get("window").width;

export default function Help({ visible, onClose }) {

        // Scroller
        const [scrollPos, setScrollPos] = useState(0);
        const [scrollContentHeight, setScrollContentHeight] = useState(1);
        const [scrollViewHeight, setScrollViewHeight] = useState(1);

    const content = (
        <View style={styles.overlay}>
            <View style={styles.modalContent}>
                <LinearGradient
                    colors={["#1A123B", "#242F7D", "#412F59", "#804D58"]}
                    start={{ x: 0.2, y: 0 }}
                    end={{ x: 0.8, y: 1 }}
                    style={styles.gradient}
                >
                    {/* Header row with title + close button */}
                    <View style={styles.headerRow}>
                        <Text style={[styles.title, { fontFamily: "OutfitBold" }]}>
                            Help & Instructions
                        </Text>
                        <TouchableOpacity
                            onPress={onClose}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Text style={[styles.closeText, { fontFamily: "OutfitBold" }]}>
                                ✕
                            </Text>
                        </TouchableOpacity>
                    </View>

                <ScrollView>
                    <Text style={[styles.body, { fontFamily: "OutfitRegular" }]}>
                        Welcome to Songfrontation! 🎵 {"\n\n"}
                        - Choose Quick Match for a fast game.{"\n"}
                        - Use Custom Match to set your own rules.{"\n"}
                        - Tap settings to configure settings.{"\n\n"}                        
                        Game modes:{"\n"}
                        - Quick Match, premade settings for the game.{"\n"}
                        - Custom Match, you choose the settings for the game.{"\n\n"}
                        Choose if you want to play as:{"\n"}
                        - 1 player.{"\n"}
                        - 2 players.{"\n\n"}
                        Icon select: {"\n"}
                        - This is preset if you are playing Quick Match.{"\n"}
                        - If you are playing Custom Match, choose your icon or take a picture.{"\n\n"}
                        Game settings:{"\n\n"}
                        Selection of Genre{"\n"}
                        - Random, gives the match one random genre.{"\n"}
                        - Alternatives, gives you three random genres and you choose one of them.{"\n"}
                        - Custom, gives you the opportunity to choose one genre from the list of all available genres.{"\n"}{"\n"}
                        Songs to Win Round{"\n"}
                        - Choose whether you win the round if you guess the title and artist of 1, 3 or 5 songs.{"\n"}{"\n"}
                        Rounds to Win Match{"\n"}
                        - Choose whether you win the match if you win 1, 2 or 3 rounds.{"\n"}{"\n"}
                        Song Duration{"\n"}
                        - Choose the amount of seconds(5s-29s) the song is played before you have to make your guess.{"\n"}{"\n"}
                        Guesses on Board{"\n"}
                        - Choose whether there are 2, 3 or 4 songs on the board to choose from when you are making your guess.{"\n"}{"\n"}
                        Selection of Genre for Round:{"\n"}
                        - If you chose random, the randomized genre for this match is shown on the screen.{"\n"}
                        - If you chose alternatives, you are presented with three randomized genres from which you choose one of the genres to be the genre of this match.{"\n"}
                        - If you chose custom, you are presented with the list of all available genres from which you choose one of the genres to be the genre of this match.{"\n"}{"\n"}
                        Inside the Match: {"\n"}
                        - When the Match starts and the first round starts there is a countdown from 3 seconds before the first track starts playing. The amount of seconds left of the current song is displayed in between the players icons.{"\n"}
                        - You are presented with a number of bubbles on the playing field which contain a song title and their respective artists. Press the bubble with the title and artist you believe corresponds to the track which is being played.{"\n"}
                        - If you guess right, you are awarded a point. If you are wrong, you get a 2 second cooldown shown on your side of the screen before you can make another guess.{"\n"}
                        - If no player manages to guess right within the timeframe of the song duration, a state of last guess is initiated.{"\n"}
                        - If the last guess state is initiated, any player is able to make the last guess. But be careful! If your guess is right you are awarded the point, but if your guess is wrong your opponent is awarded the point.{"\n"}
                        - After a point is awarded to a player, a three second countdown is shown and then the next song and the new guesses on board will appear. The above mentioned process is repeated until the number of points to win the round is reached.{"\n"}
                        - When a player wins a round, the next round will start with a 3 second countdown. {"\n"}
                        - The won points of the round for each respective player is shown as the big indicators located next to each player's icon. While the won rounds of the current match for each respective player is shown as the small indicators next to each respective player’s won rounds.{"\n\n"}
                        End of Match: {"\n"}
                        - At the end of a match, you can either choose to play a rematch with the same settings and player icons, or return to the main menu.{"\n"}
                        - At any point during the game you can pause the game by pressing the pause button in the top right corner. In the paused state you can choose to resume or exit to the main menu.{"\n\n"}
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
            <View
                pointerEvents={visible ? "auto" : "none"}
                style={styles.absoluteContainer}
            >
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
        backgroundColor: "rgba(0,0,0,0.6)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    modalContent: {
        width: windowWidth * 0.86,
        borderRadius: 25,
        borderColor: "white",
        borderWidth: 2,
        shadowColor: "#8e7cc3",
        shadowOpacity: 0.6,
        shadowRadius: 20,
        elevation: 12,
        backgroundColor: "#1A123B",
    },
    gradient: {
        width: "100%",
        borderRadius: 25,
        padding: 20,
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
    body: {
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 20,
        textAlign: "left",
        color: "white",
    },
    closeText: {
        color: "white",
        fontSize: 22,
        fontWeight: "600",
    },
});
