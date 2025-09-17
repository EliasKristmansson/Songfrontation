import Slider from "@react-native-community/slider";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
const DARK_BLUE = "#2c3e50";
const LIGHT_BG = "#f5f6fa";
const SLIDER_BG = "#e1e6f9";
const BUTTON_BG = "#232b4d";

export default function Settings() {
    const router = useRouter();
    const [master, setMaster] = useState(50);
    const [effects, setEffects] = useState(50);
    const [music, setMusic] = useState(50);

    return (
        <View style={styles.container}>
            {/* "Header"" */}
            <View style={styles.headerRow}>
                <TouchableOpacity
                    style={styles.roundedButton}
                    onPress={() => router.push("/")}
                >
                    <Text style={styles.buttonText}>Back</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.slidersColumn}>
                {/* Master Volume (slider) */}
                <View style={styles.sliderCard}>
                    <Text style={styles.volumeLabel}>Master Volume</Text>
                    <View style={styles.sliderRow}>
                        <Text style={styles.sliderLabel}>0%</Text>
                        <Slider
                            style={styles.slider}
                            minimumValue={0}
                            maximumValue={100}
                            step={1}
                            value={master}
                            onValueChange={setMaster}
                            minimumTrackTintColor={DARK_BLUE}
                            maximumTrackTintColor="#bbb"
                            thumbTintColor={DARK_BLUE}
                        />
                        <Text style={styles.sliderLabel}>100%</Text>
                    </View>
                    <Text style={styles.sliderInfo}>{master}%</Text>
                </View>
                {/* Effects Volume (slider) */}
                <View style={styles.sliderCard}>
                    <Text style={styles.volumeLabel}>Effects Volume</Text>
                    <View style={styles.sliderRow}>
                        <Text style={styles.sliderLabel}>0%</Text>
                        <Slider
                            style={styles.slider}
                            minimumValue={0}
                            maximumValue={100}
                            step={1}
                            value={effects}
                            onValueChange={setEffects}
                            minimumTrackTintColor={DARK_BLUE}
                            maximumTrackTintColor="#bbb"
                            thumbTintColor={DARK_BLUE}
                        />
                        <Text style={styles.sliderLabel}>100%</Text>
                    </View>
                    <Text style={styles.sliderInfo}>{effects}%</Text>
                </View>
                {/* Music Volume (slider) */}
                <View style={styles.sliderCard}>
                    <Text style={styles.volumeLabel}>Music Volume</Text>
                    <View style={styles.sliderRow}>
                        <Text style={styles.sliderLabel}>0%</Text>
                        <Slider
                            style={styles.slider}
                            minimumValue={0}
                            maximumValue={100}
                            step={1}
                            value={music}
                            onValueChange={setMusic}
                            minimumTrackTintColor={DARK_BLUE}
                            maximumTrackTintColor="#bbb"
                            thumbTintColor={DARK_BLUE}
                        />
                        <Text style={styles.sliderLabel}>100%</Text>
                    </View>
                    <Text style={styles.sliderInfo}>{music}%</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: LIGHT_BG,
        justifyContent: "flex-start",
        alignItems: "center",
        padding: 24,

        color: "#fff",
    },
    headerRow: {
        width: "100%",
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "flex-start",
        marginBottom: 10,
        paddingHorizontal: 0,
        paddingVertical: 0,
    },
    roundedButton: {
        backgroundColor: BUTTON_BG,
        borderRadius: 25,
        paddingVertical: 12,
        paddingHorizontal: 32,
        minWidth: 100,
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.10,
        shadowRadius: 6,
        elevation: 2,
    },
    slidersColumn: {
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
    },
    sliderCard: {
        backgroundColor: SLIDER_BG,
        borderRadius: 18,
        padding: 8,
        marginVertical: 18,
        width: "66%",
        maxWidth: 700,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
        alignItems: "center",
    },
    volumeLabel: {
        fontSize: 18,
        fontWeight: "bold",
        color: DARK_BLUE,
        marginBottom: 10,
        letterSpacing: 1,
    },
    sliderRow: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
    },
    slider: {
        flex: 1,
        marginHorizontal: 12,
        height: 10,
    },
    sliderLabel: {
        fontSize: 14,
        color: "#555",
        width: 38,
        textAlign: "center",
    },
    sliderInfo: {
        fontSize: 16,
        fontWeight: "bold",
        color: DARK_BLUE,
        letterSpacing: 0.5,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#fff",
        letterSpacing: 0.5,
    },
});