import { Audio } from "expo-av";

export async function playButtonSound() {
    try {
        const { sound } = await Audio.Sound.createAsync(
            require("../../assets/sounds/clickSound.mp3"),
            { shouldPlay: true }
        );
        sound.setOnPlaybackStatusUpdate(status => {
            if (status.didJustFinish) sound.unloadAsync();
        });
    } catch (e) {
        console.warn("Button sound error:", e);
    }
}