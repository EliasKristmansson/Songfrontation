import { useFonts } from "expo-font";
import { Modal, View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";

const windowWidth = Dimensions.get("window").width;

export default function Help({ visible, onClose }) {
    const [fontsLoaded] = useFonts({
        OutfitBlack: require("../../../assets/fonts/Outfit/Outfit-Black.ttf"),
        OutfitBold: require("../../../assets/fonts/Outfit/Outfit-Bold.ttf"),
        OutfitExtraBold: require("../../../assets/fonts/Outfit/Outfit-ExtraBold.ttf"),
        OutfitExtraLight: require("../../../assets/fonts/Outfit/Outfit-ExtraLight.ttf"),
        OutfitLight: require("../../../assets/fonts/Outfit/Outfit-Light.ttf"),
        OutfitMedium: require("../../../assets/fonts/Outfit/Outfit-Medium.ttf"),
        OutfitRegular: require("../../../assets/fonts/Outfit/Outfit-Regular.ttf"),
        OutfitSemiBold: require("../../../assets/fonts/Outfit/Outfit-SemiBold.ttf"),
        OutfitThin: require("../../../assets/fonts/Outfit/Outfit-Thin.ttf"),
    });

    if (!fontsLoaded) {
        return <SplashScreen />;
    }

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.title}>Help & Instructions</Text>
                    <Text style={styles.body}>
                        🎵 Welcome to Songfrontation! {"\n\n"}
                        - Choose Quick Match for a fast game.{"\n"}
                        - Use Custom Match to set your own rules.{"\n"}
                        - Tap ⚙️ to configure settings.{"\n\n"}
                        Have fun battling with music! 🎶
                    </Text>

                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.closeText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.6)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        width: windowWidth * 0.8,
        backgroundColor: "white",
        borderRadius: 30,
        padding: 30,
        elevation: 10,
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
        textAlign: "center",
        fontFamily: "OutfitBold",
    },
    body: {
        fontSize: 16,
        lineHeight: 22,
        marginBottom: 20,
        fontFamily: "OutfitLight",
    },
    closeButton: {
        alignSelf: "center",
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: "#5C66C5",
        borderRadius: 12,
    },
    closeText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
});
