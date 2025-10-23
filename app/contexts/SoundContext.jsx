/*import { Audio } from "expo-av";
import { createContext, useContext } from "react";

const SoundContext = createContext();

export function SoundProvider({ children }) {
    // You can add mute/volume state here if you want
    const playButtonSound = async () => {
        try {
            const { sound } = await Audio.Sound.createAsync(
                require("../assets/sounds/plopp.wav"),
                { shouldPlay: true }
            );
            sound.setOnPlaybackStatusUpdate(status => {
                if (status.didJustFinish) sound.unloadAsync();
            });
        } catch (e) {
            console.warn("Button sound error:", e);
        }
    };

    return (
        <SoundContext.Provider value={{ playButtonSound }}>
            {children}
        </SoundContext.Provider>
    );
}

export function useSound() {
    return useContext(SoundContext);
}*/