import {
  Button,
  StyleSheet,
  Text,
  TextInput,
  Modal,
  View,
  TouchableOpacity,
  FlatList
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { auth, db, addGoal, getGoals, to_request } from "../firebaseConfig";
import DateTimePicker from "@react-native-community/datetimepicker";
import { MultiSelect } from "react-native-element-dropdown";
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

export default function ProfileScreen({ navigation, route }) {
  const [visible, setVisible] = useState(false);
  const [pointGoal, setPointGoal] = useState(0);
  const [category, setCategory] = useState("");
  const [deadlineDate, setDeadlineDate] = useState(new Date());
  const [deadlineTime, setDeadlineTime] = useState(new Date());
  const [selectTime, setSelectTime] = useState(false);
  const [goalList, setGoalList] = useState([]);
  const [searched, setSearched] = useState([]);
  const [selected, setSelected] = useState([]);
  const [friend_list, setFriendList] = useState([]);

  useEffect(() => {
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
          result.push(temp);
        }
        setGoalList(result);
        
      } else {
        console.log("No such document!");
      }
    
    }
   
    fetchData()
  }, []);

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
  createNewGoal = () => {
    if (category == "" || pointGoal <= 0) {
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
        addGoal(
            auth.currentUser?.uid,
            goalId,
            pointGoal,
            category,
            deadline
        );
        const message =
          pointGoal +
          ";" +
          category +
          ";" +
          deadline;
        selected.map((email) => {
          to_request(auth.currentUser?.email, email, "goal", message);
        });
        setVisible(false);
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
            style = {{left:10, bottom:2}}
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
            <Goal
              category={item.category}
              points={item.points}
              progress={5}
              deadline={item.deadline}
            />
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
                    margin:15
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
                  <View style={styles.row}>
                  <Text
                      style={{
                        textAlign: "center",
                        color: "#2F4858",
                        marginTop:15,
                      }}
                    >
                      Category:
                    </Text>
                  <TextInput
                       style={{
                        color: "black",
                        borderWidth: 1,
                        borderColor: "#8b9cb5",
                        margin:10,
                        width: 100,
                        height: 30,
                        textAlign: "center",
                      }}
                      placeholderTextColor="#8b9cb5"
                      onChangeText={(text) => setCategory(text)}
                    ></TextInput>
                    </View>
                  <View style={styles.row}>
                  <Text
                      style={{
                        textAlign: "center",
                        color: "#2F4858",
                        marginTop:15,
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
                    <View style={styles.row}>
                  <Text
                      style={{
                        textAlign: "center",
                        color: "#2F4858",
                        margin:15,
                      }}
                    >
                    </Text>
                    <View style={styles.row}>
                    <Text
                      style={{
                        textAlign: "center",
                        margin: 5,
                        paddingTop: 7,
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
                    </View>
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
  },
  header_text: {
    flex: 1,
    fontSize: 20,
    textAlign: "center",
    paddingBottom:10
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
