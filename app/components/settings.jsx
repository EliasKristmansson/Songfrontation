import Slider from "@react-native-community/slider";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";

export default function Settings() {
    const router = useRouter();
    const [master, setMaster] = useState(50);
    const [effects, setEffects] = useState(50);
    const [music, setMusic] = useState(50);

    return (
        <View>
            {/* Simple Back Arrow */}
            <TouchableOpacity
                onPress={() => router.push("/")}
                style={styles.backButton}
            >
                <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Sliders */}
                <View style={styles.slidersColumn}>
                    {["Master", "Effects", "Music"].map((label, idx) => {
                        const value = [master, effects, music][idx];
                        const setValue = [setMaster, setEffects, setMusic][idx];
                        return (
                            <View key={label} style={styles.sliderCard}>
                                <Text style={styles.volumeLabel}>{label} Volume</Text>
                                <View style={styles.sliderRow}>
                                    <Text style={styles.sliderLabel}>0%</Text>
                                    <Slider
                                        style={styles.slider}
                                        minimumValue={0}
                                        maximumValue={100}
                                        step={1}
                                        value={value}
                                        onValueChange={setValue}
                                        minimumTrackTintColor="#fff"
                                        maximumTrackTintColor="rgba(255,255,255,0.3)"
                                        thumbTintColor="white"
                                    />
                                    <Text style={styles.sliderLabel}>100%</Text>
                                </View>
                                <Text style={styles.sliderInfo}>{value}%</Text>
                            </View>
                        );
                    })}
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
});
