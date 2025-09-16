import { useRouter } from "expo-router";
import { Button, Text, TouchableOpacity, View } from "react-native";

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
            <Text style={{ fontSize: 32, fontWeight: "bold", color: "black", marginBottom: 40 }}>
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

            <View
                style={{
                    flexDirection: "row",
                    borderRadius: 50,
                    overflow: "hidden",
                    marginBottom: 20,
                }}
            >
                <TouchableOpacity
                    style={{
                        flex: 1,
                        backgroundColor: "#ff69b4",
                        paddingVertical: 24,
                        alignItems: "center",
                        justifyContent: "center",
                        borderTopLeftRadius: 50,
                        borderBottomLeftRadius: 50,
                        borderRightWidth: 2,
                        borderRightColor: "#fff",
                    }}
                >
                    <Text style={{ color: "white", fontSize: 16, fontWeight: "bold", letterSpacing: 2 }}>
                        1 Player
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{
                        width: 200,
                        flex: 1,
                        backgroundColor: "#8e44ad",
                        alignItems: "center",
                        justifyContent: "center",
                        borderTopRightRadius: 50,
                        borderBottomRightRadius: 50,
                        borderLeftWidth: 2,
                        borderLeftColor: "#fff",
                    }}
                >
                    <Text style={{ color: "white", fontSize: 16, fontWeight: "bold", letterSpacing: 2 }}>
                        2 Players
                    </Text>
                </TouchableOpacity>
            </View>
            <Text style={{ fontSize: 16, color: "#ff69b4", fontWeight: "bold", marginTop: 10, letterSpacing: 1 }}>
                Pick your mode and start the music quiz!
            </Text>
        </View>
    );
}