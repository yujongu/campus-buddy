import { Button, FlatList, StyleSheet, Text, View, Dimensions } from "react-native";
import React, { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { getLeaderboard } from "../firebaseConfig";
import LeaderboardItem from "../components/ui/LeaderboardItem";
import { Colors } from "../constants/colors";
import TopHeaderDays from "../components/ui/TopHeaderDays";
import { ScrollView } from "react-native";
import { addGroupEvent, getGroupEvents, getUserId, userSchedule, getUserEvents } from "../firebaseConfig";
import {
  getMonthName,
  getWeekDayName,
  isOnSameDate,
  JSClock,
} from "../helperFunctions/dateFunctions";
import { IconButton } from "@react-native-material/core";
import Octicons from "react-native-vector-icons/Octicons";



export default function GroupDetailsScreen({ navigation, route }) {
  // useEffect(() => {}, []);

  const { groupName, groupMembers } = route.params;
  const [ groupEvents, setGroupEvents ] = useState([]);
  const [weekViewStartDate,setStartDate] = useState(new Date());
  const [eventList, setEventList] = useState([]);


  const topHeaderHeight = 60;
  const dailyHeight = Dimensions.get("window").height / 10;
  svRef=React.createRef();
  scrollViewEventOne = (e) => {
    try {
      if (svRef.current) {
        svRef.current.scrollTo({
          x: 0,
          y: e.nativeEvent.contentOffset.y,
          animated: true,
        });
      }
    } catch (error) {
      console.log(error);
    }

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


  // const groupEvents = getGroupEvents(groupName);

  const handleAddEvent = () => {
    // console.log('Hello world');
    addGroupEvent(groupName, "Testsdf event", 'test start', 'test end', 'desc', 'location')

  }

  useEffect(() => {
    const fetchEvents = async () => {
      const events = await getGroupEvents(route.params.groupName);
      setGroupEvents(events);
    };
    fetchEvents();
  }, [groupName]);

  //modified from CalendarScreen.js
  checkList = (result) => {
    result.forEach((event, index) => {
      //For events that go over on day
      if (event.startTime.getDate() != event.endTime.getDate()) {
        let longEvent = event;
        result.splice(index, 1);

        let nEventEndSide = {
          category: longEvent.category,
          color: longEvent.color,
          endTime: longEvent.endTime,
          location: longEvent.location,
          startTime: new Date(
            longEvent.endTime.getFullYear(),
            longEvent.endTime.getMonth(),
            longEvent.endTime.getDate()
          ),
          title: longEvent.title,
        };
        result.splice(index, 0, nEventEndSide);

        let eD = new Date(
          longEvent.endTime.getFullYear(),
          longEvent.endTime.getMonth(),
          longEvent.endTime.getDate()
        );
        eD.setDate(eD.getDate() - 1);
        while (eD.getDate() > longEvent.startTime.getDate()) {
          let middleFullDay = {
            category: longEvent.category,
            color: longEvent.color,
            endTime: new Date(
              eD.getFullYear(),
              eD.getMonth(),
              eD.getDate(),
              23,
              59,
              59
            ),
            location: longEvent.location,
            startTime: new Date(eD.getFullYear(), eD.getMonth(), eD.getDate()),
            title: longEvent.title,
          };
          result.splice(index, 0, middleFullDay);
          eD.setDate(eD.getDate() - 1);
        }

        let endOfDay = new Date(
          longEvent.startTime.getFullYear(),
          longEvent.startTime.getMonth(),
          longEvent.startTime.getDate(),
          23,
          59,
          59
        );
        let nEventStartSide = {
          category: longEvent.category,
          color: longEvent.color,
          endTime: endOfDay,
          location: longEvent.location,
          startTime: longEvent.startTime,
          title: longEvent.title,
        };
        result.splice(index, 0, nEventStartSide);
      }
    });
    setEventList(result)
    setCalendar(true)
  };

  //modified from CalendarScreen.js
  goPrevWeek = () => {

    let tempDate = new Date();
    tempDate.setFullYear(weekViewStartDate.getFullYear(), weekViewStartDate.getMonth(), weekViewStartDate.getDate())
    tempDate.setDate(tempDate.getDate() - 7);
    
    setStartDate(tempDate);
    //weekViewStartDate= tempDate;
  };

  //modified from CalendarScreen.js
  goNextWeek = () => {

    let tempDate = new Date();
    tempDate.setFullYear(weekViewStartDate.getFullYear(), weekViewStartDate.getMonth(), weekViewStartDate.getDate())
    tempDate.setDate(tempDate.getDate() + 7);
    
    setStartDate(tempDate);
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
      }}
    >
      <View style={{ margin: 10 }}>
        <View style={{ alignContent: "flex-start", flexDirection: "row" }}>
          <Button title="Back" onPress={() => navigation.goBack()} />
        </View>
        <View style={{ alignContent: "center", marginBottom: 10 }}>
          <Text
            adjustsFontSizeToFit={true}
            numberOfLines={1}
            style={{ fontSize: 30, margin: 10, fontWeight: 500 }}
          >
            {groupName}
          </Text>
        </View>
        <View style={{flexDirection: 'column', height: "90%"}}>
          <View style={{height: "20%",}}>
            <View>
              <Text style={{ fontSize: 25 }}>Members:</Text>
            </View>
            <ScrollView style={{ flex:1 }}>
              {groupMembers.map((item) => {
                return (
                  <View
                    style={{
                      backgroundColor: Colors.secondary,
                      padding: 8,
                      margin: 10,
                      borderRadius: 10,
                    }}
                  >
                    {item.nickname == "" ? (
                      <Text style={{ fontSize: 18 }}>{item.user}</Text>
                    ) : (
                      <Text style={{ fontSize: 20 }}>{item.nickname}</Text>
                    )}
                  </View>
                );
              })}
            </ScrollView>
          </View>
          <View style={{height: "5%"}}>
            <Text style={{ fontSize: 25 }}>Upcoming Group Events</Text>
          </View>
          <View style={{ height: "75%",}}>
            {/* <ScrollView >
              {groupEvents.map((item) => {
                return (
                  <View
                    style={{
                      backgroundColor: Colors.secondary,
                      padding: 8,
                      margin: 10,
                      borderRadius: 10,
                  }}
                  key={item.details.title}>
                    <Text>Title: {item.details.title}</Text>
                    <Text>Description: {item.details.description}</Text>
                  </View>
                )
              })}
            </ScrollView> */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                paddingHorizontal: 10,
                paddingBottom:10,
                paddingTop:5,
              }}
            >
              <View
                style={{
                  flex: 3,
                  alignItems: "flex-start",
                  flexDirection: "column",
                  justifyContent: "center",
                  paddingTop:10,
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
                  flex: 8,
                  alignItems: "flex-start",
                  flexDirection: "column",
                  justifyContent: "center",
                  marginLeft:30,
                  paddingTop:20,
                }}
              >
                <Text style={{ fontSize: 18, paddingTop:5 }}>
                  {groupName}'s Group Events
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    paddingHorizontal: 10,
                  }}
                >
                  <IconButton
                  style={{}}
                  color={Colors.grey}
                  onPress={() => {goPrevWeek()}
                  }
                  icon={(props) => <Octicons name="triangle-left" {...props} />}
                />
                  <Text style={{ fontSize: 20 }}>
                    Week
                  </Text>
                  <IconButton
                    style={{}}
                    color={Colors.grey}
                    onPress={() => {
                    goNextWeek();
                    }}
                    icon={(props) => (
                      <Octicons name="triangle-right" {...props} />
                    )}
                  />
                </View>
              </View>
            </View>

            {(() => {
            return (
              <View style={{ flexDirection: "row", height: "70%" }}>
                <View style={{}}>
                  <View style={{ height: topHeaderHeight }} />
                  <ScrollView scrollEnabled={false} ref={svRef}>
                    {Array.from(Array(24).keys()).map((index) => (
                      <View
                        key={index}
                        style={{
                          height: dailyHeight,
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
                      holidays={[]}
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
                              clickable={false}
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

            {/* <Button 
              title='Add group event'
              onPress={handleAddEvent}
            /> */}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: 'green'
  },
});
