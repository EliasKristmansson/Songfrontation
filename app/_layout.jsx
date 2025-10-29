import { Stack } from "expo-router";
import { useRef, useState } from "react";
import { StyleSheet } from "react-native";
import { AudioProvider } from "./components/audioContext";
import ShaderBackground from "./components/backgroundShader";
import { BackgroundShaderContext } from "./components/backgroundShaderContext";
import FontProvider from "./components/fontProvider";

export default function RootLayout() {
    // State for shader properties
    //const [dividerPos, setDividerPos] = useState(1.1);
    const [animationSpeed, setAnimationSpeed] = useState(0.2);
    const primaryBackgroundColorRef = useRef([0.255, 0.184, 0.494]);
    const secondaryBackgroundColorRef = useRef([0.337, 0.388, 0.769]);
    const dividerPosRef = useRef(1.1);


    return (
        <AudioProvider>
            <FontProvider>
                <BackgroundShaderContext.Provider value={{
                    animationSpeed, setAnimationSpeed,
                    primaryBackgroundColorRef,
                    secondaryBackgroundColorRef,
                    dividerPosRef,
                }}>

                    <ShaderBackground
                        color1={primaryBackgroundColorRef} // updated dynamically, can pulse green as part of animation defined in match component
                        color2={[0.439, 0.506, 1.000]}

                        color3={secondaryBackgroundColorRef} // updated dynamically, can pulse green as part of animation defined in match component
                        color4={[0.718, 0.459, 0.525]}

                        speed={animationSpeed} // updated dynamically, 0 for disabling shader animations. Accessed in settings component
                        scale={1}
                        dividerPos={dividerPosRef} // updated dynamically, handles position of divider when starting/exiting 2-player matches
                        style={styles.shader}
                    >


                        <Stack
                            screenOptions={{
                                headerShown: false,
                                animation: "none",
                                contentStyle: { backgroundColor: "transparent" }
                            }}
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