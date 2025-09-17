import Slider from "@react-native-community/slider"; // Import Slider
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

const DARK_BLUE = "#2c3e50"; // Example color

export default function Settings() {
    const [duration, setDuration] = useState(5);

    return (
        <>
            {/* Master Volume (slider) */}
            <View style={styles.volumeRow}>
                <Text style={styles.volumeLabelInline}>Master Volume</Text>
                <Text style={styles.sliderLabel}>0%</Text>
                <Slider
                    style={{ flex: 1, marginHorizontal: 10 }}
                    minimumValue={0}
                    maximumValue={100}
                    step={1}
                    value={duration}
                    onValueChange={setDuration}
                    minimumTrackTintColor={DARK_BLUE}
                    maximumTrackTintColor="#bbb"
                    thumbTintColor={DARK_BLUE}
                />
                <Text style={styles.sliderLabel}>100%</Text>
                <Text style={styles.sliderInfo}>{duration}%</Text>
            </View>
            {/* Effects Volume (slider) */}
            <View style={styles.volumeRow}>
                <Text style={styles.volumeLabelInline}>Effects Volume</Text>
                <Text style={styles.sliderLabel}>0%</Text>
                <Slider
                    style={{ flex: 1, marginHorizontal: 10 }}
                    minimumValue={0}
                    maximumValue={100}
                    step={1}
                    value={duration}
                    onValueChange={setDuration}
                    minimumTrackTintColor={DARK_BLUE}
                    maximumTrackTintColor="#bbb"
                    thumbTintColor={DARK_BLUE}
                />
                <Text style={styles.sliderLabel}>100%</Text>
                <Text style={styles.sliderInfo}>{duration}%</Text>
            </View>{/* Music Volume (slider) */}
            <View style={styles.volumeRow}>
                <Text style={styles.volumeLabelInline}>Music Volume</Text>
                <Text style={styles.sliderLabel}>0%</Text>
                <Slider
                    style={{ flex: 1, marginHorizontal: 10 }}
                    minimumValue={0}
                    maximumValue={100}
                    step={1}
                    value={duration}
                    onValueChange={setDuration}
                    minimumTrackTintColor={DARK_BLUE}
                    maximumTrackTintColor="#bbb"
                    thumbTintColor={DARK_BLUE}
                />
                <Text style={styles.sliderLabel}>100%</Text>
                <Text style={styles.sliderInfo}>{duration}%</Text>
            </View>
            
        </>
    );
}

const styles = StyleSheet.create({
    volumeRow: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 20,
        paddingHorizontal: 10,
    },
    volumeLabelInline: {
        fontSize: 16,
        fontWeight: "bold",
        marginRight: 10,
    },
    sliderLabel: {
        fontSize: 14,
        color: "#555",
    },
    sliderInfo: {
        fontSize: 16,
        fontWeight: "bold",
        marginLeft: 10,
        color: DARK_BLUE,
    },
});