import { LinearGradient } from "expo-linear-gradient";
import { Dimensions, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const windowWidth = Dimensions.get("window").width;

export default function RematchModal({ visible, onRematch, onBackToMenu, matchWinnerId, playedSongs }) {

    const content = (
        <View style={styles.overlay}>
            {/* Winner Text */}
            <Text style={styles.winnerText}>
                Player {matchWinnerId} has won the match!
            </Text>
            <View style={styles.horizontalWrap}>
                {/* Vänster sida: Title + Scroll */}
                <View style={styles.leftSide}>
                    <Text style={styles.playedSongsTitle}>Played Songs:</Text>
                    <View style={styles.playedSongsContainer}>
                        <ScrollView
                            style={styles.playedSongsScroll}
                            contentContainerStyle={{ paddingVertical: 4 }}
                            persistentScrollbar={true}
                        >
                            {playedSongs.map((song, index) => (
                                <Text key={index} style={styles.playedSongsText}>
                                    {index + 1}. {song.trackName} — {song.artistName}
                                </Text>
                            ))}
                        </ScrollView>
                    </View>
                </View>

                {/* Höger sida: Buttons */}
                <View style={styles.buttonsWrap}>
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

                    <View style={[styles.buttonGradient, styles.invertedButton]}>
                        <TouchableOpacity style={styles.buttonTapArea} onPress={onBackToMenu} activeOpacity={0.9}>
                            <Text style={styles.invertedButtonText}>Back to Menu</Text>
                        </TouchableOpacity>
                    </View>
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
    winnerText: {
        fontFamily: "OutfitBold",
        color: "white",
        fontSize: 28,
        marginBottom: 12,
        textAlign: "center",
    },
    horizontalWrap: {
        flexDirection: "row",
        width: "100%",
        justifyContent: "space-between",
        paddingHorizontal: 48,
    },
    leftSide: {
        width: "48%",
    },
    playedSongsTitle: {
        color: "white",
        fontFamily: "OutfitLight",
        fontSize: 16,
        marginBottom: 8,
    },
    playedSongsContainer: {
        height: 200,
        borderWidth: 2,
        borderColor: "white",
        borderRadius: 16,
        padding: 12,
        backgroundColor: "rgba(0,0,0,0.2)",
    },
    playedSongsScroll: {
        width: "100%",
    },
    playedSongsText: {
        color: "white",
        fontSize: 13,
        fontFamily: "OutfitLight",
    },
    buttonsWrap: {
        width: "48%",
        justifyContent: "center",
        alignItems: "center",
    },
    buttonGradient: {
        width: "100%",
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
    invertedButton: {
        backgroundColor: "#FFFFFF",
        borderColor: "#804D58",
    },
    invertedButtonText: {
        color: "#804D58",
        fontSize: 18,
        fontFamily: "OutfitBold",
    },
});