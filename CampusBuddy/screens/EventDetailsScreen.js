import React from "react";
import Icon from "react-native-vector-icons/FontAwesome";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Button,
  Modal,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { EventCategory } from "../constants/eventCategory";
import { JSGetDate, getWeekDayName } from "../helperFunctions/dateFunctions";
import { useState } from "react";
import { auth, overwriteRecurringEvents } from "../firebaseConfig";

export default function EventDetailsScreen({ route }) {
  const {
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
    removeFromCalendar: removeFromCalendar,
    eventMandatory,
    audienceLevel,

    eventRepetition,
    eventRepetitionCount,
    eventRepetitionHasEnd,
    eventRepeatEndDate,
  } = route.params;
  const navigation = useNavigation();
  const removeEvent = () => {
    removeFromCalendar();
    navigation.goBack();
  };

  const currDate = new Date(weekviewStartDate);
  currDate.setDate(currDate.getDate() + day);

  const [editVisible, setEditVisible] = useState(false);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor:
          category == EventCategory.SCHOOLCOURSE ? "#D1FF96" : color,
      }}
    >
      <Modal
        animationType="fade"
        transparent={true}
        visible={editVisible}
        onRequestClose={() => {
          this.setState({ visible: !this.state.visible });
        }}
      >
        <Pressable
          style={{
            flex: 1,
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
          onPress={() => setEditVisible(false)}
        >
          <View
            style={{
              backgroundColor: "white",
              marginHorizontal: 20,
              height: "60%",
              width: "80%",
              borderRadius: 10,
              padding: 15,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text style={{ fontSize: 16 }}>
                Cancel {getWeekDayName(day, true)}'s event?
              </Text>

              <Button
                title="Yes"
                onPress={() => {
                  overwriteRecurringEvents(auth.currentUser?.uid, id, currDate);
                  alert(`${JSGetDate(currDate)} event is now canceled`);
                }}
              />
            </View>
          </View>
        </Pressable>
      </Modal>

      <View style={{}}>
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <View style={{ padding: 10 }}>
              <Icon name="times" size={24} color="black" />
            </View>
          </TouchableOpacity>
          {eventRepetition == 2 ? (
            <Button title="Edit Event" onPress={() => setEditVisible(true)} />
          ) : (
            <View />
          )}

          <Button title="Mark as completed" onPress={removeEvent} />
        </View>

        <View style={styles.titleContainer}>
          <Text style={styles.eventTitleText}>{title}</Text>
          <Text style={styles.eventTimeText}>
            {startTime} - {endTime}
          </Text>
          <Text style={styles.eventLocationText}>@{location}</Text>
        </View>
        {eventRepetition ? (
          <View style={{ alignItems: "center", marginTop: 10 }}>
            <Text>Recurring Every {eventRepetition == 2 ? "Week" : ""}</Text>
            <Text>
              Until{" "}
              {eventRepetitionHasEnd == 1
                ? JSGetDate(eventRepeatEndDate)
                : "forever!"}
            </Text>
          </View>
        ) : (
          <View />
        )}
        <View style={styles.contentContainer}>
          <Text style={styles.eventDescriptionText}>{description}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 10,
  },
  titleContainer: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  eventTitleText: { fontSize: 32, textAlign: "center", margin: 4 },
  eventTimeText: { fontSize: 22, textAlign: "center", margin: 4 },
  eventLocationText: { fontSize: 16, textAlign: "center", margin: 4 },

  contentContainer: {
    marginTop: 18,
    marginHorizontal: 10,
  },
  eventDescriptionText: { fontSize: 20 },
});
