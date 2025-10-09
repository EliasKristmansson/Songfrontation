import { Stack } from "expo-router";
import { useState } from "react";
import { StyleSheet } from "react-native";
import { AudioProvider } from "./components/audioContext";
import ShaderBackground from "./components/backgroundShader";
import { BackgroundShaderContext } from "./components/backgroundShaderContext";
import FontProvider from "./components/fontProvider";

export default function RootLayout() {
    // State for shader properties
    const [dividerPos, setDividerPos] = useState(1.1);
    const [animationSpeed, setAnimationSpeed] = useState(0.2);
    const [primaryBackgroundColor, setPrimaryBackgroundColor] = useState([0.255, 0.184, 0.494]);
    const [secondaryBackgroundColor, setSecondaryBackgroundColor] = useState([0.337, 0.388, 0.769]);

    return (
        <AudioProvider>
            <FontProvider>
                <BackgroundShaderContext.Provider value={{
                    dividerPos, setDividerPos,
                    animationSpeed, setAnimationSpeed,
                    primaryBackgroundColor, setPrimaryBackgroundColor,
                    secondaryBackgroundColor, setSecondaryBackgroundColor,
                }}>

                    <ShaderBackground
                        color1={primaryBackgroundColor}
                        color2={[0.439, 0.506, 1.000]}

                        color3={secondaryBackgroundColor}
                        color4={[0.718, 0.459, 0.525]}

                        speed={animationSpeed} // updated dynamically
                        scale={1}
                        dividerPos={dividerPos} // updated dynamically
                        style={styles.shader}
                    >


                        <Stack
                            screenOptions={{
                                headerShown: false,
                                animation: "none",
                                contentStyle: { backgroundColor: "transparent" }
                            }}
                            initialParams={{ setDividerPos }}
                        // pass setter to pages
                        />
                    </ShaderBackground>
                </BackgroundShaderContext.Provider>
            </FontProvider>
        </AudioProvider>
    );
}

const styles = StyleSheet.create({
    shader: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 0,
    },
});