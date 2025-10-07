import Slider from "@react-native-community/slider";
import { useRouter } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { useAudio } from "../components/audioContext"; // adjust path if needed
import { BackgroundShaderContext } from "./backgroundShaderContext";


export default function Settings() {
    const router = useRouter();
    const {
        masterVolume,
        setMasterVolume,
        effectsVolume,
        setEffectsVolume,
        musicVolume,
        setMusicVolume,
    } = useAudio();
    const { animationSpeed, setAnimationSpeed } = useContext(BackgroundShaderContext);

    // Sync toggle with animationSpeed
    const [animationsEnabled, setAnimationsEnabled] = useState(animationSpeed > 0);

    useEffect(() => {
        setAnimationsEnabled(animationSpeed > 0);
    }, [animationSpeed]);

    const handleToggleAnimations = (enabled) => {
        setAnimationsEnabled(enabled);
        setAnimationSpeed(enabled ? 0.2 : 0);
    };

    // Convert values (0–100) to (0–1) when updating
    return (
        <View>
            <TouchableOpacity onPress={() => router.push("/")} style={styles.backButton}>
                <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.slidersColumn}>
                    {[
                        { label: "Master", value: masterVolume, setValue: setMasterVolume },
                        { label: "Effects", value: effectsVolume, setValue: setEffectsVolume },
                        { label: "Music", value: musicVolume, setValue: setMusicVolume },
                    ].map(({ label, value, setValue }) => (
                        <View key={label} style={styles.sliderCard}>
                            <Text style={styles.volumeLabel}>{label} Volume</Text>
                            <View style={styles.sliderRow}>
                                <Text style={styles.sliderLabel}>0%</Text>
                                <Slider
                                    style={styles.slider}
                                    minimumValue={0}
                                    maximumValue={1}
                                    step={0.01}
                                    value={value}
                                    onValueChange={setValue}
                                    minimumTrackTintColor="#fff"
                                    maximumTrackTintColor="rgba(255,255,255,0.3)"
                                    thumbTintColor="white"
                                />
                                <Text style={styles.sliderLabel}>100%</Text>
                            </View>
                            <Text style={styles.sliderInfo}>{Math.round(value * 100)}%</Text>
                        </View>
                    ))}
                </View>
                <View style={styles.toggleCard}>
                    <Text style={styles.volumeLabel}>Background Animations</Text>
                    <View style={styles.toggleRow}>
                        <Text style={styles.animationLabel}>Off</Text>
                        <Switch
                            value={animationsEnabled}
                            onValueChange={handleToggleAnimations}
                            trackColor={{ false: "#888", true: "#888" }}
                            thumbColor="#ddd"
                        />
                        <Text style={styles.animationLabel}>On</Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        alignItems: "center",
        paddingHorizontal: 16,
        paddingBottom: 40,
        paddingTop: 40, // leave space for back arrow
    },
    backButton: {
        position: "absolute",
        top: 20,
        left: 20,
        zIndex: 10,
        padding: 8,
    },
    backArrow: {
        color: "white",
        fontSize: 28,
    },
    slidersColumn: {
        width: "100%",
        alignItems: "center",
    },
    sliderCard: {
        backgroundColor: "rgba(0,0,0,0.35)",
        borderRadius: 14,
        padding: 12,
        marginVertical: 12,
        width: "95%",
        maxWidth: 500,
        alignItems: "center",
    },
    volumeLabel: {
        fontSize: 16,
        fontFamily: "OutfitBold",
        color: "#fff",
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    sliderRow: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
    },
    slider: {
        flex: 1,
        marginHorizontal: 8,
        height: 8,
    },
    sliderLabel: {
        fontSize: 12,
        fontFamily: "OutfitRegular",
        color: "#ddd",
        width: 32,
        textAlign: "center",
    },
    sliderInfo: {
        fontSize: 14,
        fontFamily: "OutfitBold",
        color: "white",
        marginTop: 4,
    },
    toggleCard: {
        backgroundColor: "rgba(0,0,0,0.35)",
        borderRadius: 14,
        padding: 12,
        marginVertical: 12,
        width: "95%",
        maxWidth: 500,
        alignItems: "center",
    },
    toggleRow: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        justifyContent: "center",
        marginTop: 8,
    },
    animationLabel: {
        fontSize: 14,
        fontFamily: "OutfitBold",
        color: "#ddd",
        paddingHorizontal: 20,
    }    
});
