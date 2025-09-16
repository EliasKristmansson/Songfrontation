import { useRouter } from "expo-router";
import { Button, View } from "react-native";

export default function Icon() {

    const router = useRouter();
    return (
        <View>
            <text>Icon!</text>
            <Button
                title="Match Settings"
                onPress={() => router.push("../components/matchSettings")}
            />
        </View>
        
    );
}