import { StatusBar } from "expo-status-bar";
import { useEffect, useState, useContext} from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import { Switch } from "react-native-gesture-handler";
import ThemeContext from "../components/ui/ThemeContext";
import theme from "../components/ui/theme";

export default function FeedScreen({ navigation, route }) {

  const theme = useContext(ThemeContext);

  return (
    <View style={[styles.container, {backgroundColor: theme.background}]}>
      <Text style={[styles.text, {color: theme.color}]}>This is feed screen</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
