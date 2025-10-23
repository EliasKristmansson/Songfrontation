import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useContext, useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Easing,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import ShaderBackground from "./backgroundShader";
import { BackgroundShaderContext } from "./backgroundShaderContext";
import Help from "./modals/help";

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




export default function Main({ background, stars = [] }) {
    const { dividerPosRef } = useContext(BackgroundShaderContext);
    const anim = useRef(new Animated.Value(dividerPosRef.current)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const [helpVisible, setHelpVisible] = useState(false);
    const router = useRouter();

    // Default settings for Quick Match
    const defaultQuickMatch = {
        rounds: 1,
        duration: 29,
        guesses: 3,
        points: 3,
    };

    useEffect(() => {
        animateDivider(1.1);
        setTimeout(() => {
            fadeContent(null, 1)
        }, 200);
    }, []);

    const animateDivider = (toValue, callback) => {
        Animated.timing(anim, {
            toValue,
            duration: 600,
            easing: Easing.inOut(Easing.cubic),
            useNativeDriver: false, // ✅ shader ref, not a style prop
        }).start(() => callback?.());

        anim.addListener(({ value }) => {
            dividerPosRef.current = value;
        });
    };

    const fadeContent = (callback, newOpacity) => {
        Animated.timing(fadeAnim, {
            toValue: newOpacity,
            duration: 500,
            useNativeDriver: true,
        }).start(() => callback?.());
    };

    const swipeAnimationAndRouteToNextView = (toCustom) => {
        animateDivider(0.5);
        fadeContent(null, 0);
        setTimeout(() => {
            if (toCustom) {
                router.push({
                    pathname: "../components/icon",
                    params: { nrOfPlayers: 2 },
                });
                return;
            } else {
                router.push({
                    pathname: "../components/genreRandom",
                    params: { ...defaultQuickMatch, nrOfPlayers: 2, from: "main" },
                });
                return;
            }
        }, 600);

    };




    return (
        <View style={styles.container}>
            {/* Web-only shader */}
            {Platform.OS === "web" && (
                <ShaderBackground
                    color1={[0.255, 0.184, 0.494]}
                    color2={[0.455, 0.294, 0.549]}
                    color3={[0.718, 0.459, 0.525]}
                    color4={[0.455, 0.294, 0.549]}
                    speed={0.2}
                    scale={3.0}
                    style={styles.webShader}
                />
            )}
            <Animated.View style={{ flex: 1, width: "100%", opacity: fadeAnim }}>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>Welcome to Songfrontation!</Text>

                    <View style={styles.topRightButtons}>
                        <TouchableOpacity
                            style={styles.settingsButton}
                            onPress={() => {
                                useSound().playButtonSound();
                                setHelpVisible(true);
                            }}
                        >
                            <Text style={styles.settingsText}>ℹ️</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.settingsButton}
                            onPress={() => {
                                useSound().playButtonSound();
                                router.push("../components/settings");
                            }}
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
                                onPress={() =>  {
                                    useSound().playButtonSound();
                                    router.push({
                                        pathname: "../components/genreRandom",
                                        params: { ...defaultQuickMatch, nrOfPlayers: 1, from: "main" },
                                    });

                                }
                                }

                            />
                            <View style={styles.divider} />
                            <PlayerButton
                                label="2 Players"
                                onPress={() =>
                                    {
                                        swipeAnimationAndRouteToNextView(false);
                                        useSound().playButtonSound();
                                    }
                                }

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
                                onPress={() => {
                                    useSound().playButtonSound();
                                    router.push({
                                        pathname: "../components/iconSinglePlayer",
                                        params: { nrOfPlayers: 1 },
                                    })}
                                }
                            />
                            <View style={styles.divider} />
                            <PlayerButton
                                label="2 Players"
                                onPress={() => {
                                    useSound().playButtonSound();
                                    swipeAnimationAndRouteToNextView(1);
                                }}
                            />
                        </LinearGradient>
                    </View>
                </View>
            </Animated.View>



            <Help visible={helpVisible} onClose={() => {
                useSound().playButtonSound();
                setHelpVisible(false);
            }} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 40,
        alignItems: "center",
        justifyContent: "flex-start",
        backgroundColor: "transparent",
    },
    webShader: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 0,
        position: "absolute",
        backgroundColor: "transparent"
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
        backgroundColor: "#6466bc",
        borderWidth: 2,
        borderColor: "white",
        shadowColor: "#8e7cc3",
        shadowOpacity: 0.5,
        shadowRadius: 8,
        elevation: 10,
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
    menuButton: {
        backgroundColor: "#412F7E",
        borderRadius: 30,
        paddingVertical: 15,
        paddingHorizontal: 30,
        marginTop: 20,
        elevation: 5,
    },
    menuButtonText: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold",
        textAlign: "center",
        fontFamily: "OutfitBold",
    },
});
