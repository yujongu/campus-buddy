import React from "react";
import Icon from "react-native-vector-icons/FontAwesome";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { EventCategory } from "../constants/eventCategory";

export default function EventDetailsScreen({ route }) {
  const { category, day, startTime, endTime, title, location, host, color } =
    route.params;

  const navigation = useNavigation();
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor:
          category == EventCategory.SCHOOLCOURSE ? "#D1FF96" : color,
      }}
    >
      <View style={{}}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <View style={{ padding: 10 }}>
            <Icon name="times" size={24} color="black" />
          </View>
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.eventTitleText}>{title}</Text>
          <Text style={styles.eventTimeText}>
            {startTime} - {endTime}
          </Text>
          <Text style={styles.eventLocationText}>@{location}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  eventTitleText: { fontSize: 32, textAlign: "center", margin: 4 },
  eventTimeText: { fontSize: 22, textAlign: "center", margin: 4 },
  eventLocationText: { fontSize: 16, textAlign: "center", margin: 4 },
});
