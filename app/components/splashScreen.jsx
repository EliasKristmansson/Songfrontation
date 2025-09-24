import { Asset } from "expo-asset";
import * as Font from "expo-font";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";
import Main from "./main";

export default function SplashScreen() {
    const [ready, setReady] = useState(false);
    const [assets, setAssets] = useState(null);

    useEffect(() => {
        async function preload() {
            try {
                // Preload background
                const bg = Asset.fromModule(
                    require("../../assets/images/Background3compressed2.webp")
                );
                await bg.downloadAsync();

                // Preload stars
                const starSources = [
                    require("../../assets/images/star1.webp"),
                    require("../../assets/images/star2.webp"),
                    require("../../assets/images/star3.webp"),
                    require("../../assets/images/star4.webp"),
                ];
                const stars = [
                    { source: starSources[0], top: "8%", left: "10%", size: 25 },
                    { source: starSources[1], top: "20%", left: "80%", size: 35 },
                    { source: starSources[2], top: "35%", left: "15%", size: 30 },
                    { source: starSources[3], top: "50%", left: "75%", size: 28 },
                    { source: starSources[0], top: "65%", left: "12%", size: 32 },
                    { source: starSources[1], top: "78%", left: "85%", size: 40 },
                ];

                // Preload fonts (the ones you use: OutfitBold, OutfitLight, OutfitRegular)
                await Font.loadAsync({
                    OutfitBold: require("../../assets/fonts/Outfit/Outfit-Bold.ttf"),
                    OutfitLight: require("../../assets/fonts/Outfit/Outfit-Light.ttf"),
                    OutfitRegular: require("../../assets/fonts/Outfit/Outfit-Regular.ttf"),
                });

                // Save preloaded assets
                setAssets({ bg: bg.localUri || bg.uri, stars });
                setReady(true);
            } catch (err) {
                console.warn("Asset loading failed", err);
            }
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

    // Only show Main when everything is loaded
    return <Main background={assets.bg} stars={assets.stars} />;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "white", // ✅ no flicker to black
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
