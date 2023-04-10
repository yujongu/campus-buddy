import { Pressable } from "@react-native-material/core";
import React from "react";
import { View, Text, Dimensions } from "react-native";
import { EventCategory } from "../../constants/eventCategory";
const leftHeaderWidth = 50;
const topHeaderHeight = 20;
const dailyWidth = (Dimensions.get("window").width - leftHeaderWidth) / 3;
const dailyHeight = Dimensions.get("window").height / 10;
export default class EventItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showEvent: true,
    };
  }
  removeFromCalendar = () => {
    this.setState({ showEvent: false });
    //console.log(this.props.id)

    this.props.handleEventCompletion(this.props.category, this.props.id);
  };

  calculateEventHeight(startTime, endTime) {
    let hourDiff = endTime.getHours() - startTime.getHours();
    let minuteDiff = endTime.getMinutes() - startTime.getMinutes();

    let duration = 60 * hourDiff + minuteDiff;
    return duration / 60;
  }

  JSClock = (time) => {
    const hour = time.getHours();
    const minute = time.getMinutes();
    const second = time.getSeconds();
    let temp = String(hour % 12);
    if (temp === "0") {
      temp = "12";
    }
    temp += (minute < 10 ? ":0" : ":") + minute;
    if (second != 0) {
      temp += (second < 10 ? ":0" : ":") + second;
    }
    temp += hour >= 12 ? " P.M." : " A.M.";
    return temp;
  };

  showDetails(
    category,
    day,
    startTime,
    endTime,
    title,
    location,
    description,
    host,
    color
  , clickable) {
    if (clickable) {
      this.props.navigation.navigate("EventDetails", {
        category,
        day,
        startTime: this.JSClock(startTime),
        endTime: this.JSClock(endTime),
        title,
        location,
      description,
        host,
        color,
        removeFromCalendar: this.removeFromCalendar,
      });

    }

  }

  render() {

    
    const {
      category,
      day,
      startTime,
      endTime,
      title,
      location,
      description,
      host,
      color,
      id,
      clickable,
      eventMandatory
    } = this.props;


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
            description != undefined ? description : "",
            host,
            color,
            clickable
          )
        }
      >
        {this.state.showEvent ? (
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
              overflow: "hidden",
              backgroundColor: color == null ? "#D1FF96" : color,
              borderLeftWidth: eventMandatory == true ? 3 : 0,
              borderColor: "red"
            }}
          >
            <Text style={{ fontSize: 16 }}>{title}</Text>
            <Text style={{ fontSize: 12 }}>{location}</Text>
          </View>
        ) : (
          <View />
        )}
      </Pressable>
    );
  }
}
