import { useContext } from "react";
import { StyleSheet, Text, View } from "react-native";
import ThemeContext from "../ui/ThemeContext";

export default function EventRepetitionDetailWeekly({}) {
  const theme = useContext(ThemeContext);
  return (
    <View style={{ backgroundColor: "red", flex: 1 }}>
      <Text>Weekly UI</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    margin: 4,
    borderRadius: 8,
  },
});
