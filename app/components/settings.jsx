import Slider from "@react-native-community/slider"; // Import Slider
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

const DARK_BLUE = "#2c3e50"; // Example color

export default function Settings() {
    const [duration, setDuration] = useState(5);

    return (
        <>
            {/* Round duration (slider) */}
            <View style={styles.genreRow}>
                <Text style={styles.genreLabelInline}>Master Volume</Text>
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
                <Text style={styles.durationValue}>{duration}%</Text>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    genreRow: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 20,
        paddingHorizontal: 10,
    },
    genreLabelInline: {
        fontSize: 16,
        fontWeight: "bold",
        marginRight: 10,
    },
    sliderLabel: {
        fontSize: 14,
        color: "#555",
    },
    durationValue: {
        fontSize: 16,
        fontWeight: "bold",
        marginLeft: 10,
        color: DARK_BLUE,
    },
});