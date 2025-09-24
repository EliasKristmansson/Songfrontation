import FontProvider from "./components/fontProvider.jsx";
import SplashScreen from "./components/splashScreen.jsx";

export default function Index() {
    return (
        <FontProvider>
            <SplashScreen />
        </FontProvider>
    );
}
