import React, { Component } from "react";
import { readString } from "react-native-csv";
import {
  StyleSheet,
  Button,
  View,
  SafeAreaView,
  Text,
  ScrollView,
  Alert,
  Linking,
  Dimensions,
  TouchableOpacity,
  Modal,
  Animated,
  TextInput,
} from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';
import DropDownPicker from 'react-native-dropdown-picker';
import { Colors } from "../constants/colors";
import * as DocumentPicker from "expo-document-picker";
import Icon from "react-native-vector-icons/FontAwesome";
import TimeTableView, { genTimeBlock } from "react-native-timetable";
import { addSchedule } from "../firebaseConfig";
import { auth, db, userSchedule } from "../firebaseConfig";
import { ref, onValue, push, update, remove } from "firebase/database";
import EventItem from "../components/ui/EventItem";

const leftHeaderWidth = 50;
const topHeaderHeight = 20;
const dailyWidth = (Dimensions.get("window").width - leftHeaderWidth) / 3;
const dailyHeight = Dimensions.get("window").height / 10;

export default class App extends Component {
  constructor(props) {
    super(props);
    this.numOfDays = 7;
    this.pivotDate = genTimeBlock("mon");

    this.scrollPosition = new Animated.Value(0);
    this.scrollEvent = Animated.event(
      [{ nativeEvent: { contentOffset: { y: this.scrollPosition } } }],
      { useNativeDriver: false }
    );

    this.state = {
      visible: false,
      list: [],
      createEventVisible: false,
      openList: false,
      value: null,
      repetitionItems: [
        {label: 'Never', value: 0},
        {label: 'Daily', value: 1},
        {label: 'Weekly', value: 2},
        {label: 'Monthly', value: 3},
      ]
    };
    
  }

  async componentDidMount() {
    const res = await userSchedule(auth.currentUser?.uid);
    const result = [];
    if (res != null) {
      res["things"].map((element) => {
        const sp = element.data.split(",");
        const temp = {
          title: sp[3],
          startTime: new Date(sp[2]),
          endTime: new Date(sp[0]),
          location: sp[1],
        };
        result.push(temp);
      });
    }
    this.setState({ list: result });
  }

  scrollViewRef = (ref) => {
    this.timetableRef = ref;
  };

  onEventPress = (evt) => {
    Alert.alert("onEventPress", JSON.stringify(evt));
  };
  
  openCreateEvent = () => {
    this.setState({ visible: false });
    this.setState({ createEventVisible: true });
  }
  
  /*setOpen = () => {
    this.setState({
      openList: true
    });
  }

  setValue = (value) =>{
    this.setState({
      value: value
    });
  }

  setItems = (items) =>{
    this.setState({
      repetitionItems: items
    });
  }*/
  

  clickHandler = () => {
    this.setState({ visible: true });
  };

  openURL = (url) => {
    Linking.openURL(url).catch((err) =>
      console.error("An error occurred", err)
    );
  };

