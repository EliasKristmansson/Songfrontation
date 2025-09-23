// ./modals/help.jsx
import { LinearGradient } from "expo-linear-gradient";
import {
    Dimensions,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const windowWidth = Dimensions.get("window").width;

export default function Help({ visible, onClose }) {
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

                    <Text style={[styles.body, { fontFamily: "OutfitRegular" }]}>
                        Welcome to Songfrontation! 🎵 {"\n\n"}
                        - Choose Quick Match for a fast game.{"\n"}
                        - Use Custom Match to set your own rules.{"\n"}
                        - Tap settings to configure settings.{"\n\n"}
                        Have fun battling with music! 🎶
                    </Text>
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
