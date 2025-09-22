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
                <Text style={[styles.title, { fontFamily: "OutfitBold" }]}>
                    Help & Instructions
                </Text>

                <Text style={[styles.body, { fontFamily: "OutfitRegular" }]}>
                    Welcome to Songfrontation! 🎵 {"\n\n"}
                    - Choose Quick Match for a fast game.{"\n"}
                    - Use Custom Match to set your own rules.{"\n"}
                    - Tap settings to configure settings.{"\n\n"}
                    Have fun battling with music! 🎶
                </Text>

                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <Text style={[styles.closeText, { fontFamily: "OutfitSemiBold" }]}>
                        Close
                    </Text>
                </TouchableOpacity>
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
    },
    modalContent: {
        width: windowWidth * 0.86,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 22,
        elevation: 8,
        shadowColor: "#000",
        shadowOpacity: 0.18,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
    },
    title: {
        fontSize: 18,
        marginBottom: 8,
        textAlign: "center",
    },
    body: {
        fontSize: 15,
        lineHeight: 20,
        marginBottom: 16,
        textAlign: "left",
    },
    closeButton: {
        alignSelf: "center",
        paddingVertical: 10,
        paddingHorizontal: 18,
        backgroundColor: "#5C66C5",
        borderRadius: 10,
    },
    closeText: {
        color: "white",
        fontSize: 15,
    },
});
