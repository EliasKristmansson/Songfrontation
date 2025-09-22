// src/context/FontProvider.jsx
import { useFonts } from "expo-font";
import { ActivityIndicator, View } from "react-native";
import FontContext from "./fontContext";

export default function FontProvider({ children }) {
    const [fontsLoaded] = useFonts({
        OutfitBlack: require("../../assets/fonts/Outfit/Outfit-Black.ttf"),
        OutfitBold: require("../../assets/fonts/Outfit/Outfit-Bold.ttf"),
        OutfitExtraBold: require("../../assets/fonts/Outfit/Outfit-ExtraBold.ttf"),
        OutfitExtraLight: require("../../assets/fonts/Outfit/Outfit-ExtraLight.ttf"),
        OutfitLight: require("../../assets/fonts/Outfit/Outfit-Light.ttf"),
        OutfitMedium: require("../../assets/fonts/Outfit/Outfit-Medium.ttf"),
        OutfitRegular: require("../../assets/fonts/Outfit/Outfit-Regular.ttf"),
        OutfitSemiBold: require("../../assets/fonts/Outfit/Outfit-SemiBold.ttf"),
        OutfitThin: require("../../assets/fonts/Outfit/Outfit-Thin.ttf"),
    });

    // Show a loading screen until fonts are ready
    if (!fontsLoaded) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <FontContext.Provider value={{ fontsLoaded }}>
            {children}
        </FontContext.Provider>
    );
}
