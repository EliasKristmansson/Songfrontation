import { createContext } from "react";

export const BackgroundShaderContext = createContext({
  dividerPos: 1.1,
  setDividerPos: () => {},
  animationSpeed: 0.2,
  setAnimationSpeed: () => {},
  primaryBackgroundColor: [0.255, 0.184, 0.494],
  setPrimaryBackgroundColor: () => {},
  primaryBackgroundColorRef: { current: [0.255, 0.184, 0.494] },
  secondaryBackgroundColor: [0.8, 0.2, 0.3],
  setSecondaryBackgroundColor: () => {},
});