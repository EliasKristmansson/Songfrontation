import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
    Button,
    Pressable,
    Text,
    View
} from "react-native";

export default function Main() {
    const router = useRouter();

    return (
        <View
            style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "white",
            }}
        >
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

            <Button
                title="Settings"
                onPress={() => router.push("../components/settings")}
            />
            <Button
                title="QuickGame"
                onPress={() => router.push("../components/match")}
            />
            <Button
                title="CustomGame"
                onPress={() => router.push("../components/icon")}
            />
            <Button
                title="Splash"
                onPress={() => router.push("../components/splashScreen")}
            />

            <LinearGradient
                colors={["#6a82fb", "#8e7cc3", "#a18cd1", "#7f6edb"]}
                start={[0.1, 0]}
                end={[0.9, 1]}
                style={{
                    flexDirection: "row",
                    borderRadius: 50,
                    marginTop: 30,
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
                            transform: [{ skewX: "-15deg" }], // skew
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
                            transform: [{ skewX: "-15deg" }], // skew
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
    );
}
