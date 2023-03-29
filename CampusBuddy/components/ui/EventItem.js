import { Pressable } from "@react-native-material/core";
import React from "react";
import { View, Text, Dimensions } from "react-native";
import { JSClock } from "../../helperFunctions/dateFunctions";
const leftHeaderWidth = 50;
const topHeaderHeight = 20;
const dailyWidth = (Dimensions.get("window").width - leftHeaderWidth) / 3;
const dailyHeight = Dimensions.get("window").height / 10;
export default class EventItem extends React.Component {
  constructor(props) {
    super(props);
  }
  // category: "School Courses",
  //   startTime: "2019-07-04T17:30:00.000Z",
  //   endTime: "2019-07-04T18:45:00.000Z",
  //   title: "EAPS 106",
  //   location: "MTHW 304",
  //   Host: "Professor Rauh",

  calculateEventHeight(startTime, endTime) {
    let hourDiff = endTime.getHours() - startTime.getHours();
    let minuteDiff = endTime.getMinutes() - startTime.getMinutes();

    let duration = 60 * hourDiff + minuteDiff;
    return duration / 60;
  }

  showDetails(category, day, startTime, endTime, title, location, host, color) {
    this.props.navigation.navigate("EventDetails", {
      category,
      day,
      startTime: JSClock(startTime),
      endTime: JSClock(endTime),
      title,
      location,
      host,
      color,
    });
  }

  render() {
    const { category, day, startTime, endTime, title, location, host, color } =
      this.props;

    let nHeight =
      category == "Empty"
        ? 0
        : dailyHeight * this.calculateEventHeight(startTime, endTime);

    let startHeightOffset =
      category == "Empty" ? 0 : 30 - startTime.getMinutes();

    return (
      <Pressable
        onPress={() =>
          this.showDetails(
            category,
            day,
            startTime,
            endTime,
            title,
            location,
            host,
            color
          )
        }
      >
        <View
          key={title}
          style={{
            position: "absolute",
            left: day * dailyWidth,
            top:
              dailyHeight / 2 -
              startHeightOffset +
              startTime.getHours() * dailyHeight,
            width: dailyWidth * 0.9,
            height: nHeight,
            justifyContent: "center",
            alignItems: "center",
            padding: 10,
            marginLeft: dailyWidth * 0.05,
            marginRight: dailyWidth * 0.05,
            borderRadius: 10,
            backgroundColor: color == null ? "#D1FF96" : color,
            overflow: "hidden",
          }}
        >
          <Text style={{ fontSize: 16 }} numberOfLines={2}>
            {title}
          </Text>
          <Text style={{ fontSize: 12 }} numberOfLines={1}>
            {location}
          </Text>
        </View>
      </Pressable>
    );
  }
}
