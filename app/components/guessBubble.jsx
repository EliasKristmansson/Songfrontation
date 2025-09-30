// components/GuessBubble.jsx
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, TouchableOpacity } from "react-native";

export default function GuessBubble({
    option,
    onPress,
    disabled,
    animatedIndex,
    positionStyle,
    glowColor = null, // "green" | "red" | null
}) {
    const scaleRef = useRef(new Animated.Value(1)).current;
    const glowRef = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (glowColor) {
            glowRef.setValue(1);
            Animated.timing(glowRef, {
                toValue: 0,
                duration: 400,
                useNativeDriver: false, // borderColor = JS only
            }).start();
        }
    }, [glowColor]);

    const handlePressIn = () => {
        Animated.spring(scaleRef, { toValue: 0.92, useNativeDriver: true }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleRef, { toValue: 1, friction: 4, useNativeDriver: true }).start();
    };

    const animatedShadowStyle = {
        shadowColor: glowColor === "green" ? "#4ADE80" : "#F87171",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: glowRef,
        shadowRadius: 12,
        elevation: glowRef.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 8], // Android shadow
        }),
    };


    return (
        <Animated.View
            style={[
                styles.bubbleWrapper,
                positionStyle,
                animatedShadowStyle, // JS-driven glow here
            ]}
        >
            <Animated.View style={{ transform: [{ scale: scaleRef }] }}>
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={onPress}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    disabled={disabled}
                    style={[styles.bubbleOption, disabled && styles.bubbleDisabled]}
                >
                    <LinearGradient
                        colors={["#B77586", "#896DA3", "#5663C4", "#412F7E"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.bubbleOptionInner}
                    >
                        <Text style={styles.optionText}>{option.title}</Text>
                        <Text style={styles.optionArtist}>{option.artist}</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </Animated.View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    bubbleWrapper: {
        position: "absolute",
        borderRadius: 80,
    },
    bubbleOption: {
        width: 120,
        height: 120,
        borderRadius: 80,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "white",
        shadowOpacity: 1,
        shadowRadius: 8,
        elevation: 6,
        overflow: "hidden",
        backgroundColor: "#412F7E",
        margin: 20,
    },
    bubbleOptionInner: {
        flex: 1,
        width: "100%",
        height: "100%",
        borderRadius: 80,
        alignItems: "center",
        justifyContent: "center",
    },
    bubbleDisabled: { opacity: 0.5 },
    optionText: {
        color: "white",
        fontWeight: "700",
        fontSize: 14,
        textAlign: "center",
    },
    optionArtist: { fontSize: 11, color: "#D1D5DB" },
});
