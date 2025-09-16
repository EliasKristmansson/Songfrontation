import { useRouter } from "expo-router";
import { Button, View } from "react-native";


export default function Icon() {

        const router = useRouter();
    return (
        <View>
            <text>MatchSettings!</text>
            <Button
                title="Match"
                onPress={() => router.push("../components/match")}
            />
        </View>
        
    );
}