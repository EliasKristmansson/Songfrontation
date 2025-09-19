import { Text, View, ActivityIndicator, StyleSheet, ImageBackground, Image } from "react-native";

export default function SplashScreen() {
    return (
        <ImageBackground
            source={require("../../assets/images/Background3.png")}
            style={styles.container}
        >
            <View style={styles.container}>
                <View style={styles.iconBox}>
                    {/* Actual app icon */}
                    <Image
                        source={require("../../assets/images/appicon.png")}
                        style={styles.iconImage}
                        resizeMode="contain"
                    />
                </View>

                <View style={styles.textRow}>
                    <Text style={styles.loadingText}>Loading the Game</Text>
                    <ActivityIndicator size="small" color="white" style={{ marginLeft: 8 }} />
                </View>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1, // fills screen
        justifyContent: "center",
        alignItems: "center",
    },
    iconBox: {
        width: 120,
        height: 120,
        backgroundColor: "#e0e0e0",
        borderRadius: 24,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 32,
        overflow: "hidden", // ensures the icon respects the border radius
		border: "2px solid white",
    },
    iconImage: {
        width: "100%",
        height: "100%",
    },
    textRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    loadingText: {
        fontSize: 24,
        color: "white",
        fontWeight: "bold",
        letterSpacing: 1,
    },
});
