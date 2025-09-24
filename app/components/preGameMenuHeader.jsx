import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function PreGameMenuHeader({
    title,
    onBack,
    onProceed,
    canProceed = true,
    proceedLabel = "Next",
}) {
    return (
        <View style={styles.headerContainer}>
            {/* Back Button */}
            <TouchableOpacity onPress={onBack} style={styles.sideButton}>
                <Text style={styles.backText}>←</Text>
            </TouchableOpacity>

            {/* Title */}
            <View style={styles.titleContainer}>
                <Text style={styles.title}>{title}</Text>
            </View>

            {/* Proceed Button */}
            <TouchableOpacity
                onPress={canProceed ? onProceed : null}
                style={[
                    styles.sideButton,
                    !canProceed && styles.disabledButton,
                ]}
                disabled={!canProceed}
            >
                <Text style={[styles.proceedText, !canProceed && styles.disabledText]}>
                    {proceedLabel}
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingTop: 10,
        paddingHorizontal: 16,
        paddingBottom: 10,
    },
    sideButton: {
        padding: 8,
        minWidth: 60,
        alignItems: "center",
    },
    backText: {
        fontSize: 28,
        color: "#fff",
        fontWeight: "bold",

    },
    proceedText: {
        fontSize: 18,
        color: "#4CAF50",
        fontWeight: "bold",
    },
    disabledButton: {
        opacity: 0.5,
    },
    disabledText: {
        color: "#aaa",
    },
    titleContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    title: {
        fontSize: 22,
        color: "#fff",
        fontWeight: "bold",
    },
});