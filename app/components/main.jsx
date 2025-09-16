import { Text, TouchableOpacity, View } from "react-native";

export default function Main() {
    return (
        <View className="flex-1 justify-center items-center bg-white">
            <Text className="text-4xl font-bold text-black mb-10">
                Welcome to Songfrontation!
            </Text>
            <View className="flex-row rounded-full overflow-hidden mb-5 shadow-lg">
                <TouchableOpacity className="flex-1 bg-pink-500 py-6 items-center justify-center rounded-l-full border-r-2 border-white">
                    <Text className="text-white text-xl font-bold tracking-widest">
                        1 Player
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity className="flex-1 bg-purple-700 py-6 items-center justify-center rounded-r-full border-l-2 border-white">
                    <Text className="text-white text-xl font-bold tracking-widest">
                        2 Players
                    </Text>
                </TouchableOpacity>
            </View>
            <Text className="text-pink-500 font-bold mt-2 tracking-wide text-base">
                Pick your mode and start the music quiz!
            </Text>
        </View>
    );
}