import { StatusBar } from "expo-status-bar";
import {
  Button,
  StyleSheet,
  Text,
  SafeAreaView,
  TextInput,
  View,
  Modal,
  Alert,
  TouchableOpacity,
  FlatList,
  Pressable,
} from "react-native";
import {
  addGroup,
  addMembersToGroup,
  addNicknameInGroup,
  auth,
  db,
  removeMemberFromGroup,
} from "../firebaseConfig";
import { FloatingAction } from "react-native-floating-action";
import {
  updateDoc,
  doc,
  arrayRemove,
  onSnapshot,
  arrayUnion,
  getDoc,
  deleteField,
  query,
  collection,
  where,
} from "firebase/firestore";
import { Component } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AntDesign from "react-native-vector-icons/AntDesign";
import { MultiSelect } from "react-native-element-dropdown";
import { ScrollView } from "react-native-gesture-handler";
import { Colors } from "../constants/colors";

var all = [];

export default class FriendScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      list: [], // all friends except favorite friends
      favor: [], // favorite friends
      searched: [],
      actions: [
        {
          text: "Add a group",
          icon: require("../assets/people.png"),
          name: "add_group",
          position: 1,
        },
      ],
      group_visible: false,
      input: "",
      selected: [],
      modalVisible: false,
      nicknames: {},
      nickname: "",
      showNicknameInput: false,
      currentFriend: null,
      all_groups: [],
      all: [],
      data: [],
    };
  }

  setModalVisible = (visible) => {
    this.setState({ modalVisible: visible });
  };

  openNicknameInput = (friend) => {
    this.setState({ showNicknameInput: true, currentFriend: friend });
  };

  submitNickname = () => {
    const { currentFriend, nickname } = this.state;

    // Update the friend's nickname in the user's friend list
    // You can save the nickname in a new property, e.g. "nickname"

    // Hide the nickname input
    this.setState({ showNicknameInput: false, currentFriend: null });
  };

  setNickname = async (group, email, oldNickname, newNickname) => {
    await addNicknameInGroup(group, email, oldNickname, newNickname);
    // this.setState((prevState) => ({
    //   nicknames: {
    //     ...prevState.nicknames,
    //     [email]: nickname,
    //   },
    // }));
  };

  componentDidMount() {
    const subscriber = onSnapshot(
      doc(db, "friend_list", auth.currentUser?.email),
      (doc) => {
        const data = doc.data()["friends"];
        const data2 = doc.data()["favorite"];

        this.setState({
          favor: data2,
          list: data,
          searched: [...data2, ...data],
        });

        const tempData = this.state.data;

        if (tempData["friends"] != undefined) {
          delete tempData.friends;
          delete tempData.favorite;
        }
        tempData.friends = doc.data().friends;
        tempData.favorite = doc.data().favorite;

        this.setState({
          all: [...this.state.list, ...this.state.favor],
          // data: doc.data(),
          data: tempData,
        });
      }
    );

    //Joey's code. Format group data fetched from groups collection.
    //this.state.all_groups have group names in an array.
    //this.state.data is an object, with each field representing a group
    /**
     * {
     * "G With Joey Friend":
     *   [
     *     {"favorite": false, "user": "joey@gmail.com"},
     *     {"favorite": false, "user": "joeyfriend@gmail.com"}
     *   ],
     * "Hdhd":
     *   [
     *     {"favorite": false, "user": "joey@gmail.com"}
     *   ],
     * "favorite":
     *   [],
     * "friends":
     *   [
     *     {"favorite": false, "user": "joeyfriend2@gmail.com"},
     *     {"favorite": false, "user": "joeyfriend@gmail.com"}
     *   ]
     * }
     */

    const q = query(
      collection(db, "groups"),
      where("memberList", "array-contains", auth.currentUser?.email)
    );
    const groupsWithMeee = onSnapshot(q, (querySnapshot) => {
      let myGroups = { ...this.state.data };
      // let all_groups = this.state.all_groups;
      let all_groups = [];

      querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        let gName = doc.data().groupName;
        if (!all_groups.includes(gName)) {
          all_groups.push(gName);
        }
        let members = doc.data().memberList;
        let nicknames = doc.data().nicknames;
        myGroups[gName] = [];
        members.forEach((member) => {
          let nicknameTemp = "";
          if (nicknames) {
            nicknames.forEach((nickname) => {
              if (nickname.user == member) {
                nicknameTemp = nickname.nickname;
              }
            });
          }

          let m = { favorite: false, user: member, nickname: nicknameTemp };
          myGroups[gName].push(m);
        });
      });
      this.setState({ data: myGroups });
      this.setState({ all_groups });
    });
    return () => {
      groupsWithMeee();
      subscriber();
    };
  }

  removeFriend = (item) => {
    const me = doc(db, "friend_list", auth.currentUser?.email);
    const friend = doc(db, "friend_list", item.user);
    try {
      if (item.favorite) {
        updateDoc(me, {
          favorite: arrayRemove(item),
        });
        user_data.data()["favorite"].map((temp) => {
          if (temp.user === auth.currentUser?.email) {
            updateDoc(friend, {
              favorite: arrayRemove(temp),
            });
          }
        });
      } else {
        updateDoc(me, {
          friends: arrayRemove(item),
        });
        user_data.data()["friends"].map((temp) => {
          if (temp.user === auth.currentUser?.email) {
            updateDoc(friend, {
              friends: arrayRemove(temp),
            });
          }
        });
      }
      const user_data = getDoc(friend);
      user_data.data()["friends"].map((temp) => {
        if (temp.user === auth.currentUser?.email) {
          updateDoc(friend, {
            friends: arrayRemove(temp),
          });
        }
      });
      Alert.alert("Unfriend", item.user + " has been unfriended");
    } catch (e) {
      console.error("Remove friend: ", e);
    }
  };

  favorite_handler = (item) => {
    const me = doc(db, "friend_list", auth.currentUser?.email);
    try {
      if (item.favorite) {
        updateDoc(me, {
          favorite: arrayRemove(item),
        });
        item.favorite = !item.favorite;
        updateDoc(me, {
          friends: arrayUnion(item),
        });
      } else {
        updateDoc(me, {
          friends: arrayRemove(item),
        });
        item.favorite = !item.favorite;
        updateDoc(me, {
          favorite: arrayUnion(item),
        });
      }
    } catch (e) {
      console.error("Favorite friend: ", e);
    }
  };

  handleAddNickname = () => {
    const { selected, nickname } = this.state;
    if (selected.length === 0 || nickname === "") {
      Alert.alert("Invalid input", "Please enter both user(s) and group name");
      return;
    }
    const me = doc(db, "friend_list", auth.currentUser?.email);
    const friend_list = db.collection("friend_list");
    const users = selected.map((s) => doc(friend_list, s));
    try {
      updateDoc(me, {
        group: arrayUnion({
          name: nickname,
          users: [...users, doc(friend_list, auth.currentUser?.email)],
        }),
      });
      this.setState({ group_visible: false, selected: [], nickname: "" }); // add this line
      Alert.alert("Add Group", "Successfully added a new group");
    } catch (e) {
      console.error("Add Group: ", e);
    }
  };

  renderItem = (item) => {
    return (
      <View style={styles.item}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignContent: "space-around",
          }}
        >
          <TouchableOpacity onPress={() => this.favorite_handler(item)}>
            <MaterialCommunityIcons
              name={item.favorite ? "heart" : "heart-outline"}
              size={28}
              color={item.favorite ? "red" : "black"}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              this.props.navigation.navigate("user_profile", {
                email: item.user,
              })
            }
          >
            <Text style={{ color: "black", fontSize: 15 }}>{item.user}</Text>
            {this.state.nicknames[item.user] && (
              <Text style={{ color: "grey", fontSize: 12 }}>
                {this.state.nicknames[item.user]}
              </Text>
            )}
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: "column" }}>
          <TouchableOpacity
            onPress={() =>
              Alert.alert(
                "Unfriend",
                "Do you really want to unfriend?",
                [
                  { text: "Yes", onPress: () => this.removeFriend(item) },
                  { text: "Cancel", style: "cancel" },
                ],
                { cancelable: false }
              )
            }
          >
            <Text>Unfriend</Text>
          </TouchableOpacity>

          {/* <TouchableOpacity
            onPress={() => {
              Alert.prompt(
                "Add Nickname",
                "Enter a nickname for this friend",
                (nickname) => {
                  if (nickname) {
                    this.setNickname(item.user, nickname);
                  } else {
                    Alert.alert(
                      "Invalid input",
                      "Please enter a valid nickname"
                    );
                  }
                }
              );
            }}
          >
            <Text>Add Nickname</Text>
          </TouchableOpacity> */}
        </View>
      </View>
    );
  };

  removeGroup = (item, group) => {
    // const me = doc(db, "friend_list", auth.currentUser?.email);
    // getDoc(me).then((snap) => {
    //   // if (snap.data()[group] == 1){
    //   updateDoc(me, {
    //     [group]: deleteField(),
    //   });
    //   // }else{
    //   //   updateDoc(me, {
    //   //     [group]: arrayRemove(item),
    //   //   });
    //   // }
    // });
    // Alert.alert("Ungroup", "Succesfully ungrouped!");

    //COmmented above code
    //Joey's code
    const rmMember = async () => {
      await removeMemberFromGroup(group, item);
    };
    const res = rmMember();
    if (res) {
      Alert.alert("Ungroup", "Succesfully ungrouped!");
    }
  };

  //item contains {favorite : asdf , user: asldfjk}
  renderItem2 = (item, group) => {
    return (
      <View style={styles.item}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignContent: "space-around",
          }}
        >
          <TouchableOpacity
            onPress={() =>
              this.props.navigation.navigate("user_profile", {
                email: item.user,
              })
            }
          >
            <Text style={{ color: "black", fontSize: 15 }}>{item.user}</Text>
            {/* {this.state.nicknames[item.user] && (
              <Text style={{ color: "grey", fontSize: 12 }}>
                {this.state.nicknames[item.user]}
              </Text>
            )} */}
            {/* Replace nicknames state to database nickname */}
            {item.nickname != "" && (
              <Text style={{ color: "grey", fontSize: 12 }}>
                {item.nickname}
              </Text>
            )}
          </TouchableOpacity>
          
        </View>
        {item.user == auth.currentUser.email ? (
          <View style={{ flexDirection: "column" }}>
            <TouchableOpacity
              onPress={() =>
                Alert.alert(
                  "Leave",
                  "Do you really want to leave the group?",
                  [
                    {
                      text: "Yes",
                      onPress: () => this.removeGroup(item, group),
                    },
                    { text: "Cancel", style: "cancel" },
                  ],
                  { cancelable: false }
                )
              }
            >
              <Text>Leave Group</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                Alert.prompt(
                  "Add Nickname",
                  "Enter a nickname for this friend",
                  (nickname) => {
                    if (nickname) {
                      this.setNickname(
                        group,
                        item.user,
                        item.nickname,
                        nickname
                      );
                    } else {
                      Alert.alert(
                        "Invalid input",
                        "Please enter a valid nickname"
                      );
                    }
                  }
                );
              }}
            >
              <Text>Add Nickname</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View></View>
        )}
      </View>
    );
  };

  navigateToGroupDetailsScreen = (groupName) => {
    this.props.navigation.navigate("GroupDetailsScreen", {
      groupName: groupName,
      groupMembers: this.state.data[groupName],
    });
  };

  floating_handler = (name) => {
    //if user clicked add_group button then show group modal
    if (name === "add_group") {
      this.setState({ input: "", selected: [] });
      this.setState({ group_visible: !this.state.group_visible });
    }
  };

  renderGroups = (group) => {
    return (
      <View>
        <View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 20,
              justifyContent: "space-between",
              marginLeft: 10,
              marginRight: 20,
            }}
          >
            <Text numberOfLines={1} style={{ fontSize: 20 }}>
              {group + ":"}
            </Text>
            <Pressable
              style={{
                padding: 10,
                backgroundColor: Colors.grey,
                borderRadius: 10,
              }}
              onPress={() => this.navigateToGroupDetailsScreen(group)}
            >
              <AntDesign color="black" name="arrowright" size={20} />
            </Pressable>
          </View>

          {/* <FlatList 
              data = {this.state.data[group]}
              renderItem={({item}) => this.renderItem2(item, group)}
            /> */}

          {this.state.data[group].map((item) => this.renderItem2(item, group))}
        </View>
      </View>
    );
  };
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

  filter_friends = (text) => {
    const updatedData = [...this.state.favor, ...this.state.list].filter(
      (item) => {
        return item.user.includes(text);
      }
    );
    if (updatedData.length > 0) {
      this.setState({ searched: updatedData });
    }
  };

  handle_create = async () => {
    //check for the duplicate group name in friend list

    var check = false;

    if (this.state.input === "") {
      Alert.alert("Warning", "Please enter the name of group");
    } else if (this.state.input.length > 30) {
      Alert.alert("Warning", "Group name has to be within 30 characters");
    } else {
      const groupId = await addGroup(this.state.input, auth.currentUser.email);
      if (groupId == null) {
        Alert.alert("Duplicate", "Group name already exists!");
      } else {
        const res = await addMembersToGroup(groupId, this.state.selected);
        if (res) {
          Alert.alert(
            "Succeed!",
            "Successfully a created group: " + this.state.input
          );
          this.setState({ group_visible: !this.state.group_visible });
        }
      }

      //   const duplicate = getDoc(
      //     doc(db, "friend_list", auth.currentUser?.email)
      //   ).then((doc) => {
      //     if (Object.keys(doc.data()).indexOf(this.state.input) > -1) {
      //       Alert.alert("Duplicate", "Group name is already existing");
      //     } else {
      //       check = true;
      //     }
      //   });
      //   if (!check) {
      //     const selected = [];
      //     this.state.selected.map((choice) => {
      //       this.state.all.map((data) => {
      //         if (data.user == choice) {
      //           const { _index, ...rest } = data;
      //           selected.push(rest);
      //         }
      //       });
      //     });
      //     updateDoc(doc(db, "friend_list", auth.currentUser?.email), {
      //       [this.state.input]: selected,
      //     });
      //     Alert.alert(
      //       "Succeed!",
      //       "Successfully a created group: " + this.state.input
      //     );
      //     this.setState({ group_visible: !this.state.group_visible });
      //   }
    }
  };

  render() {
    const { showNicknameInput } = this.state;

    const nicknameInput = showNicknameInput ? (
      <View>
        <TextInput
          style={styles.input}
          onChangeText={(text) => this.setState({ nickname: text })}
          placeholder="Enter a nickname"
          value={this.state.nickname}
        />
        <TouchableOpacity onPress={this.submitNickname}>
          <Text>Submit Nickname</Text>
        </TouchableOpacity>
      </View>
    ) : null;

    return (
      <View style={styles.container}>
        <ScrollView style={styles.container}>
          <Modal
            animationType="slide"
            transparent={true}
            visible={this.state.group_visible}
          >
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <View style={styles.modalView}>
                <View style={{ marginBottom: 25 }}>
                  <Text>Group Name: </Text>
                  <TextInput
                    style={styles.input2}
                    onChangeText={(text) => this.setState({ input: text })}
                    placeholder="Type here ..."
                    value={this.state.input}
                  />
                  <Text>Choose your friends to add:</Text>
                  <MultiSelect
                    style={styles.dropdown}
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={styles.selectedTextStyle}
                    inputSearchStyle={styles.inputSearchStyle}
                    iconStyle={styles.iconStyle}
                    data={this.state.searched}
                    valueField="user"
                    placeholder="Choose friends"
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
                  <StatusBar />
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-around",
                  }}
                >
                  <Pressable
                    style={[
                      styles.button,
                      styles.buttonClose,
                      { marginRight: 10 },
                    ]}
                    onPress={() => this.handle_create()}
                  >
                    <Text style={styles.textStyle}>Create</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.button, styles.buttonClose]}
                    onPress={() =>
                      this.setState({
                        group_visible: !this.state.group_visible,
                      })
                    }
                  >
                    <Text style={styles.textStyle}>Cancel</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </Modal>

          <Text style={{ fontSize: 20, marginTop: -40, marginLeft: 10 }}>
            {"\n\n"}Favorites:
          </Text>
          <View>
            {this.state.favor && this.state.favor.length ? (
              // <FlatList
              //   data={this.state.favor}
              //   renderItem={({ item }) => this.renderItem(item)}
              // />
              this.state.favor.map((item) => this.renderItem(item))
            ) : (
              <Text style={{ marginLeft: 10, marginTop: 5 }}>
                No favorite friends yet
              </Text>
            )}
          </View>
          <Text style={{ fontSize: 20, marginTop: -40, marginLeft: 10 }}>
            {"\n\n"}Friends:
          </Text>
          <View>
            {this.state.list && this.state.list.length ? (
              // <FlatList
              //   data={this.state.list}
              //   renderItem={({ item }) => this.renderItem(item)}
              // />
              this.state.list.map((item) => this.renderItem(item))
            ) : (
              <Text style={{ marginLeft: 10, marginTop: 5 }}>
                No friends yet
              </Text>
            )}
          </View>
          <View>
            {this.state.all_groups.map((item) => this.renderGroups(item))}
          </View>

          {nicknameInput}
        </ScrollView>
        <View
          style={{
            elevation: 999,
            zIndex: 999,
            position: "absolute",
            right: 10,
            bottom: 30,
          }}
        >
          <FloatingAction
            actions={this.state.actions}
            onPressItem={(name) => {
              this.floating_handler(name);
            }}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    marginTop: StatusBar.currentHeight || 0,
  },
  input: {
    width: "80%",
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginVertical: 10,
    padding: 10,
  },
  item: {
    backgroundColor: "orange",
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    width: "80%",
    alignSelf: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    zIndex: -1,
    elevation: -1,
    borderRadius: 30,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  input2: {
    height: 40,
    width: 200,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    marginBottom: 20,
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
  icon: {
    marginRight: 5,
  },
  item2: {
    padding: 17,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectedStyle: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 14,
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
});
