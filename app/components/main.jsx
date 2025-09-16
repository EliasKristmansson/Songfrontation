import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Button,
    Pressable,
    Text,
    View
} from "react-native";

export default function Main() {
  const router = useRouter();
  const [pressed, setPressed] = useState(null);

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

      <LinearGradient
        colors={["#6a82fb", "#a18cd1"]}
        start={[0, 0]}
        end={[1, 1]}
        style={{
          flexDirection: "row",
          borderRadius: 50,
          marginTop: 30,
          width: 400,
          overflow: "hidden",
        }}
      >
        {/* Player 1 */}
        <Pressable
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 24,
            backgroundColor: pressed === "1p" ? "rgba(0,0,0,0.1)" : "transparent",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: pressed === "1p" ? 4 : 0 },
            shadowOpacity: pressed === "1p" ? 0.3 : 0,
            shadowRadius: pressed === "1p" ? 6 : 0,
          }}
          onPressIn={() => setPressed("1p")}
          onPressOut={() => setPressed(null)}
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
            width: 2,
            backgroundColor: "rgba(0,0,0,0.2)",
          }}
        />

        {/* Player 2 */}
        <Pressable
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 24,
            backgroundColor: pressed === "2p" ? "rgba(0,0,0,0.1)" : "transparent",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: pressed === "2p" ? 4 : 0 },
            shadowOpacity: pressed === "2p" ? 0.3 : 0,
            shadowRadius: pressed === "2p" ? 6 : 0,
          }}
          onPressIn={() => setPressed("2p")}
          onPressOut={() => setPressed(null)}
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
