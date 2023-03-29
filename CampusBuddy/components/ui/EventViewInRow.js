import React from "react";

import { StyleSheet, View, Text } from "react-native";
import { Colors } from "../../constants/colors";

const EventViewInRow = ({ title, location, startTime, endTime }) => {
  return (
    <View style={styles.container}>
      <View style={styles.topHeader}>
        <View style={styles.mainInfoWrapper}>
          <Text style={styles.titleText} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.locationText} numberOfLines={1}>
            @{location}
          </Text>
        </View>

        <View style={styles.timeInfoWrapper}>
          <Text style={styles.timeText}>
            {startTime} ~ {endTime}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    backgroundColor: Colors.primary,
    marginVertical: 8,
    marginHorizontal: 6,
    borderRadius: 10,
  },
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 6,
    justifyContent: "space-between",
  },
  mainInfoWrapper: {
    flexDirection: "row",
    alignItems: "center",
    flex: 5,
  },
  titleText: {
    fontSize: 25,
    marginRight: 10,
    flex: 0,
    flexShrink: 3,
  },
  locationText: {
    fontSize: 16,
    flex: 0,
    flexShrink: 7,
  },
  timeInfoWrapper: {
    flexDirection: "row",
    flex: 3,
    justifyContent: "flex-end",
  },
  timeText: { fontSize: 12 },
});

export default EventViewInRow;
