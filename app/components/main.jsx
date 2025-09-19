import { useFonts } from "expo-font";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ImageBackground,
} from "react-native";
import SplashScreen from "./splashScreen";
import Help from "./modals/help";

const windowWidth = Dimensions.get("window").width;
const BUTTON_WIDTH = Math.min(350, windowWidth - 40);

function PlayerButton({ label, onPress }) {
    const opacity = useRef(new Animated.Value(0)).current;

    const handlePressIn = () => {
        Animated.timing(opacity, {
            toValue: 1,
            duration: 120,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.timing(opacity, {
            toValue: 0,
            duration: 120,
            useNativeDriver: true,
        }).start();
    };

    return (
        <Pressable
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
            <Animated.View
                pointerEvents="none"
                style={[
                    {
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(0,0,0,0.25)",
                        transform: [{ skewX: "-15deg" }],
                        opacity,
                    },
                ]}
            />
            <View style={styles.playerContent}>
                <Text style={styles.playerText}>{label}</Text>
            </View>
        </Pressable>
    );
}

export default function Main() {
    const [fontsLoaded] = useFonts({
        OutfitBlack: require("../../assets/fonts/Outfit/Outfit-Black.ttf"),
        OutfitBold: require("../../assets/fonts/Outfit/Outfit-Bold.ttf"),
        OutfitExtraBold: require("../../assets/fonts/Outfit/Outfit-ExtraBold.ttf"),
        OutfitExtraLight: require("../../assets/fonts/Outfit/Outfit-ExtraLight.ttf"),
        OutfitLight: require("../../assets/fonts/Outfit/Outfit-Light.ttf"),
        OutfitMedium: require("../../assets/fonts/Outfit/Outfit-Medium.ttf"),
        OutfitRegular: require("../../assets/fonts/Outfit/Outfit-Regular.ttf"),
        OutfitSemiBold: require("../../assets/fonts/Outfit/Outfit-SemiBold.ttf"),
        OutfitThin: require("../../assets/fonts/Outfit/Outfit-Thin.ttf"),
    });

    const [helpVisible, setHelpVisible] = useState(false);

    if (!fontsLoaded) {
        return <SplashScreen />;
    }

    const router = useRouter();

    return (
        <ImageBackground
            source={require("../../assets/images/Background3.png")}
            style={styles.container}
        >
            <View style={styles.titleContainer}>
                <Text style={styles.title}>Welcome to Songfrontation!</Text>

                {/* Row container for buttons */}
                <View style={styles.topRightButtons}>
                    {/* Help */}
                    <TouchableOpacity
                        style={styles.settingsButton}
                        onPress={() => setHelpVisible(true)}
                    >
                        <Text style={styles.settingsText}>❔</Text>
                    </TouchableOpacity>

                    {/* Settings */}
                    <TouchableOpacity
                        style={styles.settingsButton}
                        onPress={() => router.push("../components/settings")}
                    >
                        <Text style={styles.settingsText}>⚙️</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Center Content */}
            <View style={styles.centerContent}>
                {/* Quick Match */}
                <View
                    style={{
                        width: BUTTON_WIDTH,
                        alignItems: "flex-start",
                        paddingLeft: 10,
                    }}
                >
                    <Text style={styles.sectionLabel}>Quick Match</Text>
                </View>
                <View style={[styles.buttonRowShadow, { width: BUTTON_WIDTH }]}>
                    <LinearGradient
                        colors={["#412F7E", "#5663C4", "#896DA3", "#B77586"]}
                        start={[0.1, 0]}
                        end={[0.9, 1]}
                        style={styles.buttonRow}
                    >
                        <PlayerButton
                            label="1 Player"
                            onPress={() => router.push("../components/match")}
                        />
                        <View style={styles.divider} />
                        <PlayerButton
                            label="2 Players"
                            onPress={() => router.push("../components/match")}
                        />
                    </LinearGradient>
                </View>

                {/* Custom Match */}
                <View
                    style={{
                        width: BUTTON_WIDTH,
                        alignItems: "flex-start",
                        paddingLeft: 10,
                        marginTop: 30,
                    }}
                >
                    <Text style={styles.sectionLabel}>Custom Match</Text>
                </View>
                <View style={[styles.buttonRowShadow, { width: BUTTON_WIDTH }]}>
                    <LinearGradient
                        colors={["#B77586", "#896DA3", "#5663C4", "#412F7E"]}
                        start={[0.1, 0]}
                        end={[0.9, 1]}
                        style={styles.buttonRow}
                    >
                        <PlayerButton
                            label="1 Player"
                            onPress={() => router.push("../components/icon")}
                        />
                        <View style={styles.divider} />
                        <PlayerButton
                            label="2 Players"
                            onPress={() => router.push("../components/icon")}
                        />
                    </LinearGradient>
                </View>
            </View>

            {/* Help Modal */}
            <Help visible={helpVisible} onClose={() => setHelpVisible(false)} />
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 40,
        alignItems: "center",
        justifyContent: "flex-start",
    },
    titleContainer: {
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
        position: "relative",
    },
    topRightButtons: {
        position: "absolute",
        right: 20,
        top: 0,
        flexDirection: "row",
        gap: 10, // if your RN version doesn't support gap, replace with marginRight on first button
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "white",
        textAlign: "center",
        fontFamily: "OutfitBold",
    },
    settingsButton: {
        padding: 4,
        borderRadius: 50,
        backgroundColor: "#5C66C5",
    },
    settingsText: {
        fontSize: 24,
    },
    sectionLabel: {
        fontSize: 16,
        color: "white",
        fontFamily: "OutfitLight",
    },
    buttonRowShadow: {
        // iOS shadow
        shadowColor: "#8e7cc3",
        shadowOpacity: 0.8,
        shadowRadius: 15,

        // Android shadow
        elevation: 10,
        borderRadius: 50,
        marginTop: 10,
        overflow: "visible", // allows shadow to be visible
    },
    buttonRow: {
        flexDirection: "row",
        borderRadius: 50,
        height: 60,
        overflow: "hidden", // preserves rounded corners for gradient & press
        borderWidth: 2,
        borderColor: "white",
        position: "relative",
    },
    divider: {
        position: "absolute",
        top: 0,
        bottom: 0,
        left: "50%",
        width: 2,
        backgroundColor: "rgba(0,0,0,0.25)",
        transform: [{ rotate: "15deg" }],
    },
    playerContent: {
        zIndex: 2,
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 16,
    },
    playerText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
        letterSpacing: 2,
        textAlign: "center",
        fontFamily: "OutfitRegular",
    },
    centerContent: {
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "center",
        width: "100%",
    },
});
