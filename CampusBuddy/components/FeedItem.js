import { StatusBar } from "expo-status-bar";
import { useEffect, useState, useContext } from "react";
import { Button, StyleSheet, Text, View, Image } from "react-native";
import { Switch } from "react-native-gesture-handler";
import ThemeContext from "../components/ui/ThemeContext";
import theme from "../components/ui/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import defaultProfile from "../assets/defaultProfile.png";
import { Pressable } from "react-native";

export default function FeedItem({
  navigation,
  eventId,
  userId,
  profilePic = null,
  title,
  description,
  location,
  startTime,
  endTime,
  color,
  pointValue,
  category,
  eventMandatory,
}) {
  const theme = useContext(ThemeContext);

  const startDate = startTime.split(" ")[1].replace(",", "");
  const startMonth = startTime.split(" ")[0];

  const navigateToFeedDetailPage = () => {
    navigation.navigate("FeedDetails", {
      navigation,
      eventId,
      userId,
      profilePic,
      title,
      description,
      location,
      startTime,
      endTime,
      color,
      pointValue,
      category,
      eventMandatory,
    });
  };

  return (
    <Pressable onPress={navigateToFeedDetailPage}>
      <View
        style={[
          styles.container,
          { backgroundColor: theme.feedItemBackground },
        ]}
      >
        <View style={styles.mainContainer}>
          {profilePic ? (
            <Image source={{ uri: profilePic }} style={styles.profImg} />
          ) : (
            <Image source={defaultProfile} style={styles.profImg} />
          )}
          <View style={styles.startDateContainer}>
            <Text style={[{ fontSize: 30, color: theme.color }]}>
              {startDate}
            </Text>
            <Text style={{ fontSize: 15, color: theme.color }}>
              {startMonth}
            </Text>
          </View>
          <View style={styles.titleDescriptionContainer}>
            <Text
              ellipsizeMode="tail"
              numberOfLines={1}
              style={{ fontSize: 18, color: theme.color }}
            >
              {title}
            </Text>
            <Text
              ellipsizeMode="tail"
              numberOfLines={1}
              style={{ fontSize: 12, color: theme.color }}
            >
              {location}
            </Text>
          </View>
        </View>
        <View
          style={[styles.dividingLine, { borderColor: theme.borderColor }]}
        ></View>
      </View>
    </Pressable>
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
  mainContainer: {
    flex: 1,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingRight: 10,
  },
  profImg: {
    width: 50,
    height: 50,
    borderRadius: 15,
    margin: 5,
  },
  startDateContainer: { flexDirection: "column", margin: 10 },
  titleDescriptionContainer: {
    height: "100%",
    flexDirection: "column",
    justifyContent: "space-evenly",
    flexShrink: 1,
  },
  dividingLine: {
    width: "95%",
    borderBottomWidth: 1,
  },
});
