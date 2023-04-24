import { Pressable } from "@react-native-material/core";
import React from "react";
import { View, Text, Dimensions } from "react-native";
import { EventCategory } from "../../constants/eventCategory";
import { JSGetDate } from "../../helperFunctions/dateFunctions";
const leftHeaderWidth = 50;
const topHeaderHeight = 20;
const dailyWidth = (Dimensions.get("window").width - leftHeaderWidth) / 3;
const dailyHeight = Dimensions.get("window").height / 10;
export default class EventItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showEvent: true,
      multipleSelected: false,
    };
  }
  removeFromCalendar = () => {
    this.setState({ showEvent: false });
    //console.log(this.props.id)

    this.props.handleEventCompletion(this.props.category, this.props.id, true);
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

  multipleSelector = (id, category) => {
    this.setState({multipleSelected: !this.state.multipleSelected});
    this.props.handleMultipleSelected(this.state.multipleSelected, id, category);
  }

  showDetails(
    id,
    weekviewStartDate,
    category,
    day,
    startTime,
    endTime,
    title,
    location,
    description,
    host,
    color,
    clickable,
    eventMandatory,
    audienceLevel,

    eventRepetition,
    eventRepetitionCount,
    eventRepetitionHasEnd,
    eventRepeatEndDate,

    canceledEvent
  ) {
    if (clickable) {
      this.props.navigation.navigate("EventDetails", {
        id,
        weekviewStartDate,
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
        eventMandatory,
        audienceLevel,

        eventRepetition,
        eventRepetitionCount,
        eventRepetitionHasEnd,
        eventRepeatEndDate,

        canceledEvent,
      });
    }
  }

  render() {
    const {
      weekviewStartDate,
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
      eventMandatory,
      audienceLevel,

      eventRepetition,
      eventRepetitionCount,
      eventRepetitionHasEnd,
      eventRepeatEndDate,
      overwriteData,
    } = this.props;
    let nHeight =
      category == "Empty"
        ? 0
        : dailyHeight * this.calculateEventHeight(startTime, endTime);

    let startHeightOffset =
      category == "Empty" ? 0 : 30 - startTime.getMinutes();

    const currDate = new Date(weekviewStartDate);
    currDate.setDate(currDate.getDate() + day);

    let canceledEvent = false;
    if (overwriteData) {
      for (let i = 0; i < overwriteData.length; i++) {
        owDate = overwriteData[i].overwriteDate;
        if (
          currDate.getFullYear() == owDate.getFullYear() &&
          currDate.getMonth() == owDate.getMonth() &&
          currDate.getDate() == owDate.getDate()
        ) {
          canceledEvent = true;
        }
      }
    }

    return (
      <Pressable
        onLongPress={() => this.multipleSelector(id, category)}
        onPress={() =>
          this.showDetails(
            id,
            weekviewStartDate,
            category,
            day,
            startTime,
            endTime,
            title,
            location,
            description != undefined ? description : "",
            host,
            color,
            clickable,
            eventMandatory,
            audienceLevel,

            eventRepetition,
            eventRepetitionCount,
            eventRepetitionHasEnd,
            eventRepeatEndDate,

            canceledEvent
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
              borderLeftWidth: this.state.multipleSelected ? 3 : eventMandatory == true ? 3 : 0,
              borderWidth: this.state.multipleSelected ? 4 : 0,
              borderColor: this.state.multipleSelected ? "black" : "red",
            }}
          >
            <Text style={{ fontSize: 16 }}>{title}</Text>
            <Text style={{ fontSize: 12 }}>{location}</Text>
            <View
              style={{
                width: dailyWidth * 0.9,
                height: nHeight,
                position: "absolute",
                backgroundColor: "grey",
                opacity: 0.7,
                justifyContent: "center",
                alignItems: "center",
                display: canceledEvent ? "flex" : "none",
              }}
            >
              <Text
                style={{
                  color: "red",
                  fontSize: 16,
                  fontWeight: 800,
                  transform: [{ rotate: "35deg" }],
                  backgroundColor: "white",
                }}
              >
                Canceled
              </Text>
            </View>
          </View>
        ) : (
          <View />
        )}
      </Pressable>
    );
  }
}
