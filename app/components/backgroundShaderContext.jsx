import { createContext } from "react";

export const BackgroundShaderContext = createContext({
  dividerPos: 1,
  setDividerPos: () => {},
});