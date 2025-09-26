import { Stack } from "expo-router";
import { useState } from "react";
import { StyleSheet } from "react-native";
import ShaderBackground from "./components/backgroundShader";
import { BackgroundShaderContext } from "./components/backgroundShaderContext";

export default function RootLayout() {
  // State for shader properties
  const [dividerPos, setDividerPos] = useState(1);

  return (

    <BackgroundShaderContext.Provider  value={{ dividerPos, setDividerPos }}>
        <ShaderBackground
          color1={[0.255, 0.184, 0.494]}
          color2={[0.455, 0.294, 0.549]}
          color3={[0.718, 0.459, 0.525]}
          color4={[0.455, 0.294, 0.549]}
          speed={0.2}
          scale={3.0}
          dividerPos={dividerPos} // updated dynamically
          style={styles.shader}
        >


        <Stack
          screenOptions={{ headerShown: false, 
          animation: "none", 
          contentStyle: { backgroundColor: "transparent" } }}
          initialParams={{ setDividerPos }}
           // pass setter to pages
        />
      </ShaderBackground>
    </BackgroundShaderContext.Provider>
  );
}

const styles = StyleSheet.create({
  shader: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
});