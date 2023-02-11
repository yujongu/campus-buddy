import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  Dimensions,
  Animated,
} from "react-native";
import { Colors } from "../constants/colors";

const leftHeaderWidth = 50;
const topHeaderHeight = 20;
const dailyWidth = (Dimensions.get("window").width - leftHeaderWidth) / 3;
const dailyHeight = Dimensions.get("window").height / 10;
const data = [
  {
    category: "School Courses",
    startTime: "10:30",
    endTime: "11:45",
    title: "EAPS 106",
    location: "CLCS 204",
    Host: "Professor Rauh",
  },
  {
    category: "Events",
    startTime: "13:30",
    endTime: "14:20",
    title: "Call out!",
    location: "WALC 113",
    Host: "Student Life",
  },
  {
    category: "Private Events",
    startTime: "19:00",
    endTime: "23:00",
    title: "Bday Party!!!",
    location: "Bell Tower",
    Host: "Steve",
  },
];
export default class CalendarScreen extends React.Component {
  constructor() {
    super();
    this.scrollPosition = new Animated.Value(0);
    this.scrollEvent = Animated.event(
      [{ nativeEvent: { contentOffset: { y: this.scrollPosition } } }],
      { useNativeDriver: false }
    );
  }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flexDirection: "row" }}>
          {/* This is the left vertical header */}
          <ScrollViewVerticallySynced
            style={{ width: leftHeaderWidth, marginTop: topHeaderHeight }}
            name="Time"
            onScroll={this.scrollEvent}
            scrollPosition={this.scrollPosition}
          />
          {/* This is the right vertical content */}
          <ScrollView horizontal bounces={true}>
            <View style={{ width: dailyWidth * 7 }}>
              <View
                style={{
                  height: topHeaderHeight,
                  justifyContent: "center",
                }}
              >
                <View style={styles.daysContainer}>
                  <Text style={styles.days}>Sun</Text>
                  <Text style={styles.days}>Mon</Text>
                  <Text style={styles.days}>Tues</Text>
                  <Text style={styles.days}>Wed</Text>
                  <Text style={styles.days}>Thur</Text>
                  <Text style={styles.days}>Fri</Text>
                  <Text style={styles.days}>Sat</Text>
                </View>
              </View>
              {/* This is the vertically scrolling content. */}
              <ScrollViewVerticallySynced
                style={{ width: dailyWidth * 7 }}
                name="notTime"
                onScroll={this.scrollEvent}
                scrollPosition={this.scrollPosition}
              />
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }
}

class ScrollViewVerticallySynced extends React.Component {
  componentDidMount() {
    this.listener = this.props.scrollPosition.addListener((position) => {
      this.instance.scrollTo({
        y: position.value,
        animated: false,
      });
    });
  }

  render() {
    const { name, style, onScroll } = this.props;
    return (
      <ScrollView
        key={name}
        ref={(ref) => (this.instance = ref)}
        style={style}
        scrollEventThrottle={1}
        onScroll={onScroll}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        {populateRows(name)}
      </ScrollView>
    );
  }
}

class EventItem extends React.Component {
  // category: "School Courses",
  //   startTime: "10:30",
  //   endTime: "11:45",
  //   title: "EAPS 106",
  //   location: "CLCS 204",
  //   Host: "Professor Rauh",

  calculateEventHeight(startTime, endTime) {
    let duration = 50;
    return duration / 60;
  }

  render() {
    const { category, startTime, endTime, title, location, host } = this.props;
    let nHeight = dailyHeight * this.calculateEventHeight(endTime, startTime);

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
        }}
      ></View>
    ) : (
      <View
        key={title}
        style={{
          width: dailyWidth * 0.9,
          height: nHeight,
          justifyContent: "center",
          alignItems: "center",
          padding: 10,
          borderRadius: 10,
          zIndex: 1,
          backgroundColor: "#D1FF96",
        }}
      >
        <Text>Hello</Text>
      </View>
    );
  }
}

// If name is Time, populate the hours 0 ~ 24.
// TODO: Need to set which time the time's going to start.
// If name is Days, populate the schedule.
const populateRows = (name, rowCount, color) =>
  name == "Time"
    ? Array.from(Array(24).keys()).map((index) => (
        <View
          key={`${name}-${index}`}
          style={{
            height: dailyHeight,
            // backgroundColor: index % 2 === 0 ? Colors.fourth : "white",
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              color:
                index <= 12 && index > 0
                  ? Colors.morningTimeColor
                  : Colors.eveningTimeColor,
            }}
          >
            {index}
          </Text>
        </View>
      ))
    : Array.from(Array(24).keys()).map((index) => (
        <View
          key={`${name}-${index}`}
          style={{
            height: dailyHeight,
            // backgroundColor: index % 2 === 0 ? "blue" : "white",
            flex: 1,
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "space-around",
          }}
        >
          <EventItem
            category="School Courses"
            startTime="10:30"
            endTime="11:45"
            title="EAPS 106"
            location="CLCS 204"
            Host="Professor Rauh"
          />
          <EventItem
            category="Empty"
            startTime="13:30"
            endTime="14:20"
            title="Call out!"
            location="WALC 113"
            Host="Student Life"
          />
          <EventItem
            category="Private Events"
            startTime="19:00"
            endTime="23:00"
            title="Bday Party!!!"
            location="Bell Tower"
            Host="Steve"
          />
          <EventItem
            category="Empty"
            startTime="10:30"
            endTime="11:45"
            title="EAPS 106"
            location="CLCS 204"
            Host="Professor Rauh"
          />
          <EventItem
            category="School Courses"
            startTime="10:30"
            endTime="11:45"
            title="EAPS 106"
            location="CLCS 204"
            Host="Professor Rauh"
          />
          <EventItem
            category="Empty"
            startTime="10:30"
            endTime="11:45"
            title="EAPS 106"
            location="CLCS 204"
            Host="Professor Rauh"
          />
          <EventItem
            category="School Courses"
            startTime="10:30"
            endTime="11:45"
            title="EAPS 106"
            location="CLCS 204"
            Host="Professor Rauh"
          />
          {/* Horizontal Guide Line in the background */}
          <View
            style={{
              position: "absolute",
              width: dailyWidth * 7,
              borderBottomColor: "black",
              borderBottomWidth: 1,
            }}
          />
        </View>
      ));

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  daysContainer: {
    flexDirection: "row",
  },

  days: {
    width: dailyWidth,
    textAlign: "center",
  },
});
