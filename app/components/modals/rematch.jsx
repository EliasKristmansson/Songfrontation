import { LinearGradient } from "expo-linear-gradient";
import { Dimensions, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const windowWidth = Dimensions.get("window").width;

// Testaändirng
export default function RematchModal({ visible, onRematch, onBackToMenu }) {
    // Innehållet i modalen
    const content = (
        <View style={styles.overlay}>
            <View style={styles.modalContent}>
                <LinearGradient
                    colors={["#1A123B", "#242F7D", "#412F59", "#804D58"]}
                    start={{ x: 0.2, y: 0 }}
                    end={{ x: 0.8, y: 1 }}
                    style={styles.gradient}
                >
                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={styles.button} onPress={onRematch}>
                            <Text style={styles.buttonText}>Rematch</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.button} onPress={onBackToMenu}>
                            <Text style={styles.buttonText}>Back to Menu</Text>
                        </TouchableOpacity>
                    </View>
                </LinearGradient>
            </View>
        </View>
    );

    // Returnerar modalen
    return (
        <Modal
            visible={visible}
            transparent
            presentationStyle="overFullScreen"
            animationType="fade"
            onRequestClose={onBackToMenu}
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
    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 16,
    },
    button: {
        flex: 1,
        backgroundColor: "#232b4d",
        borderRadius: 18,
        paddingVertical: 18,
        marginHorizontal: 6,
        alignItems: "center",
    },
    buttonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
});