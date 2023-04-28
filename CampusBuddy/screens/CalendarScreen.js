import React, { Component, useContext } from "react";
import { readString } from "react-native-csv";
import {
  StyleSheet,
  Button,
  View,
  Text,
  ScrollView,
  FlatList,
  Alert,
  Linking,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions,
  Modal,
  Animated,
  TextInput,
  Pressable,
  Platform,
} from "react-native";
import CheckBox from "@react-native-community/checkbox";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import DateTimePicker from "@react-native-community/datetimepicker";
import { ColorWheel } from "../components/ui/ColorWheel";
import { Colors } from "../constants/colors";
import * as DocumentPicker from "expo-document-picker";
import Icon from "react-native-vector-icons/FontAwesome";
import Octicons from "react-native-vector-icons/Octicons";
import { genTimeBlock } from "react-native-timetable";
import {
  addSchedule,
  addEvent,
  to_request,
  addPoints,
  addRepeatingEvent,
  getUserRecurringEvents,
  addBoardData,
} from "../firebaseConfig";
import {
  auth,
  db,
  userSchedule,
  getUserEvents,
  updateEventField,
} from "../firebaseConfig";
import EventItem from "../components/ui/EventItem";
import { even, IconButton } from "@react-native-material/core";
import TopHeaderDays from "../components/ui/TopHeaderDays";
import {
  doc,
  onSnapshot,
  updateDoc,
  getDoc,
  arrayRemove,
  arrayUnion,
} from "firebase/firestore";
import {
  EventCategory,
  EventCategoryColors,
  defaultLocation,
  defaultTitle,
} from "../constants/eventCategory";
import { CalendarViewType } from "../constants/calendarViewType";
import HolidaySettingModal from "../components/ui/HolidaySettingModal";
import CalendarColorModal from "../components/ui/CalendarColorModal";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { SafeAreaView, useSafeAreaFrame } from "react-native-safe-area-context";
import MonthViewItem from "../components/MonthViewItem";
import { Dropdown, MultiSelect } from "react-native-element-dropdown";
import AntDesign from "react-native-vector-icons/AntDesign";
import {
  getMonthName,
  getWeekDayName,
  isOnSameDate,
  JSClock,
  jsClockToDate,
  jsDateToDate,
  JSGetDate,
} from "../helperFunctions/dateFunctions";
import EventViewInRow from "../components/ui/EventViewInRow";
import AthleticEventData from "../helperFunctions/csvjson.json";
//import { createAppContainer } from "react-navigation";
import CompareScreen from "../screens/CompareScreen";
import uuid from "react-native-uuid";

import ThemeContext from "../components/ui/ThemeContext";
import themeCon from "../components/ui/theme";
import RadioButton from "../components/ui/RadioButton";
import { AudienceLevelType } from "../constants/AudienceLevelType";
import { EventRepetitionType } from "../constants/EventRepetitionType";
import EventRepetitionDetailWeekly from "../components/ui/EventRepetition_Weekly";
import EventRepetitionDetailDaily from "../components/ui/EventRepetition_Daily";

const leftHeaderWidth = 50;
const topHeaderHeight = 60;
const dailyWidth = (Dimensions.get("window").width - leftHeaderWidth) / 3;
const dailyHeight = Dimensions.get("window").height / 10;

const data = [
  {
    label: EventRepetitionType.NEVER.label,
    value: EventRepetitionType.NEVER.value,
  },
  // {
  //   label: EventRepetitionType.DAILY.label,
  //   value: EventRepetitionType.DAILY.value,
  // },
  {
    label: EventRepetitionType.WEEKLY.label,
    value: EventRepetitionType.WEEKLY.value,
  },
];
const categories = [
  {
    label: EventCategory.SPORTS,
    value: EventCategory.SPORTS,
  },
  {
    label: EventCategory.SCHOOLCOURSE,
    value: EventCategory.SCHOOLCOURSE,
  },
  {
    label: EventCategory.ARTS,
    value: EventCategory.ARTS,
  },
  {
    label: EventCategory.CAREER,
    value: EventCategory.CAREER,
  },
  {
    label: EventCategory.SOCIAL,
    value: EventCategory.SOCIAL,
  },
  {
    label: EventCategory.EVENT,
    value: EventCategory.EVENT,
  },
  // {
  //   label: EventCategory.GROUP,
  //   value: EventCategory.GROUP,
  // }
];
const repetitionHasEndData = [
  {
    label: "Forever",
    value: 0,
  },
  {
    label: "Until",
    value: 1,
  },
];

export default class App extends Component {
  static contextType = ThemeContext;

  constructor(props) {
    super(props);

    this.numOfDays = 7;
    this.pivotDate = genTimeBlock("mon");

    this.svRef = React.createRef();

    this.scrollPosition = new Animated.Value(0);
    this.scrollEvent = Animated.event(
      [{ nativeEvent: { contentOffset: { y: this.scrollPosition } } }],
      { useNativeDriver: false }
    );

    this.state = {
      visible: false,
      calendarUIVisibilityFilter: {
        listEvents: true,
        athleticEvents: false,
        calendarEvents: true,
        groupEvents: false,
      },
      list: [],
      calendarEventList: [],
      recurringEventList: [],
      recurringEventOverwriteList: [],
      athleticEventList: [],
      totalCalendarList: [],
      midterms: [],
      holidays: [],
      testlist: [],
      holidayCountryList: [],
      selectedList: [],
      selectedCountryCode: "",
      createEventVisible: false,
      holidaySettingVisible: false,
      compareScheduleVisible: false,
      calendarColorVisible: false,
      title: "",
      location: "",
      description: "",
      audienceType: [
        {
          id: 1,
          value: AudienceLevelType.PUBLIC.value,
          name: AudienceLevelType.PUBLIC.name,
          selected: true,
        },
        {
          id: 2,
          value: AudienceLevelType.FRIENDS.value,
          name: AudienceLevelType.FRIENDS.name,
          selected: false,
        },
        {
          id: 3,
          value: AudienceLevelType.PRIVATE.value,
          name: AudienceLevelType.PRIVATE.name,
          selected: false,
        },
      ],
      selectPrivacy: false, //for multiple selection modal
      selectCategory: false, //for multiple selection modal
      colorPicker: false,
      eventColor: "#8b9cb5",
      value: null,

      eventRepetition: EventRepetitionType.NEVER.value,
      eventRepeatCount: "1",
      //For recurring weekly event
      dayOfTheWeekSelected: [
        { label: "Sun", value: 0, isSelected: false },
        { label: "Mon", value: 1, isSelected: false },
        { label: "Tue", value: 2, isSelected: false },
        { label: "Wed", value: 3, isSelected: false },
        { label: "Thu", value: 4, isSelected: false },
        { label: "Fri", value: 5, isSelected: false },
        { label: "Sat", value: 6, isSelected: false },
      ],

      eventDateTimeMode: "date",
      eventStartDateTimeShow: false,
      eventStartDateTime: new Date(),
      eventEndDateTimeShow: false,
      eventEndDateTime: new Date(),

      repetitionHasEndValue: 0,
      eventRepeatDateShow: false,
      eventRepeatDate: new Date(),

      selected: [],
      searched: [],
      friend_list: [],
      points: 0,
      // This is the starting date for the current calendar UI.
      weekViewStartDate: new Date(),
      currentDate: new Date(), // This is the selected date
      monthViewData: [],
      calendarView: CalendarViewType.WEEK, //On click, go above a level. Once date is clicked, go into week view.
      eventMandatory: false,
      selectedCategory: EventCategory.EVENT,
    };
  }
  getEvents = async () => {
    // Getting schedules from database
    const res = await userSchedule(auth.currentUser?.uid);
    const result = [];
    const eventResult = [];

    if (res != null) {
      /*res["things"].map((element) => {
         const sp = element.data.split(",");
         const temp = {
           category: EventCategory.SCHOOLCOURSE,
           title: sp[3],
           startTime: new Date(sp[2]),
           endTime: new Date(sp[0]),
           location: sp[1],
         };
         result.push(temp);
       });*/
      for (let i = 0; i < res["classes"].length; i++) {
        const temp = {
          category: EventCategory.SCHOOLCOURSE,
          title: res["classes"][i]["class"]["title"],
          startTime: new Date(
            res["classes"][i]["class"]["startTime"].seconds * 1000
          ), //multiply 1000 since Javascript uses milliseconds. Timestamp to date.
          endTime: new Date(
            res["classes"][i]["class"]["endTime"].seconds * 1000
          ),
          location: res["classes"][i]["class"]["location"],
          color:
            res["classes"][i]["class"]["color"] == null
              ? "#D1FF96"
              : res["classes"][i]["class"]["color"],
          id: res["classes"][i]["id"],
        };
        result.push(temp);
      }
    }

    this.setState({ list: result });

    // Getting events from database
    const events = await getUserEvents(auth.currentUser?.uid);
    if (events != null && events["event"] != undefined) {
      for (let i = 0; i < events["event"].length; i++) {
        const temp = {
          category: events["event"][i]["details"]["category"],
          title: events["event"][i]["details"]["title"],
          startTime: new Date(
            events["event"][i]["details"]["startTime"].seconds * 1000
          ), //multiply 1000 since Javascript uses milliseconds. Timestamp to date.
          endTime: new Date(
            events["event"][i]["details"]["endTime"].seconds * 1000
          ),
          location: events["event"][i]["details"]["location"],
          description: events["event"][i]["details"]["description"],
          color: events["event"][i]["details"]["color"],
          id: events["event"][i]["id"],
          eventMandatory: events["event"][i]["details"]["eventMandatory"],
          audienceLevel: events["event"][i]["details"]["audienceLevel"],
        };
        eventResult.push(temp);
      }
    }
    this.checkList(eventResult); //Checks for events that go over multiple days and corrects it
    this.combineAllListsForCalendar();
  };

