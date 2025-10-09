import { LinearGradient } from "expo-linear-gradient";
import { Dimensions, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const windowWidth = Dimensions.get("window").width;

export default function RematchModal({ visible, onRematch, onBackToMenu }) {
    const content = (
        <View style={styles.overlay}>
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
});