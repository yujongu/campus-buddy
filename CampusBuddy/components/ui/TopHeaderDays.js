import React from "react";
import { StyleSheet, View, Text, Dimensions } from "react-native";
const leftHeaderWidth = 50;
const topHeaderHeight = 60;
const dailyWidth = (Dimensions.get("window").width - leftHeaderWidth) / 3;
const dailyHeight = Dimensions.get("window").height / 10;
export default class TopHeaderDays extends React.Component {
  getNextDay = (startDay, daysAfter) => {
    let temp = new Date(startDay);
    temp.setDate(temp.getDate() + daysAfter);
    return temp;
  };
  getHoliday = (cDate, holidays) => {
    let temp = holidays;
    let dayName = "";

    if (temp != undefined && temp.length != undefined) {
      let monthString = cDate.getMonth() + 1;
      if (monthString < 10) {
        monthString = "0" + monthString;
      }
      let nDate =
        cDate.getFullYear() + "-" + monthString + "-" + cDate.getDate();
      temp.forEach((holiday) => {
        if (holiday.date == nDate) {
          dayName = holiday.localName;
        }
      });
    }
    return dayName;
  };

  render() {
    const { holidays, startDay } = this.props;
    let dayNames = ["Sun", "Mon", "Tues", "Wed", "Thur", "Fri", "Sat"];

    return (
      <View style={{ flexDirection: "row" }}>
        <View style={styles.daysWithDateContainer}>
          <Text style={styles.days}>{dayNames[0]}</Text>
          <Text style={styles.date}>
            {this.getNextDay(startDay, 0).getDate()}
          </Text>
          <Text style={styles.holiday}>
            {this.getHoliday(this.getNextDay(startDay, 0), holidays)}
          </Text>
        </View>
        <View style={styles.daysWithDateContainer}>
          <Text style={styles.days}>{dayNames[1]}</Text>
          <Text style={styles.date}>
            {this.getNextDay(startDay, 1).getDate()}
          </Text>
          <Text style={styles.holiday}>
            {this.getHoliday(this.getNextDay(startDay, 1), holidays)}
          </Text>
        </View>
        <View style={styles.daysWithDateContainer}>
          <Text style={styles.days}>{dayNames[2]}</Text>
          <Text style={styles.date}>
            {this.getNextDay(startDay, 2).getDate()}
          </Text>
          <Text style={styles.holiday}>
            {this.getHoliday(this.getNextDay(startDay, 2), holidays)}
          </Text>
        </View>
        <View style={styles.daysWithDateContainer}>
          <Text style={styles.days}>{dayNames[3]}</Text>
          <Text style={styles.date}>
            {this.getNextDay(startDay, 3).getDate()}
          </Text>
          <Text style={styles.holiday}>
            {this.getHoliday(this.getNextDay(startDay, 3), holidays)}
          </Text>
        </View>
        <View style={styles.daysWithDateContainer}>
          <Text style={styles.days}>{dayNames[4]}</Text>
          <Text style={styles.date}>
            {this.getNextDay(startDay, 4).getDate()}
          </Text>
          <Text style={styles.holiday}>
            {this.getHoliday(this.getNextDay(startDay, 4), holidays)}
          </Text>
        </View>
        <View style={styles.daysWithDateContainer}>
          <Text style={styles.days}>{dayNames[5]}</Text>
          <Text style={styles.date}>
            {this.getNextDay(startDay, 5).getDate()}
          </Text>
          <Text style={styles.holiday}>
            {this.getHoliday(this.getNextDay(startDay, 5), holidays)}
          </Text>
        </View>
        <View style={styles.daysWithDateContainer}>
          <Text style={styles.days}>{dayNames[6]}</Text>
          <Text style={styles.date}>
            {this.getNextDay(startDay, 6).getDate()}
          </Text>
          <Text style={styles.holiday}>
            {this.getHoliday(this.getNextDay(startDay, 6), holidays)}
          </Text>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  daysWithDateContainer: {
    height: topHeaderHeight,
    width: dailyWidth,
    flexDirection: "column",
    alignItems: "center",
  },
  days: {
    textAlign: "center",
    fontSize: 16,
  },
  date: {
    fontSize: 12,
  },
  holiday: {
    fontSize: 10,
    textAlign: "center",
  },
});