  async componentDidMount() {
    console.log(Object.values(EventCategory));
    //Get the athletic events
    this.getAthleticEvents();
    //Set the calendar UI start date
    let tempDate = new Date();
    tempDate.setDate(tempDate.getDate() - tempDate.getDay());
    this.setState({ weekViewStartDate: tempDate });

    //Set month view calendar UI with the start date and store in monthViewData
    this.createMonthViewData(tempDate);

    // Get schedule and regular events from database
    this.getEvents();

    // Getting recurring events from database
    // recurringEventList
    const recurringEventResult = [];
    const recurringEventOverwriteResult = [];

    onSnapshot(doc(db, "recurring_events", auth.currentUser.uid), (doc) => {
      let recurringEvents = doc.data();
      if (recurringEvents != null && recurringEvents["event"] != undefined) {
        recurringEventResult.length = 0;
        for (let i = 0; i < recurringEvents["event"].length; i++) {
          const temp = {
            category: EventCategory.EVENT,
            title: recurringEvents["event"][i]["details"]["title"],
            startTime: new Date(
              recurringEvents["event"][i]["details"]["startTime"].seconds * 1000
            ), //multiply 1000 since Javascript uses milliseconds. Timestamp to date.
            endTime: new Date(
              recurringEvents["event"][i]["details"]["endTime"].seconds * 1000
            ),
            location: recurringEvents["event"][i]["details"]["location"],
            description: recurringEvents["event"][i]["details"]["description"],
            color: recurringEvents["event"][i]["details"]["color"],
            id: recurringEvents["event"][i]["id"],
            eventMandatory:
              recurringEvents["event"][i]["details"]["eventMandatory"],
            audienceLevel:
              recurringEvents["event"][i]["details"]["audienceLevel"],
            eventRepetition:
              recurringEvents["event"][i]["details"]["repetitionPattern"],
            eventRepetitionCount:
              recurringEvents["event"][i]["details"]["repetitionValue"],
            repetitionHasEndValue:
              recurringEvents["event"][i]["details"][
                "repetitionHasEndDateValue"
              ],
            eventRepeatEndDate: new Date(
              recurringEvents["event"][i]["details"]["repetitionEndDate"]
                .seconds * 1000
            ),
            dayOfTheWeekSelected:
              recurringEvents["event"][i]["details"]["repetitionDays"],
          };
          recurringEventResult.push(temp);
        }
      }

      if (
        recurringEvents != null &&
        recurringEvents["cancelRecurringEvent"] != undefined
      ) {
        recurringEventOverwriteResult.length = 0;
        for (
          let i = 0;
          i < recurringEvents["cancelRecurringEvent"].length;
          i++
        ) {
          let item = recurringEvents["cancelRecurringEvent"][i];

          const temp = {
            eventId: item.eventId,
            overwriteDate: new Date(item.overwriteDate.seconds * 1000),
          };
          recurringEventOverwriteResult.push(temp);
        }
      }
      this.setState({ recurringEventList: recurringEventResult });
      this.setState({
        recurringEventOverwriteList: recurringEventOverwriteResult,
      });
    });

    this.combineAllListsForCalendar(); // Combine list, calendarEventList, and athleticEventsList into one list "totalList"

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
    const friends = doc(db, "friend_list", auth.currentUser?.email);
    onSnapshot(friends, (doc) => {
      this.setState({
        friend_list: [...doc.data()["favorite"], ...doc.data()["friends"]],
        searched: [...doc.data()["favorite"], ...doc.data()["friends"]],
      });
    });
  }

  //Format event list so it works with the calendar view.
  //TODO need to fix event contents
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

