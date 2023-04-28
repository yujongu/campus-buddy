import { StatusBar } from "expo-status-bar";
import { Button, StyleSheet, Text, Pressable, TextInput, View, Modal, Alert, TouchableOpacity, FlatList, ActivityIndicator,Dimensions,ScrollView } from "react-native";
import { EmailAuthProvider } from "firebase/auth";
import { signInWithEmailAndPassword } from "firebase/auth";
import { signOut } from "firebase/auth"
import { updateDoc, doc, arrayRemove, onSnapshot, arrayUnion, query, collection, where } from "firebase/firestore";
import { Colors } from "../constants/colors";
import TopHeaderDays from "../components/ui/TopHeaderDays";
import { EventCategory } from "../constants/eventCategory";
import React, { useState, useEffect } from "react";
import Icon from "react-native-vector-icons/FontAwesome";
import Octicons from "react-native-vector-icons/Octicons";
import { IconButton } from "@react-native-material/core";
import {
  getMonthName,
  getWeekDayName,
  isOnSameDate,
  JSClock,
} from "../helperFunctions/dateFunctions";
import { SafeAreaView } from "react-native-safe-area-context";
import EventItem from "../components/ui/EventItem";
import { PointsProgressBar } from "../components/ui/PointsProgressBar";
import { auth, db, userSchedule, getUserEvents, getUserId, getGroupsWithUser, useGroupsWithUser } from "../firebaseConfig";


