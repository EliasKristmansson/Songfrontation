import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useRef } from "react";
import {
    Animated,
    Dimensions,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";

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
    const router = useRouter();

    return (
        <View style={styles.container}>
            {/* Title with settings icon */}
            <View style={styles.titleContainer}>
                <Text style={styles.title}>Welcome to Songfrontation!</Text>
                <TouchableOpacity
                    style={styles.settingsButtonAbsolute}
                    onPress={() => router.push("../components/settings")}
                >
                    <Text style={styles.settingsText}>⚙️</Text>
                </TouchableOpacity>
            </View>

            {/* Center Content */}
            <View style={styles.centerContent}>
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
                    <PlayerButton label="1 Player" onPress={() => router.push("../components/match")} />
                    <View style={styles.divider} />
                    <PlayerButton label="2 Players" onPress={() => router.push("../components/match")} />
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
                    <PlayerButton label="1 Player" onPress={() => router.push("../components/icon")} />
                    <View style={styles.divider} />
                    <PlayerButton label="2 Players" onPress={() => router.push("../components/icon")} />
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
    titleContainer: {
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
        position: "relative",
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "black",
        textAlign: "center",
    },
    settingsButtonAbsolute: {
        position: "absolute",
        right: 20,
        top: 0,
        padding: 4,
        borderRadius: 16,
        backgroundColor: "#f5f5f5",
    },
    settingsText: {
        fontSize: 24,
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
        height: 60,
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
        fontStyle: "normal",
        textAlign: "center",
    },
    centerContent: {
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "center",
        width: "100%",
    },
});
