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
import {ColorWheel} from "../components/ui/ColorWheel";
import { SelectList } from "react-native-dropdown-select-list";
import { Colors } from "../constants/colors";
import * as DocumentPicker from "expo-document-picker";
import Icon from "react-native-vector-icons/FontAwesome";
import FeatherIcon from "react-native-vector-icons/Feather";
import TimeTableView, { genTimeBlock } from "react-native-timetable";
import { addSchedule, userList } from "../firebaseConfig";
import { auth, db, userSchedule } from "../firebaseConfig";
import EventItem from "../components/ui/EventItem";
import { IconButton } from "@react-native-material/core";
import { async } from "@firebase/util";
import TopHeaderDays from "../components/ui/TopHeaderDays";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";

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
      holidayCountryList: [],
      selectedCountryCode: "",
      createEventVisible: false,
      holidaySettingVisible: false,
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
      repetition: 0,
      // This is the starting date for the current calendar UI.
      startDay: new Date(),
    };
  }

  async componentDidMount() {
    const res = await userSchedule(auth.currentUser?.uid);
    const result = [];

    //Set the calendar UI start date
    let tempDate = new Date();
    tempDate.setDate(tempDate.getDate() - tempDate.getDay());
    this.setState({ startDay: tempDate });

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
    const userDocRef = doc(db, "users", auth.currentUser.uid);
    onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        if (
          doc.data().holidayNationPref !== null &&
          doc.data().holidayNationPref !== ""
        ) {
          let cPref = doc.data().holidayNationPref;

          this.setState({ selectedCountryCode: cPref });
          this.getHolidays(cPref, this.state.startDay.getFullYear());
        }
      }
    });
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
  };

  updateColor = (color) => {
    this.setState({eventColor: color})
    this.setState({colorPicker: false})
  }

  setHolidaySettings = () => {
    this.setState({ visible: false });
    this.getCountries();
    this.setState({ holidaySettingVisible: true });
  };

  setOpen = () => {
    this.setState({
      openList: !this.state.openList
    });
  }

  setValue = (value) =>{
    this.setState({
      repetition: value
    });
    this.setState({
      openList: false
    });
  }

  setItems = (items) =>{
    this.setState({
      repetitionItems: items
    });
  }

  setRepetition = (rep) => {
    this.setState({ repetition: rep });
    this.setState({
      openList: false
    });
  }

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

  //navigate through calendar ui
  goPrevWeek = () => {
    let currYear = this.state.startDay.getFullYear();
    let tempDate = this.state.startDay;
    tempDate.setDate(tempDate.getDate() - 7);
    if (
      tempDate.getFullYear() != currYear &&
      this.state.selectedCountryCode != null
    ) {
      this.getHolidays(this.state.selectedCountryCode, tempDate.getFullYear());
    }
    this.setState({ startDay: tempDate });
  };
  goNextWeek = () => {
    let currYear = this.state.startDay.getFullYear();
    let tempDate = this.state.startDay;
    tempDate.setDate(tempDate.getDate() + 7);
    if (
      tempDate.getFullYear() != currYear &&
      this.state.selectedCountryCode != null
    ) {
      this.getHolidays(this.state.selectedCountryCode, tempDate.getFullYear());
    }
    this.setState({ startDay: tempDate });
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
    this.getHolidays(value, this.state.startDay.getFullYear());
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

  render() {
    const { openList, value, repetitionItems, colorPicker, eventColor } = this.state;
    if (colorPicker) {
      console.log("colorpicked")
      return <ColorWheel updateColor={this.updateColor}/>
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
              <View style={styles.row}>
                <Text style={styles.header_text}>Create Event</Text>
              </View>
              <View style={styles.row}>
              <TouchableOpacity
                onPress={() => this.setState({colorPicker: true})}
              >
                <View style={{paddingTop:5, paddingRight:15}}>
                  <Icon name="square" size={40} color={eventColor} />
                </View>
              </TouchableOpacity>
              <TextInput 
                style={styles.titleInputStyle}
                placeholder="Add title"
                placeholderTextColor="#8b9cb5"
              >
              </TextInput>
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
                  ></TextInput>
                </View>
              </View>
              <View style={styles.row}>
                <View style={{ flex: 1, paddingTop: 10 }}>
                  <Icon name="repeat" size={20} color="#2F4858" />
                </View>
                <View style={{flex:8}}>
                {/*dropdown selection does not work :(*/}
                <DropDownPicker
                    open={openList}
                    value={value}
                    items={repetitionItems}
                    placeholder={value}
                    setValue={this.setValue}
                    setItems={this.setItems}
                    onPress={this.setOpen}
                  />
                </View>
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
                  Start
                </Text>
                <DateTimePicker
                  style={{ margin: 5 }}
                  mode="date"
                  value={new Date()}
                />
                <DateTimePicker
                  style={{ margin: 5 }}
                  mode="time"
                  value={new Date()}
                />
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
                  style={{ margin: 5 }}
                  mode="date"
                  value={new Date()}
                />
                <DateTimePicker
                  style={{ margin: 5 }}
                  mode="time"
                  value={new Date()}
                />
              </View>
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
        {/* Month Header Bar */}
        <View style={styles.monthHeaderContainer}>
          <IconButton
            onPress={this.goPrevWeek}
            icon={(props) => <FeatherIcon name="arrow-left" {...props} />}
          />
          <Text style={{ fontSize: 20 }}>
            {MonthName[this.state.startDay.getMonth()]}
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
                    startDay={this.state.startDay}
                  />
                  <TopHeaderDays
                    day={1}
                    holidays={this.state.holidays}
                    startDay={this.state.startDay}
                  />
                  <TopHeaderDays
                    day={2}
                    holidays={this.state.holidays}
                    startDay={this.state.startDay}
                  />
                  <TopHeaderDays
                    day={3}
                    holidays={this.state.holidays}
                    startDay={this.state.startDay}
                  />
                  <TopHeaderDays
                    day={4}
                    holidays={this.state.holidays}
                    startDay={this.state.startDay}
                  />
                  <TopHeaderDays
                    day={5}
                    holidays={this.state.holidays}
                    startDay={this.state.startDay}
                  />
                  <TopHeaderDays
                    day={6}
                    holidays={this.state.holidays}
                    startDay={this.state.startDay}
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
