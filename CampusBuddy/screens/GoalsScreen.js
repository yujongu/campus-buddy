import {
  Button,
  StyleSheet,
  Text,
  TextInput,
  Modal,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  FlatList,
  Keyboard,
  Pressable
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { auth, db, addGoal, getGoals, to_request, removeGoal } from "../firebaseConfig";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Dropdown, MultiSelect } from "react-native-element-dropdown";
import AntDesign from "react-native-vector-icons/AntDesign";
import uuid from "react-native-uuid";
import {
  updateDoc,
  doc,
  arrayRemove,
  onSnapshot,
  arrayUnion,
} from "firebase/firestore";
import React, { useState, useEffect, useContext } from "react";
import ThemeContext from "../components/ui/ThemeContext";
import theme from "../components/ui/theme";
import Goal from "../components/ui/Goal";
import {
  EventCategory
} from "../constants/eventCategory";

export default function ProfileScreen({ navigation, route }) {
  const [visible, setVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [deleteItem, setDeleteItem] = useState("");
  const [pointGoal, setPointGoal] = useState(0);
  const [deadlineDate, setDeadlineDate] = useState(new Date());
  const [deadlineTime, setDeadlineTime] = useState(new Date());
  const [selectTime, setSelectTime] = useState(false);
  const [goalList, setGoalList] = useState([]);
  const [searched, setSearched] = useState([]);
  const [selected, setSelected] = useState([]);
  const [friend_list, setFriendList] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState([]);

  useEffect(() => {
    fetchData()
  }, []);

  const fetchData = async () => {
    const friends = doc(db, "friend_list", auth.currentUser?.email);
    console.log(friends)
    onSnapshot(friends, (doc) => {
      setFriendList([...doc.data()["favorite"], ...doc.data()["friends"]])
      setSearched([...doc.data()["favorite"], ...doc.data()["friends"]])
    });
    result = []
    const res = await getGoals(auth.currentUser?.uid);
    if (res != null) {
      for (let i = 0; i < res["goal_list"].length; i++) {
        const temp = {
          category: res["goal_list"][i]["category"],
          deadline: new Date(
            res["goal_list"][i]["deadline"].seconds * 1000
          ), //multiply 1000 since Javascript uses milliseconds. Timestamp to date.
          points: res["goal_list"][i]["points"],
          progress: res["goal_list"][i]["progress"],
          id: res["goal_list"][i]["id"],
        };

        if (temp.deadline < new Date()) {
          removeGoal(auth.currentUser?.uid, res["goal_list"][i]["id"])
        }
        else {
          result.push(temp);
        }
      }
      setGoalList(result);
      
    } else {
      console.log("No such document!");
    }
  }

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
  ];

  onEventStartDateTimeSelected = (event, value) => {
    setSelectTime(false);
    setDeadlineTime(value);
  };
  onEventStartDateSelected = (event, value) => {
    setSelectTime(false);
    setDeadlineDate(value);
  };
  showStartTimePicker = () => {
    setSelectTime(true);
  };

  createNewGoal = async () => {
    if (selectedCategory == "" || pointGoal <= 0) {
        alert("Enter valid category and points for the goal");
    }
    else {
        var deadline = new Date(
          deadlineDate.getFullYear(),
          deadlineDate.getMonth(),
          deadlineDate.getDate(),
          deadlineTime.getHours(),
          deadlineTime.getMinutes()
        );
        const goalId = uuid.v4();
        await addGoal(
            auth.currentUser?.uid,
            goalId,
            pointGoal,
            selectedCategory,
            deadline
        );
        const message =
          pointGoal +
          ";" +
          selectedCategory +
          ";" +
          deadline;
        selected.map((email) => {
          to_request(auth.currentUser?.email, email, "goal", message);
        });
        setVisible(false);
        await fetchData();
    }

  }
  //search function for Mutiselect Box, taken from CalendarScreen.js
  filter_friends = (text) => {
    const updatedData = friend_list.filter((item) => {
      return item.user.includes(text);
    });
    if (updatedData.length > 0) {
      setSearched(updatedData);
    }
  };

  //render method for MutiselectBox, taken from CalendarScreen.js
  renderDataItem = (item) => {
    return (
      <View style={styles.item2}>
        <Text style={styles.selectedTextStyle}>{item.user}</Text>
        {selected.indexOf(item.user) > -1 ? (
          <AntDesign style={styles.icon} color="black" name="check" size={20} />
        ) : (
          <AntDesign style={styles.icon} color="black" name="plus" size={20} />
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container]}>
        <View style= {styles.row}>
        <Text style={{paddingRight:10, fontSize:20, paddingBottom:20}}>My Goals</Text>
        <TouchableOpacity
            style = {{left:10, bottom:10}}
            onPress={() =>
            setVisible(true)
            }
        >
            <Icon name="plus" size={25} color="#2F4858" />
        </TouchableOpacity>
        </View>
        <View style= {styles.row}>
        <FlatList
          data={goalList}
          renderItem={({ item }) => (
            <Pressable onPress={()=> {
              setDeleteVisible(true)
              setDeleteItem(item.id)
              }}>
            <Goal
              category={item.category}
              points={item.points}
              progress={5}
              deadline={item.deadline}
            />
            </Pressable>
          )}
          keyExtractor={(item) => item.id}
        />
        </View>
        <View style= {{top:30}}>
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={()=>navigation.goBack()}
        >
            <Icon name="mail-reply" size={20} color="#2F4858"  />
        </TouchableOpacity>
        </View>
        
        <Modal
          animationType="fade"
          visible={visible}
          transparent={true}
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
                borderRadius: 10,
              }}
            >
                <View
                  style={{
                    flexDirection: "column",
                    alignItems: "center",
                    marginTop:10,
                    marginBottom:10,
                    marginLeft:20,
                    marginRight:20
                  }}
                >
                  <View style={styles.row}>
                    <TouchableOpacity
                      style={{
                        flex: 1,
                      }}
                      onPress={() =>
                        setVisible(false)
                      }
                    >
                      <View style={{ alignSelf: "flex-end" }}>
                        <Icon name="times" size={20} color="#2F4858" />
                      </View>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.header_text}>New Goal</Text>
                  </View>

                  <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                  <View style={[styles.row]}>
                  <View>
                      <Text style={{textAlign:"center"}}>Category:</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Dropdown
                        style={{
                          padding: 15,
                          marginHorizontal: 10,
                          height: 50,
                          borderColor: "grey",
                          borderWidth: 0.5,
                        }}
                        maxHeight={200}
                        placeholderStyle={{ fontSize: 16 }}
                        placeholder="Select a Category"
                        labelField="label"
                        valueField="value"
                        data={categories}
                        value={selectedCategory}
                        onChange={(item) => {
                          setSelectedCategory(item.label);
                        }}
                      />
                    </View>
                    </View>
                    </TouchableWithoutFeedback>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                  <View style={styles.row}>
                  <Text
                      style={{
                        textAlign: "center",
                        color: "#2F4858",
                      }}
                    >
                      Point Goal:
                    </Text>
                    <TextInput
                      placeholderTextColor="#8b9cb5"
                      style={{
                        color: "black",
                        borderWidth: 1,
                        borderColor: "#8b9cb5",
                        margin:10,
                        width: 50,
                        height: 30,
                        textAlign: "center",
                      }}
                      value={pointGoal}
                      defaultValue={0}
                      keyboardType="numeric"
                      onChangeText={(text) => setPointGoal(text)}
                    />
                    </View>
                    </TouchableWithoutFeedback>

                    <View style={styles.row}>
                  <Text
                      style={{
                        textAlign: "center",
                        color: "#2F4858",
                        margin:15,
                      }}
                    >
                    </Text>
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.row}>
                    <Text
                      style={{
                        textAlign: "center",
                        margin: 5,
                        color: "#2F4858",
                      }}
                    >
                      Deadline:
                      
                    </Text>
                    <View>
                      {Platform.OS === "android" ? (
                        <View style={{ flexDirection: "row" }}>
                          <Pressable onPress={showStartTimePicker}>
                            <Text
                              style={{
                                backgroundColor: "#AAAAAA",
                                paddingHorizontal: 10,
                                paddingVertical: 6,
                                borderRadius: 5,
                                marginHorizontal: 4,
                              }}
                            >
                              {JSGetDate(deadlineDate)}
                            </Text>
                          </Pressable>
                          <Pressable onPress={showStartTimePicker}>
                            <Text
                              style={{
                                backgroundColor: "#AAAAAA",
                                paddingHorizontal: 10,
                                paddingVertical: 6,
                                borderRadius: 5,
                                marginHorizontal: 4,
                              }}
                            >
                              {JSClock(deadlineTime, false)}
                            </Text>
                          </Pressable>
                          {selectTime && (
                            <DateTimePicker
                              testID="dateTimePicker"
                              value={deadlineTime}
                              mode={"time"}
                              is24Hour={false}
                              onChange={onEventStartDateTimeSelected}
                            />
                          )}
                        </View>
                        
                      ) : (
                        <View style={{ flexDirection: "row" }}>
                          <DateTimePicker
                            testID="dateTimePicker"
                            value={deadlineDate}
                            mode={"date"}
                            is24Hour={true}
                            onChange={onEventStartDateSelected}
                          />
                          <DateTimePicker
                            testID="dateTimePicker"
                            value={deadlineTime}
                            mode={"time"}
                            is24Hour={false}
                            onChange={onEventStartDateTimeSelected}
                          />
                        </View>
                      )}
                    </View>
                  
                  </View>
                  </TouchableWithoutFeedback>
                    </View>
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.row}>
                    <View style={[{ width: 300, margin: 10 }]}>
                    <MultiSelect
                      style={styles.dropdown}
                      placeholderStyle={styles.placeholderStyle}
                      selectedTextStyle={styles.selectedTextStyle}
                      inputSearchStyle={styles.inputSearchStyle}
                      iconStyle={styles.iconStyle}
                      data={searched}
                      valueField="user"
                      placeholder="Invite friends"
                      value={selected}
                      search
                      searchQuery={(text) => {
                        filter_friends(text);
                      }}
                      searchPlaceholder="Search..."
                      onChange={(item) => {
                        setSelected(item);
                      }}
                      renderItem={renderDataItem}
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
                  </View>
                  </TouchableWithoutFeedback>
                  <Button
                    title="Set Goal"
                    onPress={() => {
                      createNewGoal()
                    }}
                  />
                </View>
            </View>
          </View>
        </Modal>
        <Modal
          animationType="fade"
          transparent={true}
          visible={deleteVisible}
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
                borderRadius: 10,
              }}
            >
                <View
                  style={{
                    flexDirection: "column",
                    alignItems: "center",
                    marginTop:10,
                    marginBottom:10,
                    marginLeft:20,
                    marginRight:20
                  }}
                >
            <Text style= {{fontSize:20}}>Delete goal?</Text>
            <View style= {{flexDirection:"row", padding:10}}>
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={async ()=>{
                  await removeGoal(auth.currentUser?.uid, deleteItem);
                  setDeleteVisible(false);
                  await fetchData();
                }}
            >
                <Icon name="trash-o" size={20} color="#2F4858"  />
            </TouchableOpacity>

            <TouchableOpacity
                activeOpacity={0.7}
                onPress={()=>setDeleteVisible(false)}
            >
                <Icon name="mail-reply" size={20} color="#2F4858" paddingLeft={20} />
            </TouchableOpacity>
            </View>

          </View>
          </View>
          </View>
         </Modal>   
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    marginTop: 100,
  },
  textStyle: {
    fontWeight: "bold",
    textAlign: "center",
    color: theme.color,
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  header_text: {
    flex: 1,
    fontSize: 20,
    textAlign: "center",
    paddingBottom:20
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
