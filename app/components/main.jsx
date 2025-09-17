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
            <View
                style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                {/* Title */}
                <Text
                    style={{
                        fontSize: 32,
                        fontWeight: "bold",
                        color: "black",
                        marginBottom: 40,
                    }}
                >
                    Welcome to Songfrontation!
                </Text>

                {/* Quick Match Label (aligned left, above buttons) */}
                <View
                    style={{
                        width: 400,
                        alignItems: "flex-start",
                        paddingLeft: 10,
                    }}
                >
                    <Text
                        style={{
                            fontSize: 16,
                            color: "black",
                        }}
                    >
                        Quick Match
                    </Text>
                </View>

                {/* Quick Match Buttons */}
                <LinearGradient
                    colors={["#6a82fb", "#8e7cc3", "#a18cd1", "#7f6edb"]}
                    start={[0.1, 0]}
                    end={[0.9, 1]}
                    style={{
                        flexDirection: "row",
                        borderRadius: 50,
                        marginTop: 10,
                        width: 400,
                        overflow: "hidden",
                        position: "relative",
                    }}
                >
                    {/* Player 1 */}
                    <Pressable
                        style={({ pressed }) => [
                            {
                                flex: 1,
                                alignItems: "center",
                                justifyContent: "center",
                                paddingVertical: 24,
                            },
                            pressed && {
                                backgroundColor: "rgba(0,0,0,0.2)",
                                transform: [{ skewX: "-15deg" }],
                            },
                        ]}
                        onPress={() => {
                            /* handle 1 player */
                        }}
                    >
                        <Text
                            style={{
                                color: "white",
                                fontSize: 16,
                                fontWeight: "bold",
                                letterSpacing: 2,
                            }}
                        >
                            1 Player
                        </Text>
                    </Pressable>

                    {/* Divider */}
                    <View
                        style={{
                            position: "absolute",
                            top: 0,
                            bottom: 0,
                            left: "50%",
                            width: 2,
                            backgroundColor: "rgba(0,0,0,0.25)",
                            transform: [{ rotate: "15deg" }],
                        }}
                    />

                    {/* Player 2 */}
                    <Pressable
                        style={({ pressed }) => [
                            {
                                flex: 1,
                                alignItems: "center",
                                justifyContent: "center",
                                paddingVertical: 24,
                            },
                            pressed && {
                                backgroundColor: "rgba(0,0,0,0.2)",
                                transform: [{ skewX: "-15deg" }],
                            },
                        ]}
                        onPress={() => {
                            /* handle 2 player */
                        }}
                    >
                        <Text
                            style={{
                                color: "white",
                                fontSize: 16,
                                fontWeight: "bold",
                                letterSpacing: 2,
                            }}
                        >
                            2 Players
                        </Text>
                    </Pressable>
                </LinearGradient>


                {/* Custom Match Label (aligned left, above buttons) */}
                <View
                    style={{
                        width: 400,
                        alignItems: "flex-start",
                        paddingLeft: 10,
                    }}
                >
                    <Text
                        style={{
                            fontSize: 16,
                            color: "black",
                        }}
                    >
                        Quick Match
                    </Text>
                </View>
                {/* Custom Match Buttons */}
                <LinearGradient
                    colors={["#6a82fb", "#8e7cc3", "#a18cd1", "#7f6edb"]}
                    start={[0.1, 0]}
                    end={[0.9, 1]}
                    style={{
                        flexDirection: "row",
                        borderRadius: 50,
                        marginTop: 10,
                        width: 400,
                        overflow: "hidden",
                        position: "relative",
                    }}
                >
                    {/* Player 1 */}
                    <Pressable
                        style={({ pressed }) => [
                            {
                                flex: 1,
                                alignItems: "center",
                                justifyContent: "center",
                                paddingVertical: 24,
                            },
                            pressed && {
                                backgroundColor: "rgba(0,0,0,0.2)",
                                transform: [{ skewX: "-15deg" }],
                            },
                        ]}
                        onPress={() => {
                            /* handle 1 player */
                        }}
                    >
                        <Text
                            style={{
                                color: "white",
                                fontSize: 16,
                                fontWeight: "bold",
                                letterSpacing: 2,
                            }}
                        >
                            1 Player
                        </Text>
                    </Pressable>

                    {/* Divider */}
                    <View
                        style={{
                            position: "absolute",
                            top: 0,
                            bottom: 0,
                            left: "50%",
                            width: 2,
                            backgroundColor: "rgba(0,0,0,0.25)",
                            transform: [{ rotate: "15deg" }],
                        }}
                    />

                    {/* Player 2 */}
                    <Pressable
                        style={({ pressed }) => [
                            {
                                flex: 1,
                                alignItems: "center",
                                justifyContent: "center",
                                paddingVertical: 24,
                            },
                            pressed && {
                                backgroundColor: "rgba(0,0,0,0.2)",
                                transform: [{ skewX: "-15deg" }],
                            },
                        ]}
                        onPress={() => {
                            /* handle 2 player */
                        }}
                    >
                        <Text
                            style={{
                                color: "white",
                                fontSize: 16,
                                fontWeight: "bold",
                                letterSpacing: 2,
                            }}
                        >
                            2 Players
                        </Text>
                    </Pressable>
                </LinearGradient>
            </View>
        </View>
    );
}