    this.setState({ calendarEventList: result });
    this.applyEventDataToMonthViewData();
  };

  combineAllListsForCalendar = () => {
    let tempTotal = [];
    this.state.list.map((item) => {
      tempTotal.push(item);
    });
    this.state.calendarEventList.map((item) => {
      tempTotal.push(item);
    });
    this.state.athleticEventList.map((item) => {
      tempTotal.push(item);
    });
    this.setState({ totalCalendarList: tempTotal });
  };

  applyEventDataToMonthViewData = (monthData = this.state.monthViewData) => {
    let eventList = this.state.calendarEventList;
    let currDate = this.state.weekViewStartDate;
    this.setState({ monthViewData: [] });
    let temp = [...monthData];

    for (let i = 0; i < eventList.length; i++) {
      let currEvent = eventList[i];

      if (
        currEvent.startTime.getFullYear() == currDate.getFullYear() &&
        currEvent.startTime.getMonth() == currDate.getMonth()
      ) {
        let index = temp.findIndex(
          (obj) => obj.isThisMonth && obj.date == currEvent.startTime.getDate()
        );
        temp[index].hasEvent = true;
      }
    }
    this.setState({ monthViewData: temp });
  };

  changeColor = async (id, category) => {
    if (category == EventCategory.SCHOOLCOURSE) {
      console.log("school");
      const userDocRef = doc(db, "schedule", auth.currentUser.uid);
      const res = await userSchedule(auth.currentUser?.uid);
      console.log(res);
      for (let i = 0; i < res["classes"].length; i++) {
        if (res["classes"][i]["id"] == id) {
          let tempItem = res["classes"][i];
          tempItem.class.color = this.state.eventColor;
          tempItem.id = uuid.v4();
          await this.handleEventCompletion(category, id, false);
          await updateDoc(userDocRef, { classes: arrayUnion(tempItem) })
            .then(() => {
              console.log("Successfully updated class event color.");
            })
            .catch((error) => {
              console.error("Error updating class event color", error);
            });
        }
      }
    } else {
      console.log("event");
      const userDocRef = doc(db, "events", auth.currentUser.uid);
      const res = await getUserEvents(auth.currentUser?.uid);
      for (let i = 0; i < res["event"].length; i++) {
        if (res["event"][i]["id"] == id) {
          let tempItem = res["event"][i];
          tempItem.details.color = this.state.eventColor;
          tempItem.id = uuid.v4();
          await this.handleEventCompletion(category, id, false);
          await updateDoc(userDocRef, { event: arrayUnion(tempItem) })
            .then(() => {
              console.log("Successfully updated class event color.");
            })
            .catch((error) => {
              console.error("Error updating class event color", error);
            });
        }
      }
    }
  };

  handleMultipleSelectedChange = async (option, newValue) => {
    console.log(option);
    switch (option) {
      case "delete":
        for (let i = 0; i < this.state.selectedList.length; i++) {
          console.log("deleting");
          await this.handleEventCompletion(
            this.state.selectedList[i][1],
            this.state.selectedList[i][0],
            false
          );
        }
        this.setState({ selectedList: [] });
        this.getEvents();
        break;
      case "color":
        this.setState({ colorPicker: true });
        break;
      case "category":
        for (let i = 0; i < this.state.selectedList.length; i++) {
          await updateEventField(
            auth.currentUser.uid,
            "category",
            this.state.selectedList[i][0],
            newValue
          );
        }
        this.setState({ selectedList: [] });
        this.getEvents();
      case "privacy":
        for (let i = 0; i < this.state.selectedList.length; i++) {
          await updateEventField(
            auth.currentUser.uid,
            "privacy",
            this.state.selectedList[i][0],
            newValue
          );
        }
        this.setState({ selectedList: [] });
        this.getEvents();
        break;
      default:
        alert("Invalid option");
    }
  };
  handleEventRepetitionCount = (value) => {
    if (value > 6) {
      alert("Need to be less than 7");
    } else {
      this.setState({ eventRepeatCount: value });
    }
  };

  toggleDayOfTheWeekSelected = (value) => {
    let tempDayOfTheWeekSelected = [...this.state.dayOfTheWeekSelected];

    tempDayOfTheWeekSelected[value].isSelected =
      !tempDayOfTheWeekSelected[value].isSelected;

    this.setState({ dayOfTheWeekSelected: tempDayOfTheWeekSelected });
  };

  submitEvent = (eventColor) => {
    if (
      this.location == undefined ||
      this.title == undefined ||
      this.location == "" ||
      this.title == ""
    ) {
      alert("Enter title and location for the event");
      this.setLocation("");
      this.setTitle("");
      this.setDescription("");
    } else {
      var eventSTime = new Date(
        this.state.eventStartDateTime.getFullYear(),
        this.state.eventStartDateTime.getMonth(),
        this.state.eventStartDateTime.getDate(),
        this.state.eventStartDateTime.getHours(),
        this.state.eventStartDateTime.getMinutes()
      );

      var eventETime = new Date(
        this.state.eventEndDateTime.getFullYear(),
        this.state.eventEndDateTime.getMonth(),
        this.state.eventEndDateTime.getDate(),
        this.state.eventEndDateTime.getHours(),
        this.state.eventEndDateTime.getMinutes()
      );

      if (eventSTime > eventETime) {
        alert("Invalid Time Frame");
        return;
      }

      let selectedAudienceLevel = "";
      for (let i in this.state.audienceType) {
        if (this.state.audienceType[i].selected) {
          selectedAudienceLevel = this.state.audienceType[i].value;
        }
      }

      const eventId = uuid.v4();
      console.log(this.state.eventRepetition, this.state.selectedCategory)
      switch (this.state.eventRepetition) {
        case 0:
          addEvent(
            auth.currentUser?.uid,
            this.title,
            eventSTime,
            eventETime,
            this.location,
            this.description,
            this.state.selectedCategory,
            this.points,
            eventColor,
            0,
            eventId,
            this.state.eventMandatory,
            selectedAudienceLevel
          );

          this.state.calendarEventList.push({
            category: this.state.selectedCategory,
            title: this.title,
            startTime: eventSTime,
            endTime: eventETime,
            location: this.location,
            description: this.description,
            color: eventColor,
            id: eventId,
            eventMandatory: this.state.eventMandatory,
            audienceLevel: selectedAudienceLevel,
          });
          this.state.totalCalendarList.push({
            category: this.state.selectedCategory,
            title: this.title,
            startTime: eventSTime,
            endTime: eventETime,
            location: this.location,
            description: this.description,
            color: eventColor,
            id: eventId,
            eventMandatory: this.state.eventMandatory,
            audienceLevel: selectedAudienceLevel,
          });

          addBoardData(auth.currentUser?.uid, this.points, EventCategory.EVENT);

          const message =
            this.state.selectedCategory +
            ";" +
            this.title +
            ";" +
            eventSTime.toString() +
            ";" +
            eventETime.toString() +
            ";" +
            this.location +
            ";" +
            this.description +
            ";" +
            eventColor.toString() +
            ";" +
            this.points.toString() +
            ";" +
            this.state.eventMandatory +
            ";" +
            selectedAudienceLevel;

          this.state.selected.map((email) => {
            to_request(auth.currentUser?.email, email, "event", message);
          });
          break;
        case 1:
          break;
        case 2:
          addRepeatingEvent(
            auth.currentUser?.uid,
            this.title,
            eventSTime,
            eventETime,
            this.location,
            this.description,
            this.state.selectedCategory,
            this.points,
            eventColor,
            this.state.eventRepetition,
            this.state.eventRepeatCount,
            this.state.repetitionHasEndValue,
            this.state.eventRepeatDate,
            this.state.dayOfTheWeekSelected,
            eventId,
            this.state.eventMandatory,
            selectedAudienceLevel
          );

          break;
        default:
          break;
      }

      this.setState({ selected: [] });
      this.setState({ eventStartDateTime: new Date() });
      this.setState({ eventEndDateTime: new Date() });

      //reset Audience Type value to default public
      let updatedState = this.state.audienceType.map((isLikedItem) =>
        isLikedItem.value === AudienceLevelType.PUBLIC.value
          ? { ...isLikedItem, selected: true }
          : { ...isLikedItem, selected: false }
      );
      this.setState({ audienceType: updatedState });

      this.setLocation("");
      this.setDescription("");
      this.setTitle("");

      //reset values for recurrence event
      this.setState({ eventRepetition: EventRepetitionType.NEVER.value });
      this.setState({ eventRepeatCount: "1" });
      this.setState({
        dayOfTheWeekSelected: [
          { label: "Sun", value: 0, isSelected: false },
          { label: "Mon", value: 1, isSelected: false },
          { label: "Tue", value: 2, isSelected: false },
          { label: "Wed", value: 3, isSelected: false },
          { label: "Thu", value: 4, isSelected: false },
          { label: "Fri", value: 5, isSelected: false },
          { label: "Sat", value: 6, isSelected: false },
        ],
      });
      this.setState({ repetitionHasEndValue: 0 });
    }
  };
  setTitle = (title) => {
    this.title = title;
  };

  setLocation = (location) => {
    this.location = location;
  };

  setDescription = (text) => {
    if (text.length > 256) {
      alert("Description is too long.\nWord limit is 256 characters");
      text = text.slice(0, 256);
    }
    this.description = text;
    this.setState({ description: text });
  };

  setPoints = (points) => {
    this.points = points;
  };
  scrollViewRef = (ref) => {
    this.timetableRef = ref;
  };

  //render method for MutiselectBox on "Add event" panel
  renderDataItem = (item) => {
    return (
      <View style={styles.item2}>
        <Text style={styles.selectedTextStyle}>{item.user}</Text>
        {this.state.selected.indexOf(item.user) > -1 ? (
          <AntDesign style={styles.icon} color="black" name="check" size={20} />
        ) : (
          <AntDesign style={styles.icon} color="black" name="plus" size={20} />
        )}
      </View>
    );
  };

  //search function for Mutiselect Box
  filter_friends = (text) => {
    const updatedData = this.state.friend_list.filter((item) => {
      return item.user.includes(text);
    });
    if (updatedData.length > 0) {
      this.setState({ searched: updatedData });
    }
  };

  onEventPress = (evt) => {
    Alert.alert("onEventPress", JSON.stringify(evt));
  };

  openCreateEvent = () => {
    this.setState({ visible: false });
    this.setState({ createEventVisible: true });
  };

  openCompareScreen = () => {
    this.setState({ visible: false });
    this.setState({ compareScheduleVisible: true });
  };

  setCalendarColor = () => {
    this.setState({ calendarColorVisible: true });
  };

  updateColor = async (color) => {
    this.setState({ eventColor: color });
    this.setState({ colorPicker: false });

    //will only run if multiple events are selected to change color
    if (this.state.selectedList.length > 0) {
      for (let i = 0; i < this.state.selectedList.length; i++) {
        await this.changeColor(
          this.state.selectedList[i][0],
          this.state.selectedList[i][1]
        );
      }
      this.setState({ selectedList: [] });
      this.getEvents(); //refresh calendar ui
    }
  };

  setHolidaySettings = () => {
    this.setState({ visible: false });
    this.getCountries();
    this.setState({ holidaySettingVisible: true });
  };

  clickHandler = () => {
    this.setState({ visible: true });
  };

  handleCheckboxChange = (event) => {
    this.setState({ eventMandatory: event.target.checked });
  };

  //START Holiday Setting Modal Component Functions
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
    // this.getHolidays(value, this.state.weekViewStartDate.getFullYear());
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

  closeHolidaySettingModal = () => {
    this.setState({ holidaySettingVisible: false });
  };

  selectCountryHolidaySettingModal = (country) => {
    this.setState({ selectedCountry: country });
  };

  //END Holiday Setting Modal Component Functions

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
                  color: EventCategoryColors.SCHOOLCOURSE,
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
                  color: EventCategoryColors.SCHOOLCOURSE,
                });
                //Wednesday
              } else if (product["Day Of Week"][i] == "W") {
                this.state.list.push({
                  title: product["Name"] + " (" + product["Type"] + ")",
                  startTime: genTimeBlock("WED", start, start_min),
                  endTime: genTimeBlock("WED", end, end_min),
                  location: product["Location"],
                  color: EventCategoryColors.SCHOOLCOURSE,
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
                  color: EventCategoryColors.SCHOOLCOURSE,
                });
                //Friday
              } else if (product["Day Of Week"][i] == "F") {
                this.state.list.push({
                  title: product["Name"] + " (" + product["Type"] + ")",
                  startTime: genTimeBlock("FRI", start, start_min),
                  endTime: genTimeBlock("FRI", end, end_min),
                  location: product["Location"],
                  color: EventCategoryColors.SCHOOLCOURSE,
                });
                //Saterday
              } else if (product["Day Of Week"][i] == "S") {
                this.state.list.push({
                  title: product["Name"] + " (" + product["Type"] + ")",
                  startTime: genTimeBlock("SAT", start, start_min),
                  endTime: genTimeBlock("SAT", end, end_min),
                  location: product["Location"],
                  color: EventCategoryColors.SCHOOLCOURSE,
                });
                //Sunday
              } else if (product["Day Of Week"][i] == "U") {
                this.state.list.push({
                  title: product["Name"] + " (" + product["Type"] + ")",
                  startTime: genTimeBlock("SUN", start, start_min),
                  endTime: genTimeBlock("SUN", end, end_min),
                  location: product["Location"],
                  color: EventCategoryColors.SCHOOLCOURSE,
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

        /* for (let i = 0; i < uniqueArray.length; i++) {
          uniqueArray[i].id=uuid.v4()
        }*/
        this.setState({ list: uniqueArray });
        this.setState({ visible: !this.state.visible });
        addSchedule(auth.currentUser?.uid, this.state.list);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  getAthleticEvents = () => {
    let sportEventList = [];
    const dataLength = AthleticEventData.length;
    for (let i = 0; i < dataLength; i++) {
      let currItem = AthleticEventData[i];

      const title = currItem.Event;
      const sportType = currItem.Category;
      const description = currItem.Description;
      const location = currItem.Location;
      const startTime = jsDateToDate(currItem["Start Date"]);

      let st = jsClockToDate(currItem["Start Time"]);
      if (st != null) {
        startTime.setHours(jsClockToDate(currItem["Start Time"]).getHours());
        startTime.setMinutes(
          jsClockToDate(currItem["Start Time"]).getMinutes()
        );
      } else {
        continue;
      }

      const endTime = jsDateToDate(currItem["End Date"]);
      let et = jsClockToDate(currItem["End Time"]);
      if (et != null) {
        endTime.setHours(jsClockToDate(currItem["End Time"]).getHours());
        endTime.setMinutes(jsClockToDate(currItem["End Time"]).getMinutes());
      } else {
        continue;
      }

      const sportsEvent = {
        category: EventCategory.SPORTS,
        title,
        sportType,
        description,
        startTime,
        endTime,
        location,
        color: Colors.grey,
      };
      sportEventList.push(sportsEvent);
    }
    this.setState({ athleticEventList: sportEventList });
  };

  //navigate through calendar ui
  goPrevDay = () => {
    let currYear = this.state.currentDate.getFullYear();

    let tempCurr = this.state.currentDate;
    tempCurr.setDate(tempCurr.getDate() - 1);
    this.setState({ currDate: tempCurr });

    if (tempCurr.getDay() == 6) {
      //If new date is saturday, meaning it's a different week
      let tempDate = this.state.weekViewStartDate;
      tempDate.setDate(tempDate.getDate() - 7);

      if (
        tempDate.getFullYear() != currYear &&
        this.state.selectedCountryCode != null &&
        this.state.selectedCountryCode.length > 0
      ) {
        this.getHolidays(
          this.state.selectedCountryCode,
          tempDate.getFullYear()
        );
      }
      this.setState({ weekViewStartDate: tempDate });
    }
  };

  goNextDay = () => {
    let currYear = this.state.currentDate.getFullYear();

    let tempCurr = this.state.currentDate;
    tempCurr.setDate(tempCurr.getDate() + 1);
    this.setState({ currDate: tempCurr });

    if (tempCurr.getDay() == 0) {
      //If new date is saturday, meaning it's a different week
      let tempDate = this.state.weekViewStartDate;
      tempDate.setDate(tempDate.getDate() + 7);

      if (
        tempDate.getFullYear() != currYear &&
        this.state.selectedCountryCode != null &&
        this.state.selectedCountryCode.length > 0
      ) {
        this.getHolidays(
          this.state.selectedCountryCode,
          tempDate.getFullYear()
        );
      }
      this.setState({ weekViewStartDate: tempDate });
    }
  };

  goPrevWeek = () => {
    let currYear = this.state.weekViewStartDate.getFullYear();

    let tempCurr = this.state.currentDate;
    tempCurr.setDate(tempCurr.getDate() - 7);
    this.setState({ currDate: tempCurr });

    let tempDate = this.state.weekViewStartDate;
    tempDate.setDate(tempDate.getDate() - 7);

    if (
      tempDate.getFullYear() != currYear &&
      this.state.selectedCountryCode != null &&
      this.state.selectedCountryCode.length > 0
    ) {
      this.getHolidays(this.state.selectedCountryCode, tempDate.getFullYear());
    }
    this.setState({ weekViewStartDate: tempDate });
  };
  goNextWeek = () => {
    let currYear = this.state.weekViewStartDate.getFullYear();

    let tempCurr = this.state.currentDate;
    tempCurr.setDate(tempCurr.getDate() + 7);
    this.setState({ currDate: tempCurr });

    let tempDate = this.state.weekViewStartDate;
    tempDate.setDate(tempDate.getDate() + 7);
    if (
      tempDate.getFullYear() != currYear &&
      this.state.selectedCountryCode != null &&
      this.state.selectedCountryCode.length > 0
    ) {
      this.getHolidays(this.state.selectedCountryCode, tempDate.getFullYear());
    }
    this.setState({ weekViewStartDate: tempDate });
  };
  //navigate through calendar ui
  goPrevMonth = () => {
    let currYear = this.state.weekViewStartDate.getFullYear();

    let tempCurr = this.state.currentDate;
    tempCurr.setMonth(tempCurr.getMonth() - 1);
    this.setState({ currDate: tempCurr });

    let tempDate = this.state.weekViewStartDate;
    tempDate.setMonth(tempDate.getMonth() - 1);

    if (
      tempDate.getFullYear() != currYear &&
      this.state.selectedCountryCode != null &&
      this.state.selectedCountryCode.length > 0
    ) {
      this.getHolidays(this.state.selectedCountryCode, tempDate.getFullYear());
    }
    this.setState({ weekViewStartDate: tempDate });
    this.createMonthViewData(tempDate);
  };
  goNextMonth = () => {
    let currYear = this.state.weekViewStartDate.getFullYear();

    let tempCurr = this.state.currentDate;
    tempCurr.setMonth(tempCurr.getMonth() + 1);
    this.setState({ currDate: tempCurr });

    let tempDate = this.state.weekViewStartDate;
    tempDate.setMonth(tempDate.getMonth() + 1);
    if (
      tempDate.getFullYear() != currYear &&
      this.state.selectedCountryCode != null &&
      this.state.selectedCountryCode.length > 0
    ) {
      this.getHolidays(this.state.selectedCountryCode, tempDate.getFullYear());
    }
    this.setState({ weekViewStartDate: tempDate });
    this.createMonthViewData(tempDate);
  };

  goToday = () => {
    this.setState({ currentDate: new Date() });
    let tempDate = new Date();
    tempDate.setDate(tempDate.getDate() - tempDate.getDay());
    if (
      this.state.selectedCountryCode != null &&
      this.state.selectedCountryCode.length > 0
    ) {
      this.getHolidays(this.state.selectedCountryCode, tempDate.getFullYear());
    }
    this.setState({ weekViewStartDate: tempDate });
    this.createMonthViewData(tempDate);
  };

  createMonthViewData = (startDate) => {
    let prevMonthDate = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      0
    );
    let numDaysInPrevMonth = prevMonthDate.getDate();
    let monthDate = new Date(
      startDate.getFullYear(),
      startDate.getMonth() + 1,
      0
    );
    let monthData = [];
    let numDaysInMonth = monthDate.getDate();
    monthDate.setDate(1);
    for (let i = 0; i < 42; i++) {
      if (i < monthDate.getDay()) {
        const temp = {
          date: numDaysInPrevMonth - monthDate.getDay() + i + 1,
          hasEvent: false,
          isThisMonth: false,
        };
        // monthData.push(temp);
        monthData = [...monthData, temp];
      } else {
        if (i < monthDate.getDay() + numDaysInMonth) {
          const temp = {
            date: i - monthDate.getDay() + 1,
            hasEvent: false,
            isThisMonth: true,
          };

          // monthData.push(temp);
          monthData = [...monthData, temp];
        } else {
          const temp = {
            date: i - numDaysInMonth - monthDate.getDay() + 1,
            hasEvent: false,
            isThisMonth: false,
          };
          // monthData.push(temp);
          monthData = [...monthData, temp];
        }
      }
    }
    this.applyEventDataToMonthViewData(monthData);
    // this.setState({ monthViewData: monthData });
  };

  showModeForEventStart = (currentMode) => {
    if (Platform.OS === "android") {
      this.setState({ eventStartDateTimeShow: true });
      // for iOS, add a button that closes the picker
    }
    this.setState({ eventDateTimeMode: currentMode });
  };
  showModeForEventEnd = (currentMode) => {
    if (Platform.OS === "android") {
      this.setState({ eventEndDateTimeShow: true });
      // for iOS, add a button that closes the picker
    }
    this.setState({ eventDateTimeMode: currentMode });
  };

  showModeForEventRepeat = (currentMode) => {
    if (Platform.OS === "android") {
      this.setState({ eventRepeatDateShow: true });
      // for iOS, add a button that closes the picker
    }
    this.setState({ eventDateTimeMode: currentMode });
  };

  showStartDatePicker = () => {
    this.showModeForEventStart("date");
  };
  showStartTimePicker = () => {
    this.showModeForEventStart("time");
  };
  showEndDatePicker = () => {
    this.showModeForEventEnd("date");
  };
  showEndTimePicker = () => {
    this.showModeForEventEnd("time");
  };
  showRepeatDatePicker = () => {
    this.showModeForEventRepeat("date");
  };

  onEventStartDateTimeSelected = (event, value) => {
    this.setState({ eventStartDateTimeShow: false });
    this.setState({ eventStartDateTime: value });
  };

  onEventEndDateTimeSelected = (event, value) => {
    this.setState({ eventEndDateTimeShow: false });
    this.setState({ eventEndDateTime: value });
  };

  onEventRepeatDateSelected = (event, value) => {
    this.setState({ eventRepeatDateShow: false });
    this.setState({ eventRepeatDate: value });
  };

  sayHi = (e) => {
    console.log("HIIIIIIIIIIIIIIIIIIII");
  };
  scrollViewEventOne = (e) => {
    this.svRef.current.scrollTo({
      x: 0,
      y: e.nativeEvent.contentOffset.y,
      animated: true,
    });
  };

  scrollEvent = Animated.event(
    [{ nativeEvent: { contentOffset: { y: this.scrollPosition } } }],
    { useNativeDriver: false }
  );

  handleMultipleSelected = (selected, id, category) => {
    var newList = []; //must use new array otherwise calendar does not re-render because it doesn't recognize the state has changed
    if (selected) {
      this.state.selectedList.push([id, category]);
      newList = this.state.selectedList;
      this.setState({ selectedList: newList });
    } else {
      const removeIndex = this.state.selectedList.indexOf([id, category]);
      this.state.selectedList.splice(removeIndex, 1);
      newList = this.state.selectedList;
      this.setState({ selectedList: newList });
    }
    console.log(this.state.selectedList, this.state.selectedList.length);
  };

  handleEventCompletion = async (category, id, completePoints) => {
    console.log("category completed:", category)
    if (category == EventCategory.SCHOOLCOURSE) {
      const userDocRef = doc(db, "schedule", auth.currentUser.uid);
      const res = await userSchedule(auth.currentUser?.uid);
      for (let i = 0; i < res["classes"].length; i++) {
        if (res["classes"][i]["id"] == id) {
          await updateDoc(userDocRef, {
            classes: arrayRemove(res["classes"][i]),
          })
            .then(() => {
              console.log("Successfully removed class from schedule.");
            })
            .catch((error) => {
              console.error("Error removing class from schedule", error);
            });
          if (completePoints) {
            addPoints(auth.currentUser?.uid, "SCHOOLCOURSE", 10);
          }
        }
      }
    } else {
      const userDocRef = doc(db, "events", auth.currentUser.uid);
      const res = await getUserEvents(auth.currentUser?.uid);
      for (let i = 0; i < res["event"].length; i++) {
        if (res["event"][i]["id"] == id) {
          await updateDoc(userDocRef, { event: arrayRemove(res["event"][i]) })
            .then(() => {
              console.log("Successfully removed event from event list.");
            })
            .catch((error) => {
              console.error("Error removing event from event list", error);
            });
          if (completePoints) {
            console.log("CATEGORY", category)
            var category_name = "EVENT";
            switch (category) {
              case "School Course":
                category_name = "SCHOOLCOURSE";
                break;
              case "Sports Event":
                category_name = "SPORTS";
                break;
              case "Arts":
                category_name = "ARTS";
                break;
              case "Social":
                category_name = "SOCIAL";
                break;
              case "Career":
                category_name = "CAREER";
              default:
                break;
            }
            addPoints(
              auth.currentUser?.uid,
              category_name,
              parseInt(res["event"][i]["details"]["point_value"], 10)
            );
          }
        }
      }
    }
  };
  toggleCalendarView = () => {
    switch (this.state.calendarView) {
      case CalendarViewType.DAY:
        this.setState({ calendarView: CalendarViewType.WEEK });
        break;
      case CalendarViewType.WEEK:
        this.setState({ calendarView: CalendarViewType.MONTH });
        break;
      case CalendarViewType.MONTH:
        this.setState({ calendarView: CalendarViewType.DAY });
        break;
      default:
        console.error("Something Wrong with toggle calendar view");
        break;
    }
  };

  onRadioBtnClick = (item) => {
    let updatedState = this.state.audienceType.map((isLikedItem) =>
      isLikedItem.id === item.id
        ? { ...isLikedItem, selected: true }
        : { ...isLikedItem, selected: false }
    );
    this.setState({ audienceType: updatedState });
  };

  render() {
    const { navigate } = this.props.navigation;
    const { theme } = this.context;

    const {
      title,
      location,
      openList,
      repetitionItems,
      colorPicker,
      eventColor,
      weekViewStartDate: weekViewStartDate,
      repetition,
      openDate,
    } = this.state;

    if (colorPicker) {
      console.log("colorpicked");
      return <ColorWheel updateColor={this.updateColor} />;
    }
    return (
      <SafeAreaView
        style={[
          styles.box,
          { backgroundColor: themeCon[theme].calendarUIBackground },
        ]}
      >
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
              // backgroundColor: "rgba(0,0,0,0.5)",
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
                title="Export schedule"
                onPress={() => this.exportDocumentFile()}
              ></Button>
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
                title="Calendar theme"
                onPress={this.openCalendarColorModal}
              ></Button>
              <Button
                title="Compare schedule"
                onPress={() => {
                  navigate("CompareScreen");
                  this.setState({ visible: !this.state.visible });
                }}
              ></Button>
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
          animationType="fade"
          visible={this.state.createEventVisible}
          // visible={true}
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
              backgroundColor: "rgba(0,0,0,0.5)",
            }}
          >
            <View
              style={{
                backgroundColor: "white",
                marginHorizontal: 20,
                height: "60%",
                borderRadius: 10,
              }}
            >
              <ScrollView>
                <View
                  style={{
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <View style={styles.row}>
                    <TouchableOpacity
                      style={{
                        flex: 1,
                      }}
                      onPress={() =>
                        this.setState({ createEventVisible: false })
                      }
                    >
                      <View style={{ alignSelf: "flex-end" }}>
                        <Icon name="times" size={20} color="#2F4858" />
                      </View>
                    </TouchableOpacity>
                  </View>

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
                    <View
                      style={{
                        flex: 1,
                        borderWidth: 1,
                        borderColor: "#8b9cb5",
                      }}
                    >
                      <TextInput
                        style={{
                          fontSize: 20,
                          padding: 5,
                        }}
                        placeholder="Description"
                        placeholderTextColor="#8b9cb5"
                        onChangeText={(text) => this.setDescription(text)}
                        value={this.state.description}
                        maxLength={257}
                        multiline={true}
                      ></TextInput>
                    </View>
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

                  {/* <View style={styles.row}> */}
                  <View style={[styles.row, {}]}>
                    <Text
                      style={{
                        textAlign: "center",
                        color: "#2F4858",
                      }}
                    >
                      Points
                    </Text>
                    <TextInput
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
                      value={this.state.points}
                      defaultValue={0}
                      keyboardType="numeric"
                      onChangeText={(text) => this.setPoints(text)}
                    ></TextInput>
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
                      From
                    </Text>
                    <View>
                      {Platform.OS === "android" ? (
                        <View style={{ flexDirection: "row" }}>
                          <Pressable onPress={this.showStartDatePicker}>
                            <Text
                              style={{
                                backgroundColor: "#AAAAAA",
                                paddingHorizontal: 10,
                                paddingVertical: 6,
                                borderRadius: 5,
                                marginHorizontal: 4,
                              }}
                            >
                              {JSGetDate(this.state.eventStartDateTime)}
                            </Text>
                          </Pressable>
                          <Pressable onPress={this.showStartTimePicker}>
                            <Text
                              style={{
                                backgroundColor: "#AAAAAA",
                                paddingHorizontal: 10,
                                paddingVertical: 6,
                                borderRadius: 5,
                                marginHorizontal: 4,
                              }}
                            >
                              {JSClock(this.state.eventStartDateTime, false)}
                            </Text>
                          </Pressable>
                          {this.state.eventStartDateTimeShow && (
                            <DateTimePicker
                              testID="dateTimePicker"
                              value={this.state.eventStartDateTime}
                              mode={this.state.eventDateTimeMode}
                              is24Hour={false}
                              onChange={this.onEventStartDateTimeSelected}
                            />
                          )}
                        </View>
                      ) : (
                        <View style={{ flexDirection: "row" }}>
                          <DateTimePicker
                            testID="dateTimePicker"
                            value={this.state.eventStartDateTime}
                            mode={"date"}
                            is24Hour={true}
                            onChange={this.onEventStartDateTimeSelected}
                          />
                          <DateTimePicker
                            testID="dateTimePicker"
                            value={this.state.eventStartDateTime}
                            mode={"time"}
                            is24Hour={false}
                            onChange={this.onEventStartDateTimeSelected}
                          />
                        </View>
                      )}
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
                      To
                    </Text>
                    <View>
                      {Platform.OS === "android" ? (
                        <View style={{ flexDirection: "row" }}>
                          <Pressable onPress={this.showEndDatePicker}>
                            <Text
                              style={{
                                backgroundColor: "#AAAAAA",
                                paddingHorizontal: 10,
                                paddingVertical: 6,
                                borderRadius: 5,
                                marginHorizontal: 4,
                              }}
                            >
                              {JSGetDate(this.state.eventEndDateTime)}
                            </Text>
                          </Pressable>
                          <Pressable onPress={this.showEndTimePicker}>
                            <Text
                              style={{
                                backgroundColor: "#AAAAAA",
                                paddingHorizontal: 10,
                                paddingVertical: 6,
                                borderRadius: 5,
                                marginHorizontal: 4,
                              }}
                            >
                              {JSClock(this.state.eventEndDateTime, false)}
                            </Text>
                          </Pressable>
                          {this.state.eventEndDateTimeShow && (
                            <DateTimePicker
                              testID="dateTimePicker"
                              value={this.state.eventEndDateTime}
                              mode={this.state.eventDateTimeMode}
                              is24Hour={false}
                              onChange={this.onEventEndDateTimeSelected}
                            />
                          )}
                        </View>
                      ) : (
                        <View style={{ flexDirection: "row" }}>
                          <DateTimePicker
                            testID="dateTimePicker"
                            value={this.state.eventEndDateTime}
                            mode={"date"}
                            onChange={this.onEventEndDateTimeSelected}
                          />
                          <DateTimePicker
                            testID="dateTimePicker"
                            value={this.state.eventEndDateTime}
                            mode={"time"}
                            is24Hour={false}
                            onChange={this.onEventEndDateTimeSelected}
                          />
                        </View>
                      )}
                    </View>
                  </View>

                  <View
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      alignItems: "center",
                      marginHorizontal: 25,
                      marginVertical: 8,
                    }}
                  >
                    <View>
                      <Text>Repeat</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Dropdown
                        style={{
                          paddingLeft: 10,
                          marginHorizontal: 10,
                          height: 50,
                          borderBottomColor: "grey",
                          borderBottomWidth: 0.5,
                        }}
                        maxHeight={300}
                        labelField="label"
                        valueField="value"
                        placeholderStyle={{ fontSize: 16 }}
                        placeholder="Select item"
                        data={data}
                        value={this.state.eventRepetition}
                        onChange={(item) => {
                          this.setState({ eventRepetition: item.value });
                        }}
                      />
                    </View>
                  </View>
                  <View
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      alignItems: "center",
                      marginHorizontal: 25,
                      marginVertical: 8,
                    }}
                  >
                    <View>
                      <Text>Category</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Dropdown
                        style={{
                          paddingLeft: 10,
                          marginHorizontal: 10,
                          height: 50,
                          borderBottomColor: "grey",
                          borderBottomWidth: 0.5,
                        }}
                        maxHeight={200}
                        placeholderStyle={{ fontSize: 16 }}
                        placeholder="Select a Category"
                        labelField="label"
                        valueField="value"
                        data={categories}
                        value={this.state.selectedCategory}
                        onChange={(item) => {
                          this.setState({ selectedCategory: item.value });
                          if (this.title == "" || this.title == undefined) {
                            switch (item.value) {
                              case "School Course":
                                this.setTitle(defaultTitle.SCHOOLCOURSE);
                                break;
                              case "Sports Event":
                                this.setTitle(defaultTitle.SPORTS);
                                break;
                              case "Arts":
                                this.setTitle(defaultTitle.ARTS);
                                break;
                              case "Social":
                                this.setTitle(defaultTitle.SOCIAL);
                                break;
                              case "Career":
                                this.setTitle(defaultTitle.CAREER);
                                break;
                              default:
                                break;
                            }
                          }
                          if (
                            this.location == "" ||
                            this.location == undefined
                          ) {
                            switch (item.value) {
                              case "School Course":
                                this.setLocation(defaultLocation.SCHOOLCOURSE);
                                break;
                              case "Sports Event":
                                this.setLocation(defaultLocation.SPORTS);
                                break;
                              case "Arts":
                                this.setLocation(defaultLocation.ARTS);
                                break;
                              case "Social":
                                this.setLocation(defaultLocation.SOCIAL);
                                break;
                              case "Career":
                                this.setLocation(defaultLocation.CAREER);
                                break;
                              default:
                                break;
                            }
                          }
                        }}
                      />
                    </View>
                  </View>
                  {(() => {
                    switch (this.state.eventRepetition) {
                      case EventRepetitionType.NEVER.value:
                        return <View></View>;
                      // case EventRepetitionType.DAILY.value:
                      //   return (
                      //     <View style={[styles.row, {}]}>
                      //       <EventRepetitionDetailDaily
                      //         countVal={this.state.eventRepeatCount}
                      //         handleRepeatCount={
                      //           this.handleEventRepetitionCount
                      //         }
                      //         showDatePicker={this.showRepeatDatePicker}
                      //         eventRepeatDate={this.state.eventRepeatDate}
                      //         eventRepeatDateShow={
                      //           this.state.eventRepeatDateShow
                      //         }
                      //         eventRepeatMode={this.state.eventDateTimeMode}
                      //         handleOnDateRepeatSelect={
                      //           this.onEventRepeatDateSelected
                      //         }
                      //       />
                      //     </View>
                      //   );
                      case EventRepetitionType.WEEKLY.value:
                        return (
                          <View style={[styles.row, {}]}>
                            <EventRepetitionDetailWeekly
                              countVal={this.state.eventRepeatCount}
                              handleRepeatCount={
                                this.handleEventRepetitionCount
                              }
                              dayOfTheWeekSelected={
                                this.state.dayOfTheWeekSelected
                              }
                              toggleDayOfTheWeekSelected={
                                this.toggleDayOfTheWeekSelected
                              }
                              data={repetitionHasEndData}
                              repetitionDue={this.state.repetitionHasEndValue}
                              handleRepetitionHasEndValue={(value) => {
                                this.setState({ repetitionHasEndValue: value });
                              }}
                              showDatePicker={this.showRepeatDatePicker}
                              eventRepeatDate={this.state.eventRepeatDate}
                              eventRepeatDateShow={
                                this.state.eventRepeatDateShow
                              }
                              eventRepeatMode={this.state.eventDateTimeMode}
                              handleOnDateRepeatSelect={
                                this.onEventRepeatDateSelected
                              }
                            />
                          </View>
                        );

                      default:
                        return (
                          <View>
                            <Text>Something went wrong...!</Text>
                          </View>
                        );
                    }
                  })()}
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <BouncyCheckbox
                      isChecked={this.state.eventMandatory}
                      onPress={(isChecked) =>
                        this.setState({ eventMandatory: isChecked })
                      }
                    />
                    <Text>Mandatory</Text>
                  </View>

                  <View
                    style={{
                      flexDirection: "column",
                      width: "100%",
                      paddingVertical: 10,
                      paddingHorizontal: 25,
                      marginVertical: 10,
                    }}
                  >
                    <Text style={{ fontSize: 20, marginBottom: 8 }}>
                      Who can join?
                    </Text>
                    <View style={{ flexDirection: "row" }}>
                      {this.state.audienceType.map((item) => (
                        <RadioButton
                          onPress={() => this.onRadioBtnClick(item)}
                          selected={item.selected}
                          key={item.id}
                        >
                          {item.name}
                        </RadioButton>
                      ))}
                    </View>
                  </View>

                  <View style={[{ width: 300, margin: 10 }]}>
                    <MultiSelect
                      style={styles.dropdown}
                      placeholderStyle={styles.placeholderStyle}
                      selectedTextStyle={styles.selectedTextStyle}
                      inputSearchStyle={styles.inputSearchStyle}
                      iconStyle={styles.iconStyle}
                      data={this.state.searched}
                      valueField="user"
                      placeholder="Invite friends"
                      value={this.state.selected}
                      search
                      searchQuery={(text) => {
                        this.filter_friends(text);
                      }}
                      searchPlaceholder="Search..."
                      onChange={(item) => {
                        this.setState({ selected: item });
                      }}
                      renderItem={this.renderDataItem}
                      renderSelectedItem={(item, unSelect) => (
                        <TouchableOpacity
                          onPress={() => unSelect && unSelect(item)}
                        >
                          <View style={styles.selectedStyle}>
                            <Text style={styles.textSelectedStyle}>
                              {item.user}
                            </Text>
                            <AntDesign color="black" name="delete" size={17} />
                          </View>
                        </TouchableOpacity>
                      )}
                    />
                  </View>

                  <Button
                    title="Create new event"
                    onPress={() => {
                      this.submitEvent(eventColor),
                        this.setState({ createEventVisible: false });
                    }}
                  />
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

        <HolidaySettingModal
          holidaySettingVisible={this.state.holidaySettingVisible}
          holidayCountryList={this.state.holidayCountryList}
          selectedCountryCode={this.state.selectedCountryCode}
          selectedCountry={this.state.selectedCountry}
          closeHolidaySettingModal={this.closeHolidaySettingModal}
          selectCountryHolidaySettingModal={
            this.selectCountryHolidaySettingModal
          }
          storeData={this.storeData}
          removeData={this.removeData}
        />

        <CalendarColorModal
          calendarColorVisible={this.state.calendarColorVisible}
          closeCalendarColorModal={this.closeCalendarColorModal}
        />

        {/* Bottom tab bar hides calendar screen. TODO Need to fix this.*/}
        <View style={{ flex: 1, marginBottom: 15 }}>
          {/* Info Above the calendar times */}
          <View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                paddingHorizontal: 10,
              }}
            >
              <View
                style={{
                  flex: 1,
                  alignItems: "flex-start",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{ fontSize: 20, color: themeCon[theme].fontColor }}
                >
                  {this.state.calendarView == CalendarViewType.WEEK ||
                  this.state.calendarView == CalendarViewType.MONTH
                    ? getMonthName(this.state.weekViewStartDate.getMonth())
                    : getMonthName(this.state.currentDate.getMonth())}
                </Text>
                <Text
                  style={{ fontSize: 12, color: themeCon[theme].fontColor }}
                >
                  {this.state.weekViewStartDate.getFullYear()}
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
                <IconButton
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
                  <Text
                    style={{ fontSize: 15, color: themeCon[theme].fontColor }}
                  >
                    Today
                  </Text>
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
                      color: themeCon[theme].fontColor,
                    }}
                  >
                    {this.state.calendarView}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>

          <View
            style={{
              width: "100%",
              height: "100%",
              flexDirection: "column",
            }}
          >
            {(() => {
              switch (this.state.calendarView) {
                case CalendarViewType.WEEK:
                  return (
                    <View
                      style={{
                        flexDirection: "row",
                        flex: 1,
                      }}
                    >
                      <View>
                        <View
                          style={{
                            height: topHeaderHeight,
                          }}
                        />
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
                                  // color: themeCon[theme].fontColor,
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
                            holidays={this.state.holidays}
                            startDay={this.state.weekViewStartDate}
                            color={themeCon[theme].fontColor}
                          />

                          <ScrollView
                            style={{
                              width: "100%",
                              height: "100%",
                              backgroundColor:
                                themeCon[theme].calendarUIInnerBackground,
                            }}
                            horizontal={false}
                            nestedScrollEnabled
                            scrollEventThrottle={16}
                            onScroll={this.scrollViewEventOne}
                          >
                            <View
                              style={{
                                height: dailyHeight * 24,
                              }}
                            >
                              {this.state.totalCalendarList.map((event) => {
                                return makeVisible(
                                  this.state.weekViewStartDate,
                                  event,
                                  this.state.calendarUIVisibilityFilter
                                ) ? (
                                  <EventItem
                                    key={`EITEM-${1}-${event.id}-${
                                      event.startTime
                                    }`}
                                    navigation={this.props.navigation}
                                    weekviewStartDate={
                                      this.state.weekViewStartDate
                                    }
                                    category={event.category}
                                    day={event.startTime.getDay()}
                                    startTime={new Date(event.startTime)}
                                    endTime={new Date(event.endTime)}
                                    title={event.title}
                                    location={event.location}
                                    description={event.description}
                                    color={event.color}
                                    id={event.id}
                                    clickable={true}
                                    handleEventCompletion={
                                      this.handleEventCompletion
                                    }
                                    handleMultipleSelected={
                                      this.handleMultipleSelected
                                    }
                                    eventMandatory={event.eventMandatory}
                                    audienceLevel={event.audienceLevel}
                                  />
                                ) : (
                                  <View />
                                );
                              })}

                              {this.state.recurringEventList.map((event) => {
                                return makeVisibleRecurring(
                                  this.state.weekViewStartDate,
                                  event,
                                  this.state.calendarUIVisibilityFilter
                                ) ? (
                                  event.dayOfTheWeekSelected.map(
                                    (daySelected) => {
                                      return daySelected.isSelected &&
                                        makeVisibleRecurringForDay(
                                          this.state.weekViewStartDate,
                                          event,
                                          daySelected.value
                                        ) ? (
                                        <EventItem
                                          key={`EITEM-${1}-${event.id}-${
                                            event.startTime
                                          }-${this.state.weekViewStartDate}-${
                                            daySelected.value
                                          }`}
                                          navigation={this.props.navigation}
                                          weekviewStartDate={this.state.weekViewStartDate.toString()}
                                          category={event.category}
                                          day={daySelected.value}
                                          startTime={new Date(event.startTime)}
                                          endTime={new Date(event.endTime)}
                                          title={event.title}
                                          location={event.location}
                                          description={event.description}
                                          color={event.color}
                                          id={event.id}
                                          clickable={true}
                                          handleEventCompletion={
                                            this.handleEventCompletion
                                          }
                                          eventMandatory={event.eventMandatory}
                                          audienceLevel={event.audienceLevel}
                                          eventRepetition={
                                            event.eventRepetition
                                          }
                                          eventRepetitionCount={
                                            event.eventRepetitionCount
                                          }
                                          eventRepetitionHasEnd={
                                            event.repetitionHasEndValue
                                          }
                                          eventRepeatEndDate={
                                            new Date(event.eventRepeatEndDate)
                                          }
                                          overwriteData={this.state.recurringEventOverwriteList.filter(
                                            (item) => {
                                              return item.eventId == event.id;
                                            }
                                          )}
                                        />
                                      ) : (
                                        <View />
                                      );
                                    }
                                  )
                                ) : (
                                  // <EventItem
                                  //   key={`EITEM-${1}-${event.title}-${
                                  //     event.startTime
                                  //   }`}
                                  //   navigation={this.props.navigation}
                                  //   category={event.category}
                                  //   day={event.startTime.getDay()}
                                  //   startTime={new Date(event.startTime)}
                                  //   endTime={new Date(event.endTime)}
                                  //   title={event.title}
                                  //   location={event.location}
                                  //   description={event.description}
                                  //   color={event.color}
                                  //   id={event.id}
                                  //   clickable={true}
                                  //   handleEventCompletion={
                                  //     this.handleEventCompletion
                                  //   }
                                  //   eventMandatory={event.eventMandatory}
                                  //   audienceLevel={event.audienceLevel}
                                  // />
                                  <View />
                                );
                              })}
                            </View>
                          </ScrollView>
                        </View>
                      </ScrollView>
                    </View>
                  );
                case CalendarViewType.MONTH:
                  return (
                    <View
                      style={{
                        width: "100%",
                        flex: 1,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          marginBottom: 8,
                        }}
                      >
                        <Text
                          style={[
                            styles.monthViewHeaderDayText,
                            { color: themeCon[theme].fontColor },
                          ]}
                        >
                          Sun
                        </Text>
                        <Text
                          style={[
                            styles.monthViewHeaderDayText,
                            { color: themeCon[theme].fontColor },
                          ]}
                        >
                          Mon
                        </Text>
                        <Text
                          style={[
                            styles.monthViewHeaderDayText,
                            { color: themeCon[theme].fontColor },
                          ]}
                        >
                          Tues
                        </Text>
                        <Text
                          style={[
                            styles.monthViewHeaderDayText,
                            { color: themeCon[theme].fontColor },
                          ]}
                        >
                          Wed
                        </Text>
                        <Text
                          style={[
                            styles.monthViewHeaderDayText,
                            { color: themeCon[theme].fontColor },
                          ]}
                        >
                          Thur
                        </Text>
                        <Text
                          style={[
                            styles.monthViewHeaderDayText,
                            { color: themeCon[theme].fontColor },
                          ]}
                        >
                          Fri
                        </Text>
                        <Text
                          style={[
                            styles.monthViewHeaderDayText,
                            { color: themeCon[theme].fontColor },
                          ]}
                        >
                          Sat
                        </Text>
                      </View>

                      <FlatList
                        scrollEnabled={false}
                        data={this.state.monthViewData}
                        renderItem={({ item }) => (
                          <MonthViewItem
                            date={item.date}
                            hasEvent={item.hasEvent}
                            isThisMonth={item.isThisMonth}
                          />
                        )}
                        //Setting the number of column
                        numColumns={7}
                        keyExtractor={(item, index) => index}
                      />
                    </View>
                  );
                case CalendarViewType.DAY:
                  return (
                    <View
                      style={{
                        width: "100%",
                        flex: 1,
                        // backgroundColor: "teal",
                      }}
                    >
                      <View
                        style={{
                          // backgroundColor: "red",
                          flexDirection: "row",
                          borderBottomWidth: 2,
                          borderBottomLeftRadius: 12,
                          borderBottomRightRadius: 12,
                          borderColor: themeCon[theme].borderColor,
                        }}
                      >
                        <View
                          style={{
                            flexDirection: "column",
                            alignItems: "center",
                            padding: 6,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 40,
                              color: themeCon[theme].fontColor,
                            }}
                          >
                            {this.state.currentDate.getDate()}
                          </Text>
                          <Text style={{ color: themeCon[theme].fontColor }}>
                            {getWeekDayName(this.state.currentDate.getDay())}
                          </Text>
                        </View>
                      </View>
                      {/* If event is on the date selected, show the event. */}
                      {this.state.totalCalendarList.map((event) => {
                        if (
                          isOnSameDate(event.startTime, this.state.currentDate)
                        ) {
                          return (
                            <EventViewInRow
                              navigation={this.props.navigation}
                              category={event.category}
                              day={event.startTime.getDay()}
                              title={event.title}
                              location={event.location}
                              startTime={JSClock(event.startTime)}
                              endTime={JSClock(event.endTime)}
                              color={event.color}
                            />
                          );
                        }
                      })}
                    </View>
                  );
                default:
                  return (
                    <View>
                      <Text>Something went wrong...!</Text>
                    </View>
                  );
              }
            })()}
            {this.state.selectedList.length == 0 ? (
              <View style={{ flexDirection: "row", margin: 8 }}>
                <ScrollView horizontal={true}>
                  {/* School Course */}
                  <BouncyCheckbox
                    size={35}
                    fillColor="#ff7675"
                    unfillColor="#FFFFFF"
                    text={EventCategory.SCHOOLCOURSE}
                    iconStyle={{ margin: 2 }}
                    innerIconStyle={{ borderWidth: 2 }}
                    textStyle={{ textDecorationLine: "none" }}
                    style={{ marginRight: 25 }}
                    isChecked={this.state.calendarUIVisibilityFilter.listEvents}
                    onPress={(isChecked) => {
                      var filterState = {
                        ...this.state.calendarUIVisibilityFilter,
                      };
                      filterState.listEvents = isChecked;
                      this.setState({
                        calendarUIVisibilityFilter: filterState,
                      });
                    }}
                  />
                  {/** Sports **/}
                  <BouncyCheckbox
                    size={35}
                    fillColor="#0984e3"
                    unfillColor="#FFFFFF"
                    text={EventCategory.SPORTS}
                    iconStyle={{ margin: 2 }}
                    innerIconStyle={{ borderWidth: 2 }}
                    textStyle={{ textDecorationLine: "none" }}
                    style={{ marginRight: 25 }}
                    isChecked={
                      this.state.calendarUIVisibilityFilter.athleticEvents
                    }
                    onPress={(isChecked) => {
                      var filterState = {
                        ...this.state.calendarUIVisibilityFilter,
                      };
                      filterState.athleticEvents = isChecked;
                      this.setState({
                        calendarUIVisibilityFilter: filterState,
                      });
                    }}
                  />
                  {/* Event */}
                  <BouncyCheckbox
                    size={35}
                    fillColor="#6c5ce7"
                    unfillColor="#FFFFFF"
                    text={EventCategory.EVENT}
                    iconStyle={{ margin: 2 }}
                    innerIconStyle={{ borderWidth: 2 }}
                    textStyle={{ textDecorationLine: "none" }}
                    style={{ marginRight: 25 }}
                    isChecked={
                      this.state.calendarUIVisibilityFilter.calendarEvents
                    }
                    onPress={(isChecked) => {
                      var filterState = {
                        ...this.state.calendarUIVisibilityFilter,
                      };
                      filterState.calendarEvents = isChecked;
                      this.setState({
                        calendarUIVisibilityFilter: filterState,
                      });
                    }}
                  />
                  {/* Group Events*/}
                  {/* <BouncyCheckbox
                  size={35}
                  fillColor="#66cc00"
                  unfillColor="#FFFFFF"
                  text={EventCategory.GROUP}
                  iconStyle={{ margin: 2 }}
                  innerIconStyle={{ borderWidth: 2 }}
                  textStyle={{ textDecorationLine: "none" }}
                  style={{ marginRight: 25 }}
                  isChecked={
                    this.state.calendarUIVisibilityFilter.groupEvents
                  }
                  onPress={(isChecked) => {
                    var filterState = {
                      ...this.state.calendarUIVisibilityFilter,
                    };
                    filterState.groupEvents = isChecked;
                    this.setState({ calendarUIVisibilityFilter: filterState });
                  }}
                /> */}
                </ScrollView>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={this.clickHandler}
                  style={{ padding: 4, marginLeft: 8 }}
                >
                  <Icon
                    name="plus-circle"
                    size={40}
                    color={themeCon[theme].plusModalColor}
                  />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ flexDirection: "row", margin: 8 }}>
                <ScrollView horizontal={true}>
                  <Text
                    style={{
                      fontSize: 18,
                      paddingRight: 15,
                      paddingTop: 8,
                      textAlign: "center",
                      color: "blue",
                    }}
                  >
                    {this.state.selectedList.length} selected
                  </Text>
                  <View style={{ paddingTop: 8, paddingLeft: 5 }}>
                    <Icon name="trash-o" size={20} />
                  </View>
                  <Button
                    onPress={() => {
                      this.handleMultipleSelectedChange("delete");
                    }}
                    color="black"
                    title="Delete"
                  />
                  <View style={{ paddingTop: 8, paddingLeft: 7 }}>
                    <Icon name="eye-slash" size={20} />
                  </View>
                  <Button
                    onPress={() => this.setState({ selectPrivacy: true })}
                    color="black"
                    title="Private"
                  />
                  <View style={{ paddingTop: 8, paddingLeft: 7 }}>
                    <Icon name="edit" size={20} />
                  </View>
                  <Button
                    onPress={() => this.setState({ selectCategory: true })}
                    color="black"
                    title="Category"
                  />
                  <View style={{ paddingTop: 8, paddingLeft: 7 }}>
                    <Icon name="square" size={20} />
                  </View>
                  <Button
                    onPress={() => {
                      this.handleMultipleSelectedChange("color");
                    }}
                    color="black"
                    title="Color"
                  />
                </ScrollView>
              </View>
            )}
            <Modal
              animationType="slide"
              transparent={true}
              visible={this.state.selectPrivacy}
            >
              <TouchableOpacity
                style={styles.container2}
                activeOpacity={1}
                onPressOut={() => {
                  this.setState({ selectPrivacy: false });
                }}
              >
                <TouchableWithoutFeedback>
                  <View
                    style={{
                      backgroundColor: "white",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 10,
                    }}
                  >
                    <View style={{borderBottomWidth:1}}>
                    <Text style={{fontSize:18, padding:10}}>Choose new privacy</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() =>
                        {
                          this.handleMultipleSelectedChange(
                            "privacy",
                            AudienceLevelType.PRIVATE.value
                          )
                          this.setState({selectPrivacy: false})
                        }
                      }
                    >
                      <Text style={[styles.privacyOption, borderWidth=1]}>My eyes only</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() =>
                      {
                        this.handleMultipleSelectedChange(
                          "privacy",
                          AudienceLevelType.FRIENDS.value
                        )
                        this.setState({selectPrivacy: false})
                      }
                      }
                    >
                      <Text style={styles.privacyOption}>Friends only</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() =>
                       { 
                        this.handleMultipleSelectedChange(
                          "privacy",
                          AudienceLevelType.PUBLIC.value
                        )
                        this.setState({selectPrivacy: false})
                        } 
                      }
                    >
                      <Text style={styles.privacyOption}>Public</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableWithoutFeedback>
              </TouchableOpacity>
            </Modal>
            <Modal
              animationType="slide"
              transparent={true}
              visible={this.state.selectCategory}
            >
              <TouchableOpacity
                style={styles.container2}
                activeOpacity={1}
                onPressOut={() => {
                  this.setState({ selectCategory: false });
                }}
              >
                <TouchableWithoutFeedback>
                  <View
                    style={{
                      backgroundColor: "white",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 10,
                    }}
                  >
                    <View style={{borderBottomWidth:1}}>
                    <Text style={{fontSize:18, padding:10}}>Choose new category</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() =>
                       { 
                        this.handleMultipleSelectedChange(
                          "category",
                          EventCategory.SCHOOLCOURSE
                        )
                        this.setState({selectCategory: false})
                      } 
                      }
                    >
                      <Text style={[styles.privacyOption, borderWidth=1]}>{EventCategory.SCHOOLCOURSE}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() =>
                      {
                        this.handleMultipleSelectedChange(
                          "category",
                          EventCategory.EVENT
                        )
                        this.setState({selectCategory: false})
                      }
                      }
                    >
                      <Text style={styles.privacyOption}>{EventCategory.EVENT}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() =>
                      {  
                        this.handleMultipleSelectedChange(
                          "category",
                          EventCategory.SPORTS
                        )
                        this.setState({selectCategory: false})
                      }
                      }
                    >
                      <Text style={styles.privacyOption}>{EventCategory.SPORTS}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() =>
                      {  
                        this.handleMultipleSelectedChange(
                          "category",
                          EventCategory.GROUP
                        )
                        this.setState({selectCategory: false})
                      }
                      }
                    >
                      <Text style={styles.privacyOption}>{EventCategory.GROUP}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() =>
                       { 
                        this.handleMultipleSelectedChange(
                          "category",
                          EventCategory.ARTS
                        )
                        this.setState({selectCategory: false})
                      }
                      }
                    >
                      <Text style={styles.privacyOption}>{EventCategory.ARTS}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() =>
                      {  
                        this.handleMultipleSelectedChange(
                          "category",
                          EventCategory.SOCIAL
                        )
                        this.setState({selectCategory: false})
                      }
                      }
                    >
                      <Text style={styles.privacyOption}>{EventCategory.SOCIAL}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() =>
                      {  
                        this.handleMultipleSelectedChange(
                          "category",
                          EventCategory.CAREER
                        )
                        this.setState({selectCategory: false})
                      }
                      }
                    >
                      <Text style={styles.privacyOption}>{EventCategory.CAREER}</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableWithoutFeedback>
              </TouchableOpacity>
            </Modal>
          </View>
        </View>
      </SafeAreaView>
    );
  }
}