  openDocumentFile = async () => {
    const res = await DocumentPicker.getDocumentAsync({});
    fetch(res.uri)
      .then(async (response) => {
        const resp = await response.text();
        var result = readString(resp, { header: true });
        result.data.forEach((product) => {
          if (
            product["Type"] == "Midterm Examination" &&
            product["Published End"] != null
          ) {
            this.state.list.push(
              product["Type"] +
                ";" +
                product["Name"] +
                ";" +
                product["First Date"] +
                ";" +
                product["Published Start"] +
                ";" +
                product["Published End"] +
                ";" +
                product["Location"]
            );
          } else if (/[0-9]/.test(product["Published Start"])) {
            const st = product["Published Start"].split(":");
            const ed = (end = product["Published End"].split(":"));
            var start, start_min, end, end_min;
            if (product["Published Start"].lastIndexOf("a") > -1) {
              start = st[0];
              start_min = st[1].replace("a", "");
            } else if (product["Published End"].lastIndexOf("p") > -1) {
              st[0] != "12"
                ? (start = parseInt(st[0], 10) + 12)
                : (start = parseInt(st[0], 10));
              start_min = st[1].replace("p", "");
            }
            if (product["Published End"].lastIndexOf("a") > -1) {
              end = ed[0];
              end_min = ed[1].replace("a", "");
            } else if (product["Published End"].lastIndexOf("p") > -1) {
              ed[0] != "12"
                ? (end = parseInt(ed[0], 10) + 12)
                : (end = parseInt(ed[0], 10));
              end_min = ed[1].replace("p", "");
            }
            for (var i = 0; i < product["Day Of Week"].length; i++) {
              //Monday
              if (product["Day Of Week"][i] == "M") {
                this.state.list.push({
                  title: product["Name"] + " (" + product["Type"] + ")",
                  startTime: genTimeBlock("MON", start, start_min),
                  endTime: genTimeBlock("MON", end, end_min),
                  location: product["Location"],
                });
                //Tuesday
              } else if (
                product["Day Of Week"][i] == "T" &&
                product["Day Of Week"].length > i + 1 &&
                product["Day Of Week"][i + 1] != "h"
              ) {
                this.state.list.push({
                  title: product["Name"] + " (" + product["Type"] + ")",
                  startTime: genTimeBlock("TUE", start, start_min),
                  endTime: genTimeBlock("TUE", end, end_min),
                  location: product["Location"],
                });
                //Wednesday
              } else if (product["Day Of Week"][i] == "W") {
                this.state.list.push({
                  title: product["Name"] + " (" + product["Type"] + ")",
                  startTime: genTimeBlock("WED", start, start_min),
                  endTime: genTimeBlock("WED", end, end_min),
                  location: product["Location"],
                });
                //Thursday
              } else if (
                product["Day Of Week"][i] == "T" &&
                product["Day Of Week"][i + 1] == "h"
              ) {
                this.state.list.push({
                  title: product["Name"] + " (" + product["Type"] + ")",
                  startTime: genTimeBlock("THU", start, start_min),
                  endTime: genTimeBlock("THU", end, end_min),
                  location: product["Location"],
                });
                //Friday
              } else if (product["Day Of Week"][i] == "F") {
                this.state.list.push({
                  title: product["Name"] + " (" + product["Type"] + ")",
                  startTime: genTimeBlock("FRI", start, start_min),
                  endTime: genTimeBlock("FRI", end, end_min),
                  location: product["Location"],
                });
                //Saterday
              } else if (product["Day Of Week"][i] == "S") {
                this.state.list.push({
                  title: product["Name"] + " (" + product["Type"] + ")",
                  startTime: genTimeBlock("SAT", start, start_min),
                  endTime: genTimeBlock("SAT", end, end_min),
                  location: product["Location"],
                });
                //Sunday
              } else if (product["Day Of Week"][i] == "U") {
                this.state.list.push({
                  title: product["Name"] + " (" + product["Type"] + ")",
                  startTime: genTimeBlock("SUN", start, start_min),
                  endTime: genTimeBlock("SUN", end, end_min),
                  location: product["Location"],
                });
              }
            }
          }
        });
        const uniqueArray = this.state.list.filter((value, index) => {
          const _value = JSON.stringify(value);
          return (
            index ===
            this.state.list.findIndex((obj) => {
              return JSON.stringify(obj) === _value;
            })
          );
        });
        this.setState({ list: uniqueArray });
        this.setState({ visible: !this.state.visible });
        addSchedule(auth.currentUser?.uid, this.state.list);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  render() {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <Modal
          animationType="slide"
          transparent={true}
          visible={this.state.visible}
          onRequestClose={() => {
            this.setState({ visible: !this.state.visible });
          }}
        >
          <View
            style={{
              flex: 1,
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={styles.modalView}
            >
              {/*<Text style={styles.title}>
                1. Click the Button{"\n"}
                2. Sign in to your University account{"\n"}
                3. Click the menu --> Personal Schedule{"\n"}
                4. Export --> Export CSV{"\n"}
          </Text>*/}
              <Button
                title="Download schedule"
                onPress={() =>
                  this.openURL(
                    "https://timetable.mypurdue.purdue.edu/Timetabling/gwt.jsp?page=personal"
                  )
                }
              />
              <Button
                title="Import schedule"
                onPress={() => this.openDocumentFile()}
              />
              <Button
                title="Add event"
                onPress={this.openCreateEvent}
              />
              <Button
                title="Close modal"
                onPress={() => {
                  this.setState({ visible: !this.state.visible });
                }}
              />
            </View>
          </View>
        </Modal>
        <Modal
          animationType="slide"
          visible={this.state.createEventVisible}
          transparent={true}
          onRequestClose={() => {
            this.setState({ visible: !this.state.createEventVisible });
          }}
        >
         <View style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}>

            <View style={styles.modal}>
              <View style={styles.row}>

                <Text style = {styles.header_text}>Create Event</Text>
              </View>
              <View style={styles.row}>
              <TextInput 
                style={styles.titleInputStyle}
                placeholder="Add title"
                placeholderTextColor="#8b9cb5"
              >
              </TextInput>
              </View>
              <View style={styles.row}>
                <View style={{flex:1, paddingTop:5}}>
                  <Icon name="map-pin" size={20} color="#2F4858" />
                </View>
                <View style={{flex:8}}>
                  <TextInput 
                    style={styles.inputStyle}
                    placeholder="Location"
                    placeholderTextColor="#8b9cb5"
                  >
                  </TextInput>
                </View>
              </View>
              <View style={styles.row}>
                <View style={{flex:1, paddingTop:5}}>
                  <Icon name="repeat" size={20} color="#2F4858" />
                </View>
                <View style={{flex:8}}>
                </View>
              </View>
              <View style={styles.row}>
                <Text style={{textAlign:"center", margin:5, paddingTop:7,color:"#2F4858"}}>Start</Text>
                <DateTimePicker style={{margin:5}} mode="date" value={new Date()} />
                <DateTimePicker style={{margin:5}} mode="time" value={new Date()} />
              </View>
              <View style={styles.row}>
                <Text style={{textAlign:"center", margin:5, paddingTop:7, color:"#2F4858"}}>End</Text>
                <DateTimePicker style={{margin:5}} mode="date" value={new Date()} />
                <DateTimePicker style={{margin:5}} mode="time" value={new Date()} />
              </View>
            </View>

        </View>
        </Modal>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={this.clickHandler}
          style={styles.touchableOpacityStyle}
        >
          <Icon name="plus-circle" size={50} />
        </TouchableOpacity>
        {/* <View style={styles.container}>
          <TimeTableView
            scrollViewRef={this.scrollViewRef}
            events={this.state.list}
            pivotTime={7}
            pivotEndTime={24}
            pivotDate={this.pivotDate}
            nDays={this.numOfDays}
            onEventPress={this.onEventPress}
            headerStyle={styles.headerStyle}
            formatDateHeader="dddd"
            locale="en"
          />
        </View> */}
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
                eventList={this.state.list}
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
    const { name, style, onScroll, eventList } = this.props;
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
        {populateRows(name, eventList)}
      </ScrollView>
    );
  }
}

// If name is Time, populate the hours 0 ~ 24.
// TODO: Need to set which time the time's going to start.
// If name is Days, populate the schedule.
const populateRows = (name, eventList) =>
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
            flexDirection: "row",
          }}
        >
          {/* Horizontal Guide Line in the background */}
          <View
            style={{
              position: "absolute",
              left: 0,
              top: "50%",
              width: dailyWidth * 7,
              borderBottomColor: "black",
              borderBottomWidth: 1,
              zIndex: 1,
              elevation: 1,
            }}
          />

