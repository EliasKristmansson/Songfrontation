import { Stack } from "expo-router";
import { useState } from "react";
import { StyleSheet } from "react-native";
import ShaderBackground from "./components/backgroundShader";
import { BackgroundShaderContext } from "./components/backgroundShaderContext";
import FontProvider from "./components/fontProvider";

export default function RootLayout() {
    // State for shader properties
    const [dividerPos, setDividerPos] = useState(1);

    return (
        <FontProvider>
            <BackgroundShaderContext.Provider value={{ dividerPos, setDividerPos }}>
                <ShaderBackground
                    color1={[0.976, 0.710, 0.780]}
                    color2={[0.439, 0.506, 1.000]}

                    color3={[0.337, 0.388, 0.769]}
                    color4={[0.718, 0.459, 0.525]}

                    speed={0.2}
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

    );
}

const styles = StyleSheet.create({
    shader: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 0,
    },
});