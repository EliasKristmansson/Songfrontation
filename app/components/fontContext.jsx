// src/context/FontContext.js
import { createContext, useContext } from "react";

const FontContext = createContext({ fontsLoaded: false });

export const useFontsLoaded = () => useContext(FontContext);

export default FontContext;
