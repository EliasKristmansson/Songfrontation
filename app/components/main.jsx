import { Asset } from "expo-asset";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    Animated,
    Dimensions,
    Image,
    ImageBackground,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import Help from "./modals/help";
import SplashScreen from "./splashScreen.jsx";

const windowWidth = Dimensions.get("window").width;
const BUTTON_WIDTH = Math.min(350, windowWidth - 40);

function PlayerButton({ label, onPress }) {
    const opacity = new Animated.Value(0);

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
    const [helpVisible, setHelpVisible] = useState(false);
    const [bgReady, setBgReady] = useState(false);
    const router = useRouter();

    // Preload background image
    useEffect(() => {
        async function preload() {
            await Asset.fromModule(
                require("../../assets/images/Background3.png")
            ).downloadAsync();
            setBgReady(true);
        }
        preload();
    }, []);

    const starSources = [
        require("../../assets/images/star1.png"),
        require("../../assets/images/star2.png"),
        require("../../assets/images/star3.png"),
        require("../../assets/images/star4.png"),
    ];

    const stars = [
        { source: starSources[0], top: "8%", left: "10%", size: 25 },
        { source: starSources[1], top: "20%", left: "80%", size: 35 },
        { source: starSources[2], top: "35%", left: "15%", size: 30 },
        { source: starSources[3], top: "50%", left: "75%", size: 28 },
        { source: starSources[0], top: "65%", left: "12%", size: 32 },
        { source: starSources[1], top: "78%", left: "85%", size: 40 },
    ];

    if (!bgReady) {
        return <SplashScreen />;
    }

    return (
        <ImageBackground
            source={require("../../assets/images/Background3.png")}
            style={styles.container}
        >
            {/* Stars Layer */}
            {stars.map((star, idx) => (
                <Image
                    key={idx}
                    source={star.source}
                    style={[
                        styles.star,
                        {
                            left: star.left,
                            top: star.top,
                            width: star.size,
                            height: star.size,
                        },
                    ]}
                />
            ))}

            <View style={styles.titleContainer}>
                <Text style={styles.title}>Welcome to Songfrontation!</Text>

                <View style={styles.topRightButtons}>
                    <TouchableOpacity
                        style={styles.settingsButton}
                        onPress={() => setHelpVisible(true)}
                    >
                        <Text style={styles.settingsText}>❔</Text>
                    </TouchableOpacity>

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
                            onPress={() =>
                                router.push("../components/iconSinglePlayer")
                            }
                        />
                        <View style={styles.divider} />
                        <PlayerButton
                            label="2 Players"
                            onPress={() => router.push("../components/icon")}
                        />
                    </LinearGradient>
                </View>
            </View>

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
    star: {
        position: "absolute",
        resizeMode: "contain",
        opacity: 0.6,
        shadowColor: "white",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.7,
        shadowRadius: 3,
        elevation: 8,
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
        gap: 10,
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
        shadowColor: "#8e7cc3",
        shadowOpacity: 0.8,
        shadowRadius: 15,
        elevation: 10,
        borderRadius: 50,
        marginTop: 10,
        overflow: "visible",
    },
    buttonRow: {
        flexDirection: "row",
        borderRadius: 50,
        height: 60,
        overflow: "hidden",
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