          {eventList.map((event) => {
            return index == event.startTime.getHours() ? (
              <EventItem
                category="School Courses"
                day={event.startTime.getDay()}
                startTime={new Date(event.startTime)}
                endTime={new Date(event.endTime)}
                title={event.title}
                location={event.location}
              />
            ) : (
              <EventItem category="Empty" />
            );
          })}
        </View>
      ));

const styles = StyleSheet.create({
  headerStyle: {
    backgroundColor: "#81E1B8",
  },
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
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
  touchableOpacityStyle: {
    position: "absolute",
    width: 50,
    height: 50,
    right: 30,
    bottom: 30,
    zIndex: 1,
  },
  modalView: {
    position: "absolute",
    width: 200,
    right: 90,
    bottom: 165,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: "left",
    justifyContent: 'space-between',
    margin: 15,
  },
  modal: {
    backgroundColor: 'white',
    width: 300,
    height: 450,
    justifyContent: "center",
    alignItems: "center",
  },
  header_text: {
    color: "white",
    flex: 1,
    backgroundColor: "#2F4858",
    fontSize: 20,
    textAlign: 'center',
  },
  inputStyle: {
    flex: 1,
    color: 'black',
    paddingLeft:10,
    borderWidth: 1,
    borderColor: "#8b9cb5",
  },
  titleInputStyle: {
    flex: 1,
    color: 'black',
    height:50,
    paddingLeft:10,
    borderWidth: 1,
    fontSize: 18,
    borderColor: "#8b9cb5",
  },
});
