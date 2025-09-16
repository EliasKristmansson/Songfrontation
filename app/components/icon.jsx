import { useRouter } from "expo-router";
import { Button, View, Text } from "react-native";

export default function Icon() {

    const router = useRouter();
    return (
        <View>
            <Text>Icon!</Text>
            <Button
                title="Match Settings"
                onPress={() => router.push("../components/matchSettings")}
            />
        </View>
        
    );
}