import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import PreGameMenuHeader from "./preGameMenuHeader";

const PURPLE = "#44317f";
const DARKER_PURPLE = "#3a2a6b";

const GENRES = [
  "Pop","Rock","Hip-Hop","Jazz","EDM","Classical","Country","Metal","Indie","Folk","R&B","Random"
];

export default function GenreSelect() {
  const router = useRouter();
  const [selected, setSelected] = useState(new Set());
  const selectedList = useMemo(() => Array.from(selected), [selected]);

  const toggleGenre = (g) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(g)) next.delete(g); else next.add(g);
      return next;
    });
  };

  const onStartMatch = () => {
    router.push({
      pathname: "../components/match",
      params: { genres: JSON.stringify(selectedList) },
    });
  };

  return (
    <View style={styles.container}>
      <PreGameMenuHeader
        title="Selection of Genre"
        onBack={() => router.push("../components/matchSettings")}
        onProceed={onStartMatch}
        canProceed={selected.size > 0}
        proceedLabel="Start"
      />

      <View style={styles.content}>
        {/* Valda genres / instruktion */}
        <Text style={styles.subHeader}>
          {selected.size > 0 ? `Selected: ${selectedList.join(", ")}` : "Choose one or more"}
        </Text>

        {/* Skrollbar grid */}
        <ScrollView contentContainerStyle={styles.iconList}>
          {GENRES.map((g) => {
            const isSelected = selected.has(g);
            return (
              <TouchableOpacity
                key={g}
                onPress={() => toggleGenre(g)}
                style={styles.iconWrapper}
                activeOpacity={0.85}
              >
                <View
                  style={[
                    styles.icon,
                    isSelected && styles.selectedIcon
                  ]}
                >
                  <Text style={styles.iconText}>
                    {g}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PURPLE,
    minHeight: Platform.OS === "web" ? "100vh" : undefined,
    paddingHorizontal: 10,
  },
  content: {
    flex: 1,
    paddingTop: 16,
  },

  subHeader: {
    textAlign: "center",
    marginBottom: 12,
    color: "#fff",
    opacity: 0.8,
  },

  iconList: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    paddingBottom: 24,
    paddingHorizontal: 6,
  },
  iconWrapper: {
    width: "18%",
    aspectRatio: 1,
    marginHorizontal: "1%",
    marginVertical: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  icon: {
    width: "100%",
    height: "100%",
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "transparent",
    backgroundColor: DARKER_PURPLE,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  selectedIcon: {
    borderColor: "#fff",
  },

  iconText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
});