const makeVisible = (weekStartDate, event, filterValues) => {
  // if event is school course, make visible
  if (!visibilityFilter(event, filterValues)) {
    return false;
  }
  if (event.category == EventCategory.SCHOOLCOURSE) {
    return true;
  }

  //week range start and end
  let s = weekStartDate;
  s.setHours(0);
  s.setMinutes(0);
  s.setSeconds(0);
  let e = new Date(weekStartDate);
  e.setDate(e.getDate() + 6);
  e.setHours(23);
  e.setMinutes(59);
  e.setSeconds(59);

  //if event is within the week time frame, make visible
  if (event.startTime >= s && event.startTime <= e) {
    return true;
  }
  return false;
};

const makeVisibleRecurring = (weekStartDate, event, filterValues) => {
  // if event is school course, make visible

  if (!visibilityFilter(event, filterValues)) {
    return false;
  }

  let rE = new Date(event.eventRepeatEndDate);

  //week range start and end
  let s = weekStartDate;
  s.setHours(0);
  s.setMinutes(0);
  s.setSeconds(0);
  s.setMilliseconds(0);

  let e = new Date(weekStartDate);
  e.setDate(e.getDate() + 6);
  e.setHours(23);
  e.setMinutes(59);
  e.setSeconds(59);
  e.setMilliseconds(0);
  //if event is within the week time frame, make visible
  if (event.startTime >= s && event.startTime <= e) {
    return true;
  }

  if (event.startTime >= s && event.startTime > e) {
    //This is the weeks before the event was even created
    return false;
  }
  if (event.startTime < s && event.startTime <= e) {
    //This is the weeks after the event was created
    if (event.repetitionHasEndValue == 0) {
      //When event does not have a end date for repetition
      return true;
    } else {
      if (rE >= s) {
        return true;
      } else {
        return false;
      }
    }
  }
  return false;
};

