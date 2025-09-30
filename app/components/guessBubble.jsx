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
    flashRed = false, // NEW
}) {
    const scaleRef = useRef(new Animated.Value(1)).current;
    const glowRef = useRef(new Animated.Value(0)).current; // 0 = no red, 1 = full red

    useEffect(() => {
        if (flashRed) {
            glowRef.setValue(1);
            Animated.timing(glowRef, {
                toValue: 0,
                duration: 400, // flash duration
                useNativeDriver: false,
            }).start();
        }
    }, [flashRed]);

    const handlePressIn = () => {
        Animated.spring(scaleRef, { toValue: 0.92, useNativeDriver: true }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleRef, { toValue: 1, friction: 4, useNativeDriver: true }).start();
    };

    const borderColor = glowRef.interpolate({
        inputRange: [0, 1],
        outputRange: ["transparent", "#F87171"], // red glow
    });

    return (
        <Animated.View
            style={[
                { transform: [{ scale: scaleRef }], borderColor, borderWidth: 4 },
                styles.bubbleWrapper,
                positionStyle,
            ]}
        >
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
