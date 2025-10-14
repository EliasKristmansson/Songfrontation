import { LinearGradient } from "expo-linear-gradient";
import { Dimensions, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const windowWidth = Dimensions.get("window").width;

export default function RematchModal({ visible, onRematch, onBackToMenu, matchWinnerId, playedSongs }) {
    const content = (
        <View style={styles.overlay}>
            {/* Winner Text */}
            <Text style={[styles.body, styles.winnerText]}>
                Player {matchWinnerId} has won the match!
            </Text>

            {/* Played Songs List */}
            <View style={styles.playedSongsContainer}>
                <ScrollView
                    style={styles.playedSongsScroll}
                    contentContainerStyle={{ paddingVertical: 4 }}
                >
                    {playedSongs.map((song, index) => (
                        <Text key={index} style={styles.playedSongsText}>
                            {song.trackName} — {song.artistName}
                        </Text>
                    ))}
                </ScrollView>
            </View>

            <View style={styles.buttonsWrap}>
                {/* Rematch */}
                <LinearGradient
                    colors={["#242F7D", "#412F59", "#804D58"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.buttonGradient}
                >
                    <TouchableOpacity style={styles.buttonTapArea} onPress={onRematch} activeOpacity={0.9}>
                        <Text style={styles.buttonText}>Rematch</Text>
                    </TouchableOpacity>
                </LinearGradient>

                {/* Back to Menu (Inverted Style) */}
                <View style={[styles.buttonGradient, styles.invertedButton]}>
                    <TouchableOpacity
                        style={styles.buttonTapArea}
                        onPress={onBackToMenu} // functionality stays the same
                        activeOpacity={0.9}
                    >
                        <Text style={styles.invertedButtonText}>Back to Menu</Text>
                    </TouchableOpacity>
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
            onRequestClose={onBackToMenu}
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
        marginBottom: 24,
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

    // Inverted button (Exit to Menu)
    invertedButton: {
        backgroundColor: "#FFFFFF",
        borderColor: "#804D58",
    },

    invertedButtonText: {
        color: "#804D58",
        fontSize: 18,
        fontFamily: "OutfitBold",
    },
    winnerText: {
        fontFamily: "OutfitBold",
        color: "white",
        fontSize: 24,
        marginBottom: 8,
        marginTop: 12,
    },
    playedSongsContainer: {
        maxHeight: 100,       // adjust to how much vertical space you want
        width: '60%',          // doesn't stretch fully to screen edges
        alignSelf: 'center',   // center horizontally
        borderWidth: 2,        // optional: border to separate from background
        borderColor: "white",
        borderRadius: 24,
        padding: 8,
        backgroundColor: 'rgba(0,0,0,0.2)', // optional background
    },

    playedSongsScroll: {
        width: '100%',
    },
    playedSongsText: {
        color: "white",
        fontSize: 16,
        fontFamily: "OutfitLight",
    },
});