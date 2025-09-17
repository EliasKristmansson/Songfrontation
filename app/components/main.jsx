import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useRef } from "react";
import {
    Animated,
    Button,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

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
            style={{ flex: 1, position: "relative" }} // position needed for absolute overlay
        >
            {/* IMPORTANT: overlay is rendered BEFORE text -> it will sit UNDER the text */}
            <Animated.View
                pointerEvents="none"
                style={[
                    StyleSheet.absoluteFillObject,
                    styles.overlay,
                    { opacity },
                ]}
            />

            {/* Text/content (untransformed) */}
            <View style={styles.playerContent}>
                <Text style={styles.playerText}>{label}</Text>
            </View>
        </Pressable>
    );
}

export default function Main() {
    const router = useRouter();

    return (
        <View style={{ flex: 1, backgroundColor: "white", paddingTop: 40 }}>
            {/* Top Navigation Buttons */}
            <Button
                title="Settings"
                onPress={() => router.push("../components/settings")}
            />
            <Button
                title="Splash"
                onPress={() => router.push("../components/splashScreen")}
            />

            {/* Center Content */}
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                {/* Title */}
                <Text style={styles.title}>Welcome to Songfrontation!</Text>

                {/* Quick Match Label (left aligned above the buttons) */}
                <View style={styles.sectionLabelWrap}>
                    <Text style={styles.sectionLabel}>Quick Match</Text>
                </View>

                {/* Quick Match Buttons */}
                <LinearGradient
                    colors={["#6a82fb", "#8e7cc3", "#a18cd1", "#7f6edb"]}
                    start={[0.1, 0]}
                    end={[0.9, 1]}
                    style={styles.buttonRow}
                >
                    <PlayerButton
                        label="1 Player"
                        onPress={() => router.push("../components/match")}
                    />

                    {/* Divider */}
                    <View style={styles.divider} />

                    <PlayerButton
                        label="2 Players"
                        onPress={() => router.push("../components/match")}
                    />
                </LinearGradient>

                {/* Custom Match Label */}
                <View style={[styles.sectionLabelWrap, { marginTop: 30 }]}>
                    <Text style={styles.sectionLabel}>Custom Match</Text>
                </View>

                {/* Custom Match Buttons */}
                <LinearGradient
                    colors={["#6a82fb", "#8e7cc3", "#a18cd1", "#7f6edb"]}
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
    );
}

const styles = StyleSheet.create({
    title: {
        fontSize: 32,
        fontWeight: "bold",
        color: "black",
        marginBottom: 40,
    },
    sectionLabelWrap: {
        width: 400,
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
        width: 400,
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
        paddingVertical: 24,
    },
    playerText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
        letterSpacing: 2,
        fontStyle: "normal",
    },
});
