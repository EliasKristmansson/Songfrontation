import { useRouter } from "expo-router";
import { Button, Text, View } from "react-native";


export default function Match() {
    const router = useRouter();

    return (
        <View>
            <Text>match!</Text>
            <Button
                title="Main"
                onPress={() => router.push("/")}
            />
        </View>
    );
}