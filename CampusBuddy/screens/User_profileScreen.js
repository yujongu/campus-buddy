import { StatusBar } from "expo-status-bar";
import { Button, StyleSheet, Text, Pressable, TextInput, View, Modal, Alert, TouchableOpacity, FlatList, ActivityIndicator,Dimensions,ScrollView } from "react-native";
import { EmailAuthProvider } from "firebase/auth";
import { signInWithEmailAndPassword } from "firebase/auth";
import { signOut } from "firebase/auth"
import { updateDoc, doc, arrayRemove, onSnapshot, arrayUnion } from "firebase/firestore";
import { Colors } from "../constants/colors";
import TopHeaderDays from "../components/ui/TopHeaderDays";
import { EventCategory } from "../constants/eventCategory";
import React, { useState, useEffect } from "react";
import { SHA256 } from 'crypto-js';
import {
  getMonthName,
  getWeekDayName,
  isOnSameDate,
  JSClock,
} from "../helperFunctions/dateFunctions";
import { SafeAreaView } from "react-native-safe-area-context";
import EventItem from "../components/ui/EventItem";
import { auth, db, userSchedule, getUserEvents, getUserId } from "../firebaseConfig";

export default function User_profile({ navigation, route }) {
  const { email } = route.params;
  const [calendarVisible, setCalendar] = useState(false);
  const [eventList, setEventList] = useState([]);
  const [data,setData] = useState();

  const weekViewStartDate= new Date();
  const leftHeaderWidth = 50;
  const topHeaderHeight = 60;
  const dailyHeight = Dimensions.get("window").height / 10;
  svRef=React.createRef();
  scrollViewEventOne = (e) => {
    svRef.current.scrollTo({
      x: 0,
      y: e.nativeEvent.contentOffset.y,
      animated: true,
    });
  };

  const makeVisible = (weekStartDate, event) => {
    //if event is school course, make visible
    if (event.category == EventCategory.SCHOOLCOURSE) {
      return true;
    }
    //week range start and end
    let s = weekStartDate;
    let e = new Date(weekStartDate);
    e.setDate(e.getDate() + 6);
  
    //if event is within the week time frame, make visible
    if (event.startTime >= s && event.startTime <= e) {
      return true;
    }
    return false;
  };

  const schedule = async () => {
    const result = []
    const id = await getUserId(email)
    console.log("id", id)
    const res = await userSchedule(id[0]);
    console.log("DASCHEDGE ", res)
    for (let i = 0; i < res["classes"].length; i++) {
      const temp = {
        category: EventCategory.SCHOOLCOURSE,
        title: res["classes"][i]["class"]["title"],
        startTime: new Date(res["classes"][i]["class"]["startTime"].seconds * 1000), //multiply 1000 since Javascript uses milliseconds. Timestamp to date.
        endTime: new Date(res["classes"][i]["class"]["endTime"].seconds * 1000),
        location: res["classes"][i]["class"]["location"],
        color: "#D1FF96",
        id: res["classes"][i]["id"],
      };
      result.push(temp);
    }
    console.log("result", result)
    setEventList(result)
  }

  return (
    <SafeAreaView style={{justifyContent: "center", alignItems: 'center', flex:1}}>
        <Text>{email}'s profile page</Text>
        <Button title="View calendar" onPress={()=>{setCalendar(true)}}/>
        <Button title="View points" onPress={async () => {schedule()}}/>
        <Button title="Go back" onPress={() => navigation.goBack()}/>
        <Modal
          animationType="slide"
          visible={calendarVisible}
          transparent={false}
          onRequestClose={() => {
            this.setState({ calendarVisible: false});
          }}
        >
         
        <View style={{ flex: 1, margin: 20 }}>
          {/* Info Above the calendar times */}
          <View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                paddingHorizontal: 10,
                paddingBottom:10,
                paddingTop:5
              }}
            >
              <View
                style={{
                  flex: 2,
                  alignItems: "flex-start",
                  flexDirection: "column",
                  justifyContent: "center",
                  paddingTop:10
                }}
              >
                <Text style={{ fontSize: 20 }}>
                  {getMonthName(weekViewStartDate.getMonth())}
                </Text>
                <Text style={{ fontSize: 12 }}>
                  {weekViewStartDate.getFullYear()}
                </Text>
              </View>
              <View
                style={{
                  flex: 5,
                  alignItems: "flex-start",
                  flexDirection: "column",
                  justifyContent: "center",
                  paddingLeft:50,
                  paddingTop:20
                }}
              >
                <Text style={{ fontSize: 20 }}>
                  {email}'s
                </Text>
                <Text style={{ fontSize: 20, paddingLeft: 55 }}>
                  Week
                </Text>
                
              </View>

              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
              {/*  <IconButton
                  style={{}}
                  color={Colors.grey}
                  onPress={() => {
                    switch (this.state.calendarView) {
                      case CalendarViewType.DAY:
                        return this.goPrevDay();
                      case CalendarViewType.WEEK:
                        return this.goPrevWeek();
                      case CalendarViewType.MONTH:
                        return this.goPrevMonth();
                      default:
                        return null;
                    }
                  }}
                  icon={(props) => <Octicons name="triangle-left" {...props} />}
                />
                <Pressable
                  style={{ padding: 10 }}
                  onPress={() => this.goToday()}
                >
                  <Text style={{ fontSize: 15 }}>Today</Text>
                </Pressable>

                <IconButton
                  style={{}}
                  color={Colors.grey}
                  onPress={() => {
                    switch (this.state.calendarView) {
                      case CalendarViewType.DAY:
                        return this.goNextDay();
                      case CalendarViewType.WEEK:
                        return this.goNextWeek();
                      case CalendarViewType.MONTH:
                        return this.goNextMonth();
                      default:
                        return null;
                    }
                  }}
                  icon={(props) => (
                    <Octicons name="triangle-right" {...props} />
                  )}
                />
                  </View>
              <View
                style={{
                  flex: 1,
                  alignItems: "flex-end",
                }}
              >
                <Pressable
                  style={{
                    alignItems: "center",
                    padding: 10,
                  }}
                  onPress={this.toggleCalendarView}
                >
                  <Text
                    style={{
                      fontSize: 15,
                    }}
                  >
                    {this.state.calendarView}
                  </Text>
                </Pressable>*/}
              </View>
            </View>
          </View>

          {(() => {
            return (
              <View style={{ flexDirection: "row", height: "100%" }}>
                <View>
                  <View style={{ height: topHeaderHeight }} />
                  <ScrollView scrollEnabled={false} ref={this.svRef}>
                    {Array.from(Array(24).keys()).map((index) => (
                      <View
                        // key={`TIME${name}-${index}`}
                        key={index}
                        style={{
                          height: dailyHeight,
                          // justifyContent: "center",
                          flexDirection: "row",
                        }}
                      >
                        <Text
                          style={{
                            color:
                              index <= 12 && index > 0
                                ? Colors.morningTimeColor
                                : Colors.eveningTimeColor,
                            width: 20,
                            marginHorizontal: 4,
                            textAlign: "center",
                          }}
                        >
                          {index}
                        </Text>
                      </View>
                    ))}
                  </ScrollView>
                </View>
                <ScrollView
                  style={{
                    height: "100%",
                    width: "100%",
                  }}
                  horizontal={true}
                >
                  <View style={{ flexDirection: "column" }}>
                    <TopHeaderDays
                      startDay={weekViewStartDate}
                    />

                    <ScrollView
                      style={{
                        backgroundColor: "#F8F8F8",
                        width: "100%",
                        height: "100%",
                      }}
                      horizontal={false}
                      nestedScrollEnabled
                      scrollEventThrottle={16}
                      onScroll={scrollViewEventOne}
                    >
                      <View
                        style={{
                          height: dailyHeight * 24,
                        }}
                      >
                        {eventList.map((event) => {
                          return makeVisible(
                            weekViewStartDate,
                            event
                          ) ? (
                            <EventItem
                              key={`EITEM-${1}-${event.title}-${
                                event.startTime
                              }`}
                              navigation={navigation}
                              category={event.category}
                              day={event.startTime.getDay()}
                              startTime={new Date(event.startTime)}
                              endTime={new Date(event.endTime)}
                              title={event.title}
                              location={event.location}
                              color={event.color}
                              id={event.id}
                              handleEventCompletion={this.handleEventCompletion}
                            />
                          ) : (
                            <View />
                          );
                        })}
                      </View>
                    </ScrollView>
                  </View>
                </ScrollView>
              </View>
            );
          
            }
          )()}
        </View>
        </Modal>

      </SafeAreaView>

    
  )
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
