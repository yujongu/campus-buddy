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
  Pressable
} from "react-native";
import { auth, db } from "../firebaseConfig";
import { FloatingAction } from "react-native-floating-action";
import {
  updateDoc,
  doc,
  arrayRemove,
  onSnapshot,
  arrayUnion,
  getDoc,
} from "firebase/firestore";
import { Component } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AntDesign from 'react-native-vector-icons/AntDesign';
import { MultiSelect } from 'react-native-element-dropdown';


var all = []

export default class FriendScreen extends Component {
  constructor() {
    super();
    this.state = {
      list: [], // all friends except favorite friends
      favor: [], // favorite friends
      searched: [],
      actions: [
        {
          text: "Add a group",
          icon: require("../assets/people.png"),
          name: "add_group",
          position: 1
        }
      ],
      group_visible: false,
      input: "",
      selected: [],
    };
  }

  componentDidMount() {
    const subscriber = onSnapshot(
      doc(db, "friend_list", auth.currentUser?.email),
      (doc) => {
        const data = doc.data()["friends"];
        const data2 = doc.data()["favorite"];
        this.setState({favor: data2, list:data, searched: [...data2, ...data]})
      }
      );
    return () => subscriber();
  }

  removeFriend = (item) => {
    const me = doc(db, "friend_list", auth.currentUser?.email);
    const friend = doc(db, "friend_list", item.user);
    try {
      if(item.favorite){
        updateDoc(me, {
          favorite: arrayRemove(item),
        });
      }else{
        updateDoc(me, {
          friends: arrayRemove(item),
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
        if(item.favorite){
          updateDoc(me, {
            favorite: arrayRemove(item),
          });
          item.favorite = !item.favorite
          updateDoc(me, {
            friends: arrayUnion(item)
          });
        }else{
          updateDoc(me, {
            friends: arrayRemove(item),
          });
          item.favorite = !item.favorite
          updateDoc(me, {
            favorite: arrayUnion(item)
          });
        }
    } catch (e) {
     console.error("Favorite friend: ", e);
    }
  }

  renderItem = (item) => {
    return (
      <View style={styles.item}>
        <View style={{flexDirection: 'row', justifyContent: "center", alignContent: "space-around"}}>
        <TouchableOpacity
            onPress={() => 
                this.favorite_handler(item)
            }
        >
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
        </TouchableOpacity>
        </View>
        <View style={{ flexDirection: "row" }}>
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
        </View>
      </View>
    );
  };

  floating_handler = (name) => {
    console.log(name)
    //if user clicked add_group button then show group modal
    if(name === "add_group"){
      this.setState({input: "", selected: []})
      this.setState({group_visible: !this.state.group_visible})
    }
  }

  renderDataItem = (item) => {
    return (
        <View style={styles.item2}>
            <Text style={styles.selectedTextStyle}>{item.user}</Text>
            {
              this.state.selected.indexOf(item.user) > -1 ?
              <AntDesign style={styles.icon} color="black" name="check" size={20} />
              :
              <AntDesign style={styles.icon} color="black" name="plus" size={20} />
            }
        </View>
    );
  };

  filter_friends = (text) => {
    const updatedData = [...this.state.favor, ...this.state.list].filter((item) => {
      return item.user.includes(text)
    });
    if(updatedData.length > 0){
      this.setState({searched: updatedData})
    }
  }

  handle_create = () =>{
    //check for the duplicate group name in friend list
    var check = false;
    if(this.state.input === ""){
      Alert.alert("Warning", "Please enter the name of group")
    }else{
      const duplicate = getDoc(doc(db, "friend_list", auth.currentUser?.email)).then((doc) => {
        if(Object.keys(doc.data()).indexOf(this.state.input) > -1){
          Alert.alert("Duplicate", "Group name is already existing")
        }else{
          check = true;
        }
      })
      if(!check){
        updateDoc(doc(db, "friend_list", auth.currentUser?.email), {
          [this.state.input] : this.state.selected
        });
        Alert.alert("Succeed!", "Successfully a created group: " + this.state.input)
        this.setState({group_visible: !this.state.group_visible})
      }
    }
  }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <Modal
          animationType="slide"
          transparent={true}
          visible={this.state.group_visible}
        >
          <View style={{flex: 1, justifyContent: 'center', alignItems: 'center',}}>
            <View style={styles.modalView}>
              <View style={{marginBottom: 25}}>
                <Text>Group Name: </Text>
                <TextInput
                  style={styles.input2}
                  onChangeText={text => this.setState({ input : text})}
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
                    this.filter_friends(text)
                    }
                  }
                  searchPlaceholder="Search..."
                  onChange={item => {
                      this.setState({selected: item})
                  }}
                  renderItem={this.renderDataItem}
                  renderSelectedItem={(item, unSelect) => (
                      <TouchableOpacity onPress={() => unSelect && unSelect(item)}>
                          <View style={styles.selectedStyle}>
                              <Text style={styles.textSelectedStyle}>{item.user}</Text>
                              <AntDesign color="black" name="delete" size={17} />
                          </View>
                      </TouchableOpacity>
                  )}
                />
                <StatusBar />
              </View>
              <View style={{flexDirection: "row", justifyContent: "space-around"}}>
                <Pressable
                  style={[styles.button, styles.buttonClose, {marginRight: 10}]}
                  onPress={() => this.handle_create()}>
                  <Text style={styles.textStyle}>Create</Text>
                </Pressable>
                <Pressable
                  style={[styles.button, styles.buttonClose]}
                  onPress={() => this.setState({group_visible: !this.state.group_visible})}>
                  <Text style={styles.textStyle}>Cancel</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
        <FloatingAction
          actions={this.state.actions}
          onPressItem={name => {
            this.floating_handler(name)
          }}
        />
        <Text>{"\n\n"}Favorites:</Text>
        <View>
          {this.state.favor && this.state.favor.length ? (
            <FlatList
              data={this.state.favor}
              renderItem={({ item }) => this.renderItem(item)}
            />
          ) : (
            <Text>No favorite friends yet</Text>
          )}
        </View>
        <Text>{"\n\n"}Friends:</Text>
        <View>
          {this.state.list && this.state.list.length ? (
            <FlatList
              data={this.state.list}
              renderItem={({ item }) => this.renderItem(item)}
            />
          ) : (
            <Text>No friends yet</Text>
          )}
        </View>
      </SafeAreaView>
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
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
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
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
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
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
  },
  selectedStyle: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 14,
      backgroundColor: 'white',
      shadowColor: '#000',
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
