import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useRef } from "react";
import {
    Animated,
    Button,
    Dimensions,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

const windowWidth = Dimensions.get("window").width;
const BUTTON_WIDTH = Math.min(350, windowWidth - 40); // responsive width

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
            style={{ flex: 1, position: "relative" }}
        >
            <Animated.View
                pointerEvents="none"
                style={[StyleSheet.absoluteFillObject, styles.overlay, { opacity }]}
            />
            <View style={styles.playerContent}>
                <Text style={styles.playerText}>{label}</Text>
            </View>
        </Pressable>
    );
}

export default function Main() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            {/* Top Buttons */}
            <View style={styles.topButtons}>
                <Button
                    title="Settings"
                    onPress={() => router.push("../components/settings")}
                />
                <Button
                    title="Splash"
                    onPress={() => router.push("../components/splashScreen")}
                />
            </View>

            {/* Center Content */}
            <View style={styles.centerContent}>
                <Text style={styles.title}>Welcome to Songfrontation!</Text>

                {/* Quick Match */}
                <View style={{ width: BUTTON_WIDTH, alignItems: "flex-start", paddingLeft: 10 }}>
                    <Text style={styles.sectionLabel}>Quick Match</Text>
                </View>
                <LinearGradient
                    colors={["#6a82fb", "#8e7cc3", "#a18cd1", "#7f6edb"]}
                    start={[0.1, 0]}
                    end={[0.9, 1]}
                    style={[styles.buttonRow, { width: BUTTON_WIDTH }]}
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

                {/* Custom Match */}
                <View style={{ width: BUTTON_WIDTH, alignItems: "flex-start", paddingLeft: 10, marginTop: 30 }}>
                    <Text style={styles.sectionLabel}>Custom Match</Text>
                </View>
                <LinearGradient
                    colors={["#6a82fb", "#8e7cc3", "#a18cd1", "#7f6edb"]}
                    start={[0.1, 0]}
                    end={[0.9, 1]}
                    style={[styles.buttonRow, { width: BUTTON_WIDTH }]}
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
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
        paddingTop: 40,
        alignItems: "center",
    },
    topButtons: {
        width: "90%",
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 20,
    },
    centerContent: {
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "center",
        width: "100%",
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "black",
        marginBottom: 20,
        textAlign: "center",
    },
    sectionLabelWrap: {
        width: "90%",
        alignItems: "flex-start",
        paddingLeft: 10,
    },
    sectionLabel: {
        fontSize: 16,
        color: "black",
    },
    buttonRow: {
        flexDirection: "row",
        borderRadius: 50,
        marginTop: 10,
        overflow: "hidden",
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
    overlay: {
        backgroundColor: "rgba(0,0,0,0.25)",
        transform: [{ skewX: "-15deg" }],
        zIndex: 0,
    },
    playerContent: {
        zIndex: 1,
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 16,
    },
    playerText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
        letterSpacing: 2,
        fontStyle: "normal",
        textAlign: "center",
    },
});
