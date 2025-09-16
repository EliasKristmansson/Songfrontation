import { Text, View } from "react-native";

export default function Index() {
    return (
        <View
            style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <Text style={{ fontSize: 32, fontWeight: "bold" }}>
                Welcome to Songfrontation!
            </Text>
        </View>
    );
}
