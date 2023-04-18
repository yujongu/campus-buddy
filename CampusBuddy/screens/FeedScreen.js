import { StatusBar } from "expo-status-bar";
import { useEffect, useState, useContext } from "react";
import { Button, StyleSheet, Text, View, Image, FlatList } from "react-native";
import { Switch } from "react-native-gesture-handler";
import ThemeContext from "../components/ui/ThemeContext";
import theme from "../components/ui/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import LogoBanner from "../assets/LogoBanner.png";
import LogoBannerWhite from "../assets/LogoBannerWhite.png";
import FeedItem from "../components/FeedItem";
import { EventCategory } from "../constants/eventCategory";
import { JSGetDateClock } from "../helperFunctions/dateFunctions";

export default function FeedScreen({ navigation, route }) {
  const theme = useContext(ThemeContext);

  const LogoImg = theme.theme == "light" ? LogoBanner : LogoBannerWhite;

  const FEEDDATA = [
    {
      id: "bd7acbea-c1b1-46c2-aed5-3aad53abb28ba",
      profilePic: null,
      title:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
      description: "This is a description",
      location: "At school",
      startTime: JSGetDateClock(new Date(), false),
      endTime: JSGetDateClock(new Date(), false),
      color: "#74b9ff",
      pointValue: "100",
      category: EventCategory.EVENT,
      eventMandatory: false,
    },
    {
      id: "bd7acbea-c1b1-46c2-aed5-3ad5s3abb28ba",
      profilePic: "https://picsum.photos/200",
      // profilePic: null,
      title: "This is title",
      description: "This is a description",
      location: "At home",
      startTime: JSGetDateClock(new Date(), false),
      endTime: JSGetDateClock(new Date(), false),
      color: "#74b9ff",
      pointValue: "100",
      category: EventCategory.EVENT,
      eventMandatory: false,
    },
    {
      id: "bd7acbea-c1b1-46c2-aed5d-3ad53abb28ba",
      profilePic: null,
      title:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
      description: "This is a description",
      location: "At school",
      startTime: JSGetDateClock(new Date(), false),
      endTime: JSGetDateClock(new Date(), false),
      color: "#74b9ff",
      pointValue: "100",
      category: EventCategory.EVENT,
      eventMandatory: false,
    },
    {
      id: "bd7acbea-c1b1-46c2-aed5-f3ad53abb28ba",
      profilePic: null,
      title: "This is the title",
      description:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
      location: "My house",
      startTime: JSGetDateClock(new Date(), false),
      endTime: JSGetDateClock(new Date(), false),
      color: "#74b9ff",
      pointValue: "100",
      category: EventCategory.EVENT,
      eventMandatory: false,
    },
    {
      id: "bd7acbea-c1b1-46gc2-aed5-3ad53abb28ba",
      profilePic: "https://picsum.photos/200",
      // profilePic: null,
      title: "This is the title",
      description: "This is a description",
      location: "At school",
      startTime: JSGetDateClock(new Date(), false),
      endTime: JSGetDateClock(new Date(), false),
      color: "#74b9ff",
      pointValue: "100",
      category: EventCategory.EVENT,
      eventMandatory: false,
    },
    {
      id: "bd7acbea-c1b1-46c2-aed5-3ad153abb28ba",
      profilePic: "https://picsum.photos/200",
      // profilePic: null,
      title:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
      description: "This is a description",
      location: "At home",
      startTime: JSGetDateClock(new Date(), false),
      endTime: JSGetDateClock(new Date(), false),
      color: "#74b9ff",
      pointValue: "100",
      category: EventCategory.EVENT,
      eventMandatory: false,
    },
    {
      id: "bd7acbea-c1b1-46c2-aed5-36ad53abb28ba",
      profilePic: "https://picsum.photos/200",
      // profilePic: null,
      title: "This is the title",
      description: "This is a description",
      location: "At school",
      startTime: JSGetDateClock(new Date(), false),
      endTime: JSGetDateClock(new Date(), false),
      color: "#74b9ff",
      pointValue: "100",
      category: EventCategory.EVENT,
      eventMandatory: false,
    },
  ];
  return (
    <SafeAreaView style={[{ flex: 1, backgroundColor: theme.background }]}>
      {/* <StatusBar style={theme.statusBarColor} /> */}
      <Image
        source={LogoImg}
        style={{
          width: null,
          resizeMode: "contain",
          height: 30,
          marginBottom: 10,
        }}
      />
      <FlatList
        data={FEEDDATA}
        renderItem={({ item }) => (
          <FeedItem
            profilePic={item.profilePic}
            title={item.title}
            description={item.description}
            location={item.location}
            startTime={item.startTime}
            endTime={item.endTime}
            color={item.color}
            pointValue={item.pointValue}
            category={item.category}
          />
        )}
        keyExtractor={(item) => item.id}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
