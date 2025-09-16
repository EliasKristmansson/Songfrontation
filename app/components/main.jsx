import { Text, TouchableOpacity, View } from "react-native";

export default function Main() {
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
            <View
                style={{
                    flexDirection: "row",
                    borderRadius: 50,
                    overflow: "hidden",
                    marginBottom: 20,
                    elevation: 8,
                    shadowColor: "#ff69b4",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.4,
                    shadowRadius: 10,
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
                    <Text style={{ color: "white", fontSize: 22, fontWeight: "bold", letterSpacing: 2 }}>
                        1 Player
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{
                        flex: 1,
                        backgroundColor: "#8e44ad",
                        paddingVertical: 24,
                        alignItems: "center",
                        justifyContent: "center",
                        borderTopRightRadius: 50,
                        borderBottomRightRadius: 50,
                        borderLeftWidth: 2,
                        borderLeftColor: "#fff",
                    }}
                >
                    <Text style={{ color: "white", fontSize: 22, fontWeight: "bold", letterSpacing: 2 }}>
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