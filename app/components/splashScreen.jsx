import { Asset } from "expo-asset";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";
import Main from "./main";

export default function SplashScreen() {
    const [ready, setReady] = useState(false);
    const [assets, setAssets] = useState(null); // ✅ keep naming consistent

    useEffect(() => {
        async function preload() {
            // Preload background
            const bg = Asset.fromModule(
                require("../../assets/images/Background3.png")
            );
            await bg.downloadAsync();

            // Preload stars
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

            // ✅ actually set into `assets`
            setAssets({ bg: bg.localUri || bg.uri, stars });
            setReady(true);
        }
        preload();
    }, []);

    if (!ready || !assets) {
        return (
            <View style={styles.container}>
                <View style={styles.iconBox}>
                    <Image
                        source={require("../../assets/images/appicon2.png")}
                        style={styles.iconImage}
                        resizeMode="contain"
                    />
                </View>

                <View style={styles.textRow}>
                    <Text style={styles.loadingText}>Loading the Game</Text>
                    <ActivityIndicator
                        size="small"
                        color="black"
                        style={{ marginLeft: 8 }}
                    />
                </View>
            </View>
        );
    }

    // ✅ Now `assets` is defined
    return <Main background={assets.bg} stars={assets.stars} />;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    iconBox: {
        width: 120,
        height: 120,
        backgroundColor: "#e0e0e0",
        borderRadius: 24,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 32,
        overflow: "hidden",
        borderWidth: 2,
        borderColor: "white",
    },
    iconImage: {
        width: "100%",
        height: "100%",
    },
    textRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    loadingText: {
        fontSize: 24,
        color: "black",
        fontWeight: "bold",
        letterSpacing: 1,
    },
});
