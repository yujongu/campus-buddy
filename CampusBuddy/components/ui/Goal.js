import React, { useContext } from "react";
import { Button, StyleSheet, Text, View, Image } from "react-native";
import ThemeContext from "./ThemeContext";
import theme from "./theme";
import { getMonthName } from "../../helperFunctions/dateFunctions";
import { EventCategory } from "../../constants/eventCategory";
export default function Goal({
  category,
  points,
  progress,
  deadline,
  completed,
}) {
  const theme = useContext(ThemeContext);

  const date = deadline.getDate();
  const month = deadline.getMonth();

  getWidth = (progress, points) => {
    return (
      (progress / points * 100).toString() + "%"
    );
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.feedItemBackground }]}
    >
      { completed ? (
      <View style={styles.mainContainer}>
        <View style={styles.startDateContainer}>
          <Text style={[{ fontSize: 15, color: theme.color, textAlign:"center" }]}>
            Date{"\n"}Completed
          </Text>
          <Text style={{ fontSize: 20, color: theme.color, textAlign:"center" }}>{getMonthName(month)} {date}</Text>
        </View>
        <View style={{flexDirection:"column",}}>
          <Text
            style={{ fontSize: 15, color: theme.color, fontStyle:"italic", textAlign:"center", paddingBottom:5 }}
          >
            {points} points
          </Text>
          <Text
            style={{ fontSize: 15, color: theme.color, paddingLeft:10, paddingRight:10, fontWeight:"bold", textAlign:"center" }}
          >
            {EventCategory[category]}{"\n"}Goal
          </Text>
         
          </View>
      </View>) : 
      ( <View style={styles.mainContainer}>
        <View style={styles.startDateContainer}>
          <Text style={[{ fontSize: 15, color: theme.color, textAlign:"center" }]}>
            Finish by
          </Text>
          <Text style={{ fontSize: 20, color: theme.color, textAlign:"center" }}>{getMonthName(month)} {date}</Text>
        </View>
        <View style={styles.titleDescriptionContainer}>
          <Text
            ellipsizeMode="tail"
            numberOfLines={1}
            style={{ fontSize: 15, color: theme.color, paddingBottom:5, fontWeight:"bold" }}
          >
            {category} Goal
          </Text>
          <View style={styles.row}>
          <View style={styles.progressBar}>
            <View
              style={[
                [StyleSheet.absoluteFill],
                {
                  backgroundColor: "#7CC8B8",
                  width: getWidth(progress, points),
                },
              ]}
            />
            <Text style={{textAlign:"center", paddingTop: 5, color:"#2F4858", fontStyle:"italic"}}>
              {points-progress} points to go
            </Text>
            </View>
          <Text
            ellipsizeMode="tail"
            numberOfLines={1}
            style={{ fontSize: 12, color: theme.color, padding:5}}
          >
            {points}
          </Text>
        </View>
      </View>
      </View>
    )}

    </View>
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
    padding: 10,
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
    flex:2,
    alignItems: "center"
  },
  progressBar: {
    height: 30,
    width: "80%",
    backgroundColor: "white",
    borderColor: "#000",
    borderWidth: 2,
    borderRadius: 5,
    marginBottom: 5,
  },
  row: {
    flexDirection: "row",
  },

});
