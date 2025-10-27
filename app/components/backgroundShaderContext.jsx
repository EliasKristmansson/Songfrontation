import { createContext } from "react";

export const BackgroundShaderContext = createContext({
  dividerPosRef: { current: 1.1 },
  animationSpeed: 0.2,
  setAnimationSpeed: () => {},
  primaryBackgroundColorRef: { current: [0.255, 0.184, 0.494] },
  secondaryBackgroundColorRef: { current: [0.337, 0.388, 0.769] },
});