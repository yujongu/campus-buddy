import React from "react";
import { View, Text, Dimensions } from "react-native";
const leftHeaderWidth = 50;
const topHeaderHeight = 20;
const dailyWidth = (Dimensions.get("window").width - leftHeaderWidth) / 3;
const dailyHeight = Dimensions.get("window").height / 10;
export default class EventItem extends React.Component {
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
  

  render() {
    const { category, day, startTime, endTime, title, location, host, color } =
      this.props;
    let nHeight =
      category == "Empty"
        ? 0
        : dailyHeight * this.calculateEventHeight(startTime, endTime);

    let startHeight = category == "Empty" ? 0 : 30 - startTime.getMinutes();

    return category == "Empty" ? (
      <View
        key={title}
        style={{
          width: dailyWidth * 0.9,
          height: nHeight,
          justifyContent: "center",
          alignItems: "center",
          padding: 10,
          borderRadius: 10,
          zIndex: 2,
        }}
      ></View>
    ) : (
      <View
        key={title}
        style={{
          position: "absolute",
          left: day * dailyWidth,
          top: dailyHeight - startHeight,
          width: dailyWidth * 0.9,
          height: nHeight,
          justifyContent: "center",
          alignItems: "center",
          padding: 10,
          marginLeft: dailyWidth * 0.05,
          marginRight: dailyWidth * 0.05,
          borderRadius: 10,
          zIndex: 2,
          backgroundColor: color == null ? "#D1FF96" : color,
        }}
      >
        <Text style={{ fontSize: 16 }}>{title}</Text>
        <Text style={{ fontSize: 12 }}>{location}</Text>
      </View>
    );
  }
}

