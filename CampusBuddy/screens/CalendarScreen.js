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
  KeyboardAvoidingView,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

import DropDownPicker from "react-native-dropdown-picker";
import { ColorWheel } from "../components/ui/ColorWheel";
import { SelectList } from "react-native-dropdown-select-list";
import { Colors } from "../constants/colors";
import * as DocumentPicker from "expo-document-picker";
import Icon from "react-native-vector-icons/FontAwesome";
import FeatherIcon from "react-native-vector-icons/Feather";
import TimeTableView, { genTimeBlock } from "react-native-timetable";
import { addSchedule, userList, addEvent } from "../firebaseConfig";
import { auth, db, userSchedule, getUserEvents } from "../firebaseConfig";
import EventItem from "../components/ui/EventItem";
import { even, IconButton } from "@react-native-material/core";
import { async } from "@firebase/util";
import TopHeaderDays from "../components/ui/TopHeaderDays";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  doc,
  onSnapshot,
  updateDoc,
  getDoc,
  Timestamp,
} from "firebase/firestore";
import { EventCategory } from "../constants/eventCategory";

const MonthName = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const leftHeaderWidth = 50;
const topHeaderHeight = 60;
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
      midterms: [],
      holidays: [],
      testlist: [],
      holidayCountryList: [],
      selectedCountryCode: "",
      createEventVisible: false,
      holidaySettingVisible: false,
      title: "",
      location: "",
      colorPicker: false,
      eventColor: "#8b9cb5",
      openList: false,
      value: null,
      repetitionItems: [
        { label: "Never", value: 0 },
        { label: "Daily", value: 1 },
        { label: "Weekly", value: 2 },
        { label: "Monthly", value: 3 },
      ],
      openDate: false,
      repetition: 0,
      eventStartDate: new Date(),
      eventStartTime: new Date(),
      eventEndDate: new Date(),
      eventEndTime: new Date(),
      startDate: null,
      startTime: null,
      endDate: null,
      endTime: null,
      // This is the starting date for the current calendar UI.
      weekViewStartDate: new Date(),
    };
  }

  async componentDidMount() {
    //Set the calendar UI start date
    let tempDate = new Date();
    tempDate.setDate(tempDate.getDate() - tempDate.getDay());
    this.setState({ weekViewStartDate: tempDate });

    // Getting schedules from database
    const res = await userSchedule(auth.currentUser?.uid);
    const result = [];
    if (res != null) {
      res["things"].map((element) => {
        const sp = element.data.split(",");
        const temp = {
          category: EventCategory.SCHOOLCOURSE,
          title: sp[3],
          startTime: new Date(sp[2]),
          endTime: new Date(sp[0]),
          location: sp[1],
        };
        result.push(temp);
      });
    }

    // Getting events from database
    const events = await getUserEvents(auth.currentUser?.uid);
    if (events != null) {
      for (let i = 0; i < events["event"].length; i++) {
        // const temp = {
        //   title: events["event"][i]["title"],
        //   startTime: genTimeBlock(
        //     this.convertDay(events["event"][i]["startDate"]),
        //     parseInt(events["event"][i]["startTime"].substring(0, 2), 10),
        //     parseInt(events["event"][i]["startTime"].substring(3, 5), 10)
        //   ),
        //   endTime: genTimeBlock(
        //     this.convertDay(events["event"][i]["endDate"]),
        //     parseInt(events["event"][i]["endTime"].substring(0, 2), 10),
        //     parseInt(events["event"][i]["endTime"].substring(3, 5), 10)
        //   ),
        //   location: events["event"][i]["location"],
        //   color: events["event"][i]["color"],
        // };
        const temp = {
          category: EventCategory.EVENT,
          title: events["event"][i]["title"],
          startTime: new Date(events["event"][i]["startTime"].seconds * 1000), //multiply 1000 since Javascript uses milliseconds. Timestamp to date.
          endTime: new Date(events["event"][i]["endTime"].seconds * 1000),
          location: events["event"][i]["location"],
          color: events["event"][i]["color"],
        };
        result.push(temp);
      }
    }

    this.setState({ list: result });
    const userDocRef = doc(db, "users", auth.currentUser.uid);
    onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        if (
          doc.data().holidayNationPref !== null &&
          doc.data().holidayNationPref !== ""
        ) {
          let cPref = doc.data().holidayNationPref;

          this.setState({ selectedCountryCode: cPref });
          this.getHolidays(cPref, this.state.weekViewStartDate.getFullYear());
        }
      }
    });
  }

  convertDay = (day) => {
    var dayStr = "";
    switch (day) {
      case "0":
        dayStr = "SUN";
        break;
      case "1":
        dayStr = "MON";
        break;
      case "2":
        dayStr = "TUE";
        break;
      case "3":
        dayStr = "WED";
        break;
      case "4":
        dayStr = "THU";
        break;
      case "5":
        dayStr = "FRI";
        break;
      case "6":
        dayStr = "SAT";
        break;
    }
    return dayStr;
  };

  submitEvent = (eventColor) => {
    // addEvent(
    //   auth.currentUser?.uid,
    //   this.title,
    //   this.startDate,
    //   this.startTime,
    //   this.endDate,
    //   this.endTime,
    //   this.location,
    //   "test",
    //   10,
    //   eventColor,
    //   0
    // );

    if (
      this.location == undefined ||
      this.title == undefined ||
      this.location == "" ||
      this.title == ""
    ) {
      alert("Enter title and location for the event");
      this.setLocation("");
      this.setTitle("");
    } else {
      var eventSTime = new Date(
        this.state.eventStartDate.getFullYear(),
        this.state.eventStartDate.getMonth(),
        this.state.eventStartDate.getDate(),
        this.state.eventStartTime.getHours(),
        this.state.eventStartTime.getMinutes()
      );

      var eventETime = new Date(
        this.state.eventEndDate.getFullYear(),
        this.state.eventEndDate.getMonth(),
        this.state.eventEndDate.getDate(),
        this.state.eventEndTime.getHours(),
        this.state.eventEndTime.getMinutes()
      );

      addEvent(
        auth.currentUser?.uid,
        this.title,
        eventSTime,
        eventETime,
        this.location,
        "test",
        10,
        eventColor,
        0
      );
      // addEvent(
      //   auth.currentUser?.uid,
      //   this.title,
      //   this.state.eventStartDate,
      //   this.state.eventStartTime,
      //   this.state.eventEndDate,
      //   this.state.eventEndTime,
      //   this.location,
      //   "test",
      //   10,
      //   eventColor,
      //   0
      // );

      this.state.list.push({
        title: this.title,
        startTime: eventSTime,
        endTime: eventETime,
        location: this.location,
        color: eventColor,
      });
      // this.state.list.push({
      //   title: this.title,
      //   startTime: genTimeBlock(
      //     this.convertDay(this.startDate),
      //     parseInt(this.startTime.substring(0, 2), 10),
      //     parseInt(this.startTime.substring(4, 6), 10)
      //   ),
      //   endTime: genTimeBlock(
      //     this.convertDay(this.endDate),
      //     parseInt(this.endTime.substring(0, 2), 10),
      //     parseInt(this.endTime.substring(4, 6), 10)
      //   ),
      //   location: this.location,
      //   color: eventColor,
      // });

      this.setState({ eventStartDate: new Date() });
      this.setState({ eventStartTime: new Date() });
      this.setState({ eventEndDate: new Date() });
      this.setState({ eventEndTime: new Date() });
      this.setLocation("");
      this.setTitle("");
    }
  };
  setTitle = (title) => {
    this.title = title;
  };

  setLocation = (location) => {
    this.location = location;
  };

  setStartDate = (date) => {
    this.startDate = date;
  };

  setStartTime = (time) => {
    this.startTime = time;
  };

  setEndDate = (date) => {
    this.endDate = date;
  };

  setEndTime = (time) => {
    this.endTime = time;
  };

  scrollViewRef = (ref) => {
    this.timetableRef = ref;
  };

  onEventPress = (evt) => {
    Alert.alert("onEventPress", JSON.stringify(evt));
  };

  openCreateEvent = () => {
    this.setState({ visible: false });
    this.setState({ createEventVisible: true });
  };

  updateColor = (color) => {
    this.setState({ eventColor: color });
    this.setState({ colorPicker: false });
  };

  setHolidaySettings = () => {
    this.setState({ visible: false });
    this.getCountries();
    this.setState({ holidaySettingVisible: true });
  };

  setOpen = () => {
    this.setState({
      openList: !this.state.openList,
    });
  };
  setDateOpen = () => {
    this.setState({
      openDate: !this.state.openList,
    });
  };

  setValue = (value) => {
    this.setState({
      repetition: value,
    });
    this.setState({
      openList: false,
    });
  };

  setItems = (items) => {
    this.setState({
      repetitionItems: items,
    });
  };

  setRepetition = (rep) => {
    this.setState({ repetition: rep });
    this.setState({
      openList: false,
    });
  };

  clickHandler = () => {
    this.setState({ visible: true });
  };

  openURL = (url) => {
    Linking.openURL(url).catch((err) =>
      console.error("An error occurred", err)
    );
  };

  addEventToCalendar = async () => {
    const querySnapShot = await getDoc(
      doc(db, "events", auth.currentUser?.uid)
    );
    if (querySnapShot.exists()) {
      const result = querySnapShot.data();
      console.log(result["start"].toDate());
      this.state.testlist.push({
        title: result["title"],
        startTime: result["start"],
        endTime: result["end"],
        location: result["location"],
      });
      console.log(this.state.list);
    }
  };

  openDocumentFile = async () => {
    const res = await DocumentPicker.getDocumentAsync({});
    fetch(res.uri)
      .then(async (response) => {
        const resp = await response.text();
        var result = readString(resp, { header: true });
        result.data.forEach((product) => {
          console.log(product["Name"]);
          if (
            (product["Type"] == "Midterm Examination" ||
              product["Type"] == "Final Examination") &&
            product["Published End"] != null
          ) {
            this.state.midterms.push(
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
          } else if (
            /[0-9]/.test(product["Published Start"]) ||
            product["Published Start"] == "noon"
          ) {
            const st =
              product["Published Start"] == "noon"
                ? 12
                : product["Published Start"].split(":");
            const ed = product["Published End"].split(":");
            var start, start_min, end, end_min;
            if (product["Published Start"].lastIndexOf("a") > -1) {
              start = st[0];
              start_min = st[1].replace("a", "");
            } else if (product["Published Start"].lastIndexOf("p") > -1) {
              st[0] != "12"
                ? (start = parseInt(st[0], 10) + 12)
                : (start = parseInt(st[0], 10));
              start_min = st[1].replace("p", "");
            } else {
              start = st;
              start_min = 0;
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
                  color: "#D1FF96",
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
                  color: "#D1FF96",
                });
                //Wednesday
              } else if (product["Day Of Week"][i] == "W") {
                this.state.list.push({
                  title: product["Name"] + " (" + product["Type"] + ")",
                  startTime: genTimeBlock("WED", start, start_min),
                  endTime: genTimeBlock("WED", end, end_min),
                  location: product["Location"],
                  color: "#D1FF96",
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
                  color: "#D1FF96",
                });
                //Friday
              } else if (product["Day Of Week"][i] == "F") {
                this.state.list.push({
                  title: product["Name"] + " (" + product["Type"] + ")",
                  startTime: genTimeBlock("FRI", start, start_min),
                  endTime: genTimeBlock("FRI", end, end_min),
                  location: product["Location"],
                  color: "#D1FF96",
                });
                //Saterday
              } else if (product["Day Of Week"][i] == "S") {
                this.state.list.push({
                  title: product["Name"] + " (" + product["Type"] + ")",
                  startTime: genTimeBlock("SAT", start, start_min),
                  endTime: genTimeBlock("SAT", end, end_min),
                  location: product["Location"],
                  color: "#D1FF96",
                });
                //Sunday
              } else if (product["Day Of Week"][i] == "U") {
                this.state.list.push({
                  title: product["Name"] + " (" + product["Type"] + ")",
                  startTime: genTimeBlock("SUN", start, start_min),
                  endTime: genTimeBlock("SUN", end, end_min),
                  location: product["Location"],
                  color: "#D1FF96",
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

  //navigate through calendar ui
  goPrevWeek = () => {
    let currYear = this.state.weekViewStartDate.getFullYear();
    let tempDate = this.state.weekViewStartDate;
    tempDate.setDate(tempDate.getDate() - 7);
    if (
      tempDate.getFullYear() != currYear &&
      this.state.selectedCountryCode != null
    ) {
      this.getHolidays(this.state.selectedCountryCode, tempDate.getFullYear());
    }
    this.setState({ weekViewStartDate: tempDate });
  };
  goNextWeek = () => {
    let currYear = this.state.weekViewStartDate.getFullYear();
    let tempDate = this.state.weekViewStartDate;
    tempDate.setDate(tempDate.getDate() + 7);
    if (
      tempDate.getFullYear() != currYear &&
      this.state.selectedCountryCode != null
    ) {
      this.getHolidays(this.state.selectedCountryCode, tempDate.getFullYear());
    }
    this.setState({ weekViewStartDate: tempDate });
  };

  //fetch public holiday
  getHolidays = async (countryCode, year) => {
    try {
      const response = await fetch(
        `https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`
      );
      const resp = await response.json();
      this.setState({ holidays: resp });
    } catch (error) {
      console.error("Error at getHolidays\n" + error);
    }
  };
  getCountries = async () => {
    try {
      const response = await fetch(
        `https://date.nager.at/api/v3/AvailableCountries`
      );
      const resp = await response.json();
      let nList = [];
      for (let i in resp) {
        nList.push({ key: resp[i].countryCode, value: resp[i].name });
      }
      this.setState({ holidayCountryList: nList });
    } catch (error) {
      console.error(error);
    }
  };

  storeData = async (value) => {
    this.setState({ selectedCountryCode: value });
    this.getHolidays(value, this.state.weekViewStartDate.getFullYear());
    await updateDoc(doc(db, "users", auth.currentUser.uid), {
      holidayNationPref: value,
    });
    this.setState({ holidaySettingVisible: false });
  };

  removeData = async () => {
    this.setState({ selectedCountryCode: "" });
    this.setState({ holidays: [] });
    await updateDoc(doc(db, "users", auth.currentUser.uid), {
      holidayNationPref: "",
    });
    this.setState({ holidaySettingVisible: false });
  };

  //TODO: Need to do date time error checking when start date time is after end date time, etc.
  onEventStartDateSelected = (event, value) => {
    this.setState({ eventStartDate: value });
  };

  onEventStartTimeSelected = (event, value) => {
    this.setState({ eventStartTime: value });
  };

  onEventEndDateSelected = (event, value) => {
    this.setState({ eventEndDate: value });
  };

  onEventEndTimeSelected = (event, value) => {
    this.setState({ eventEndTime: value });
  };

  render() {
    const {
      title,
      location,
      openList,
      repetitionItems,
      colorPicker,
      eventColor,
      weekViewStartDate: weekViewStartDate,
      startDate,
      startTime,
      endDate,
      endTime,
      repetition,
      openDate,
    } = this.state;
    if (colorPicker) {
      console.log("colorpicked");
      return <ColorWheel updateColor={this.updateColor} />;
    }
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
            <View style={styles.modalView}>
              {/* Modal for calendar options */}
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
              <Button title="Add event" onPress={this.openCreateEvent} />
              <Button
                title="Holiday settings"
                onPress={this.setHolidaySettings}
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
        {/* Create event modal */}
        <Modal
          animationType="slide"
          visible={this.state.createEventVisible}
          transparent={true}
          onRequestClose={() => {
            this.setState({ visible: !this.state.createEventVisible });
          }}
        >
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View style={styles.modal}>
              <TouchableOpacity
                onPress={() => this.setState({ createEventVisible: false })}
              >
                <View style={{ paddingLeft: 270, paddingTop: 5 }}>
                  <Icon name="times" size={20} color="#2F4858" />
                </View>
              </TouchableOpacity>
              {/* Creating a new View component with styles.row for each row in the modal for formatting */}
              <View style={styles.row}>
                <Text style={styles.header_text}>Create Event</Text>
              </View>
              <View style={styles.row}>
                {/* New row for color picker and title input */}
                <TouchableOpacity
                  onPress={() => this.setState({ colorPicker: true })}
                >
                  <View style={{ paddingTop: 5, paddingRight: 15 }}>
                    <Icon name="square" size={40} color={eventColor} />
                  </View>
                </TouchableOpacity>
                <TextInput
                  style={styles.titleInputStyle}
                  placeholder="Add title"
                  placeholderTextColor="#8b9cb5"
                  onChangeText={(text) => this.setTitle(text)}
                ></TextInput>
              </View>
              <View style={styles.row}>
                <View style={{ flex: 1, paddingTop: 10 }}>
                  <Icon name="map-pin" size={20} color="#2F4858" />
                </View>
                <View style={{ flex: 8 }}>
                  <TextInput
                    style={styles.inputStyle}
                    placeholder="Location"
                    placeholderTextColor="#8b9cb5"
                    onChangeText={(text) => this.setLocation(text)}
                  ></TextInput>
                </View>
              </View>
              <View style={styles.row}>
                <View style={{ flex: 1, paddingTop: 10 }}>
                  <Icon name="repeat" size={20} color="#2F4858" />
                </View>
                <View style={{ flex: 8 }}>
                  {/*dropdown selection does not work :(*/}
                  <DropDownPicker
                    open={openList}
                    value={repetition}
                    items={repetitionItems}
                    placeholder={"Never"}
                    setValue={this.setValue}
                    setItems={this.setItems}
                    onPress={this.setOpen}
                  />
                </View>
              </View>
              {/* <View style={styles.row}> */}
              <View style={styles.row}>
                <Text
                  style={{
                    textAlign: "center",
                    margin: 5,
                    paddingTop: 7,
                    color: "#2F4858",
                  }}
                >
                  Start
                </Text>
                <DateTimePicker
                  mode={"date"}
                  value={this.state.eventStartDate}
                  onChange={this.onEventStartDateSelected}
                  style={{ marginLeft: 10, marginTop: 5 }}
                />
                <DateTimePicker
                  mode={"time"}
                  value={this.state.eventStartTime}
                  onChange={this.onEventStartTimeSelected}
                  style={{ marginLeft: 10, marginTop: 5 }}
                />
                {/* <TextInput
                  placeholder={"Day"}
                  placeholderTextColor="#8b9cb5"
                  style={{
                    color: "black",
                    borderWidth: 1,
                    borderColor: "#8b9cb5",
                    marginLeft: 10,
                    marginTop: 5,
                    width: 50,
                    height: 30,
                    textAlign: "center",
                  }}
                  value={startDate}
                  onChangeText={(text) => this.setStartDate(text)}
                /> */}
                {/* <TextInput
                  placeholder={"Time"}
                  placeholderTextColor="#8b9cb5"
                  style={{
                    color: "black",
                    borderWidth: 1,
                    borderColor: "#8b9cb5",
                    marginLeft: 10,
                    marginTop: 5,
                    width: 100,
                    height: 30,
                    textAlign: "center",
                  }}
                  value={startTime}
                  onChangeText={(text) => this.setStartTime(text)}
                /> */}
              </View>
              <View style={styles.row}>
                <Text
                  style={{
                    textAlign: "center",
                    margin: 5,
                    paddingTop: 7,
                    color: "#2F4858",
                  }}
                >
                  End
                </Text>
                <DateTimePicker
                  mode={"date"}
                  value={this.state.eventEndDate}
                  onChange={this.onEventEndDateSelected}
                  style={{ marginLeft: 10, marginTop: 5 }}
                />
                <DateTimePicker
                  mode={"time"}
                  value={this.state.eventEndTime}
                  onChange={this.onEventEndTimeSelected}
                  style={{ marginLeft: 10, marginTop: 5 }}
                />
                {/* <TextInput
                  placeholder={"Day"}
                  placeholderTextColor="#8b9cb5"
                  style={{
                    color: "black",
                    borderWidth: 1,
                    borderColor: "#8b9cb5",
                    marginLeft: 10,
                    marginTop: 5,
                    width: 50,
                    height: 30,
                    textAlign: "center",
                  }}
                  value={endDate}
                  onChangeText={(text) => this.setEndDate(text)}
                />
                <TextInput
                  placeholder={"Time"}
                  placeholderTextColor="#8b9cb5"
                  style={{
                    color: "black",
                    borderWidth: 1,
                    borderColor: "#8b9cb5",
                    marginLeft: 10,
                    marginTop: 5,
                    width: 100,
                    height: 30,
                    textAlign: "center",
                  }}
                  value={endTime}
                  onChangeText={(text) => this.setEndTime(text)}
                /> */}
              </View>
              <Button
                title="Create new event"
                onPress={() => {
                  this.submitEvent(eventColor),
                    this.setState({ createEventVisible: false });
                }}
              />
            </View>
          </View>
        </Modal>

        <Modal
          animationType="slide"
          transparent={true}
          // visible={false}
          visible={this.state.holidaySettingVisible}
          // onRequestClose={() => {
          //   this.setState({
          //     holidaySettingVisible: !this.state.holidaySettingVisible,
          //   });
          // }}
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
              style={{
                backgroundColor: "white",
                width: 300,
                height: 450,
                borderRadius: 20,
                justifyContent: "space-between",
              }}
            >
              <View>
                <TouchableOpacity
                  onPress={() =>
                    this.setState({ holidaySettingVisible: false })
                  }
                >
                  <View style={{ paddingLeft: 260, paddingTop: 10 }}>
                    <Icon name="times" size={20} color="#2F4858" />
                  </View>
                </TouchableOpacity>

                <View style={{ marginRight: 10, marginLeft: 10 }}>
                  <Text>Country</Text>
                  <SelectList
                    setSelected={(val) =>
                      this.setState({ selectedCountry: val })
                    }
                    data={this.state.holidayCountryList}
                  />
                  <View style={{ marginTop: 15, flexDirection: "row" }}>
                    <Text style={{ fontWeight: "bold", marginRight: 10 }}>
                      Current Selected Option:
                    </Text>
                    <Text>{this.state.selectedCountryCode}</Text>
                  </View>
                </View>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginLeft: 10,
                  marginRight: 10,
                  marginBottom: 10,
                }}
              >
                <Button
                  onPress={() => this.storeData(this.state.selectedCountry)}
                  title="Save"
                />
                <Button title="Hide holidays" onPress={this.removeData} />
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

        <View style={styles.monthHeaderContainer}>
          <IconButton
            onPress={this.goPrevWeek}
            icon={(props) => <FeatherIcon name="arrow-left" {...props} />}
          />
          <Text style={{ fontSize: 20 }}>
            {MonthName[this.state.weekViewStartDate.getMonth()]}
          </Text>
          <IconButton
            onPress={this.goNextWeek}
            icon={(props) => <FeatherIcon name="arrow-right" {...props} />}
          />
        </View>
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
                  <TopHeaderDays
                    day={0}
                    holidays={this.state.holidays}
                    startDay={this.state.weekViewStartDate}
                  />
                  <TopHeaderDays
                    day={1}
                    holidays={this.state.holidays}
                    startDay={this.state.weekViewStartDate}
                  />
                  <TopHeaderDays
                    day={2}
                    holidays={this.state.holidays}
                    startDay={this.state.weekViewStartDate}
                  />
                  <TopHeaderDays
                    day={3}
                    holidays={this.state.holidays}
                    startDay={this.state.weekViewStartDate}
                  />
                  <TopHeaderDays
                    day={4}
                    holidays={this.state.holidays}
                    startDay={this.state.weekViewStartDate}
                  />
                  <TopHeaderDays
                    day={5}
                    holidays={this.state.holidays}
                    startDay={this.state.weekViewStartDate}
                  />
                  <TopHeaderDays
                    day={6}
                    holidays={this.state.holidays}
                    startDay={this.state.weekViewStartDate}
                  />
                </View>
              </View>
              {/* This is the vertically scrolling content. */}
              <ScrollViewVerticallySynced
                style={{ width: dailyWidth * 7 }}
                name="notTime"
                onScroll={this.scrollEvent}
                scrollPosition={this.scrollPosition}
                eventList={this.state.list}
                weekStartDate={this.state.weekViewStartDate}
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
    const { name, style, onScroll, eventList, weekStartDate } = this.props;
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
        {populateRows(name, eventList, weekStartDate)}
      </ScrollView>
    );
  }
}

const displayEvents = () => {
  /* return (
    <EventItem
    category="School Courses"
    day={5}
    startTime={genTimeBlock("FRI", 3, 30)}
    endTime={genTimeBlock("FRI", 5, 30)}
    title={"test"}
    location={"test"}
    color={"#8b9cb5"}
  />
  )*/
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

// If name is Time, populate the hours 0 ~ 24.
// TODO: Need to set which time the time's going to start.
// If name is Days, populate the schedule.
const populateRows = (name, eventList, weekStartDate) =>
  name == "Time"
    ? Array.from(Array(24).keys()).map((index) => (
        <View
          key={`${name}-${index}`}
          style={{
            height: dailyHeight,
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
            flex: 1,
            flexDirection: "row",
          }}
        >
          {/* Horizontal Guide Line in the background */}
          {/* <View
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
          /> */}

          {eventList.map((event) => {
            return index == event.startTime.getHours() &&
              makeVisible(weekStartDate, event) ? (
              <EventItem
                category={event.category}
                day={event.startTime.getDay()}
                startTime={new Date(event.startTime)}
                endTime={new Date(event.endTime)}
                title={event.title}
                location={event.location}
                color={event.color}
              />
            ) : (
              // <EventItem category="Empty" />
              <View />
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
  monthHeaderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingLeft: 10,
    paddingRight: 10,
  },
  daysContainer: {
    flexDirection: "row",
  },
  daysWithDate: {
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
    flexDirection: "row",
    alignItems: "left",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 25,
    marginRight: 25,
  },
  modal: {
    backgroundColor: "white",
    width: 350,
    height: 450,
    justifyContent: "center",
    alignItems: "center",
    bottom: 100,
  },
  header_text: {
    color: "white",
    flex: 1,
    backgroundColor: "#2F4858",
    fontSize: 20,
    textAlign: "center",
  },
  inputStyle: {
    flex: 1,
    color: "black",
    paddingLeft: 10,
    borderWidth: 1,
    borderColor: "#8b9cb5",
  },
  titleInputStyle: {
    flex: 1,
    color: "black",
    height: 50,
    paddingLeft: 10,
    borderWidth: 1,
    fontSize: 18,
    borderColor: "#8b9cb5",
  },
});
