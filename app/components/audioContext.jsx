import { createContext, useContext, useState } from "react";

const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
  const [masterVolume, setMasterVolume] = useState(1.0);
  const [musicVolume, setMusicVolume] = useState(0.5);
  const [effectsVolume, setEffectsVolume] = useState(0.5);

  return (
    <AudioContext.Provider
      value={{
        masterVolume,
        setMasterVolume,
        musicVolume,
        setMusicVolume,
        effectsVolume,
        setEffectsVolume,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => useContext(AudioContext);