makeVisibleRecurringForDay = (weekStartDate, event, day) => {
  let rE = new Date(event.eventRepeatEndDate);
  rE.setHours(23);
  rE.setMinutes(59);
  rE.setSeconds(59);
  rE.setMilliseconds(0);

  let s = weekStartDate;
  s.setHours(0);
  s.setMinutes(0);
  s.setSeconds(0);
  s.setMilliseconds(0);

  let e = new Date(weekStartDate);
  e.setDate(e.getDate() + 6);
  e.setHours(23);
  e.setMinutes(59);
  e.setSeconds(59);
  e.setMilliseconds(0);

  let eDate = new Date(weekStartDate);
  eDate.setDate(eDate.getDate() + day);
  eDate.setHours(23);
  eDate.setMinutes(59);
  eDate.setSeconds(59);
  eDate.setMilliseconds(0);

  if (event.startTime <= eDate) {
    if (event.repetitionHasEndValue == 0) {
      return true;
    }

    if (eDate <= rE) {
      return true;
    } else {
      return false;
    }
  }

  return false;
};

const visibilityFilter = (event, filterValues) => {
  switch (event.category) {
    case EventCategory.EVENT:
      if (filterValues.calendarEvents) {
        return true;
      }
      break;
    case EventCategory.SCHOOLCOURSE:
      if (filterValues.listEvents) {
        return true;
      }
      break;
    case EventCategory.SPORTS:
      if (filterValues.athleticEvents) {
        return true;
      }
      break;
    default:
      return true; //changed to true to show new categories (career, arts, etc.)
  }
};

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
  container2: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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
  monthViewHeaderDayText: {
    width: Dimensions.get("window").width / 7,
    textAlign: "center",
    fontSize: 16,
  },
  touchableOpacityStyle: {
    position: "absolute",
    width: 50,
    height: 50,
    right: 30,
    bottom: 30,
    zIndex: 1,
  },
  privacyOption: {
    fontSize: 15,
    color: "black",
    padding: 8,
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
    //여기
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 25,
    marginRight: 25,
  },
  modal: {
    backgroundColor: "white",
    width: 350,
    height: 585,
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
  box: {
    flex: 1,
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
  dropdown: {
    height: 50,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,

    elevation: 2,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 14,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  selectedStyle: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "14px",
    backgroundColor: "white",
    shadowColor: "#000",
    marginTop: 8,
    marginRight: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,

    elevation: 2,
  },
  textSelectedStyle: {
    marginRight: 5,
    fontSize: 16,
  },
  item2: {
    padding: 17,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