export default function User_profile({ navigation, route }) {
  const { email } = route.params;
  const [calendarVisible, setCalendar] = useState(false);
  const [pointsVisible, setPoints] = useState(false);
  const [groupVisible, setGroup] = useState(false);
  const [calendarPublic, setCalendarPublic] = useState(false);
  const [pointsPublic, setPointsPublic] = useState(false);
  const [groupPublic, setGroupPublic] = useState(false);
  const [eventList, setEventList] = useState([]);
  const [weekViewStartDate,setStartDate] = useState(new Date());
  const [friendId,setId] = useState("");
  const [userGroups, setUserGroups] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const id = await getUserId(email)
      setId(id[0])
      const userDocRef = doc(db, "users", id[0]);
      const res = onSnapshot(userDocRef, (doc) => {
        if (res != null) {
          setCalendarPublic(doc.data().calendar_privacy);
          setPointsPublic(doc.data().points_privacy);
          setGroupPublic(doc.data().group_privacy);
          // console.log(groupPublic);
        } else {
          console.log("No such document!");
        }
      });
    }
   
    fetchData();
  }, []);

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

  const getPoints = async () => {
    // console.log("get points")
    setPoints(true);
  }
  
  const getEvents = async () => {
    const result = []
    const id = await getUserId(email)
    const res = await userSchedule(id[0]);
    if(res != null) {
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
    }  
    const events = await getUserEvents(id[0]);
    if (events != null) {
      for (let i = 0; i < events["event"].length; i++) {
        const temp = {
          category: EventCategory.EVENT,
          title: events["event"][i]["details"]["title"],
          startTime: new Date(events["event"][i]["details"]["startTime"].seconds * 1000), //multiply 1000 since Javascript uses milliseconds. Timestamp to date.
          endTime: new Date(events["event"][i]["details"]["endTime"].seconds * 1000),
          location: events["event"][i]["details"]["location"],
          color: events["event"][i]["details"]["color"],
          id: events["event"][i]["id"],
        };
        result.push(temp);
      }
    }
    checkList(result)
  }

  const getGroups = async () => {
    // TODO 
    setGroup(true);

    // get groupsWithUser
    try {
      const groups = await getGroupsWithUser(email);
      //console.log(groups); // This should log an array of group names
      // TODO: Set state or do something else with the group names
      setUserGroups(groups);
    } catch (error) {
      console.error(error);
    }

  }

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
    <SafeAreaView style={{justifyContent: "center", alignItems: 'center', flex:1}}>
        <Text>{email}'s profile page</Text>
        <Button title="View calendar" onPress={async ()=>{getEvents()}}/>
        <Button title="View points" onPress={async()=>{getPoints()}}/>
        <Button title="View groups" onPress={async()=>{getGroups()}}/>
        <Button title="Go back" onPress={() => navigation.goBack()}/>
        <Modal
          animationType="slide"
          visible={calendarVisible}
          transparent={false}
          onRequestClose={() => {
            this.setState({ calendarVisible: false});
          }}
        >
       { calendarPublic ? 
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
                  flex: 3,
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
                  flex: 8,
                  alignItems: "flex-start",
                  flexDirection: "column",
                  justifyContent: "center",
                  marginLeft:30,
                  paddingTop:20
                }}
              >
                <Text style={{ fontSize: 18, paddingTop:5 }}>
                  {email}'s
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

              <View
                style={{
                  flex: 1,
                  alignItems: "flex-start",
                  flexDirection: "column",
                  justifyContent: "center",
                  marginLeft:10,
                  marginTop:10
                }}
              >
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={()=>setCalendar(false)}
                  style={styles.touchableOpacityStyle}
                >
                  <Icon name="mail-reply" size={20} color="black" />
                </TouchableOpacity>
              </View>

              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                  </View>
              <View
                style={{
                  flex: 1,
                  alignItems: "flex-end",
                }}
              >
              </View>
            </View>
          </View>

          {(() => {
            return (
              <View style={{ flexDirection: "row", height: "100%" }}>
                <View>
                  <View style={{ height: topHeaderHeight }} />
                  <ScrollView scrollEnabled={false} ref={svRef}>
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
        </View> : 
        <View style = {{flex:1, justifyContent:"center" }}>
          <Text style = {{fontSize:20, textAlign:"center"}}> {email}'s calendar is private.</Text>
          <TouchableOpacity
                activeOpacity={0.7}
                onPress={()=>setCalendar(false)}
                style={{alignItems:"center", margin:30}}
              >
                <Icon name="mail-reply" size={30} color="black" />
          </TouchableOpacity>
        </View> }
        </Modal> 

        <Modal
          animationType="slide"
          visible={pointsVisible}
          transparent={false}
        >
        { pointsPublic ?
          <View style={{ flex: 1, margin: 60 }}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={()=>setPoints(false)}
              style={{left:275}}
            >
              <Icon name="mail-reply" size={20} color="black" />
            </TouchableOpacity>
            <Text style={{fontSize:25, textAlign:"center"}}>{email}'s{'\n'}Points</Text>
            <View style={{flex:1, top:-200}}>
              <PointsProgressBar id={friendId}/>
            </View>
          </View> :

          <View style = {{flex:1, justifyContent:"center" }}>
            <Text style = {{fontSize:20, textAlign:"center"}}> {email}'s points are private.</Text>
            <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={()=>setPoints(false)}
                  style={{alignItems:"center", margin:30}}
                >
                  <Icon name="mail-reply" size={30} color="black" />
            </TouchableOpacity>
          </View> }
        </Modal>  
         
        <Modal
          animationType="slide"
          visible={groupVisible}
          transparent={false}
        >   
        { groupPublic ?
            <View style={styles.groupPublic}>
              
              <View style={{flexDirection: 'row'}}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={()=>setGroup(false)}
                  style={{margin: 10, left: -10}}
                >
                  <Icon name="mail-reply" size={20} color="black" />
                </TouchableOpacity>
                <Text style={{fontSize:25, textAlign:"center"}}>{email}'s{'\n'}Groups</Text>
              </View>

              <View style={styles.scrollViewContainer}>
                <ScrollView>
                  {userGroups.map((groupName) => (
                      <View style={styles.groupsContainer}>
                        <Text key={groupName} style={styles.groupNameText}>{groupName}</Text>
                      </View>
                  ))}
                </ScrollView>
              </View>
            </View>
          
          :

          <View style = {{flex:1, justifyContent:"center"}}>
            <Text style = {{fontSize:20, textAlign:"center"}}> {email}'s groups are private.</Text>
            <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={()=>setGroup(false)}
                  style={{alignItems:"center", margin:30}}
                >
                  <Icon name="mail-reply" size={30} color="black" />
            </TouchableOpacity>
          </View>
          }
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
  touchableOpacityStyle: {
    left:30,
    zIndex: 1,
    fontSize: 10
  },
  groupPublic: {
    flex: 1,
    marginTop: '40%',
    margin: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollViewContainer: {
    flex: 1, 
    width: '70%',
  },
  groupsContainer: {
    backgroundColor: Colors.secondary,
    padding: 8,
    margin: 10,
    borderRadius: 10,
  },
  groupNameText: {
    fontSize: 24,
  }
});
