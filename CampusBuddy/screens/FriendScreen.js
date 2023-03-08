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
  ActivityIndicator,
} from "react-native";
import { auth, db, userSchedule } from "../firebaseConfig";
import {
  updateDoc,
  doc,
  arrayRemove,
  onSnapshot,
  arrayUnion,
  FieldValue,
  Firestore,
  getDoc,
} from "firebase/firestore";
import { useState, useEffect, Component } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default class FriendScreen extends Component {
  constructor() {
    super();
    this.state = {
      list: [], // all friends
      favor: [] // favorite friends
    };
  }

  componentDidMount() {
    var data;
    const subscriber = onSnapshot(
      doc(db, "friend_list", auth.currentUser?.email),
      (doc) => {
        const data = doc.data()["friends"];
        const data2 = doc.data()["favorite"];
        this.setState({favor: data2, list:data})
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

  render() {
    return (
      <SafeAreaView style={styles.container}>
        {/* <Text>{"\n\n"+auth.currentUser?.uid}</Text>
          <Text>Current Id: {id}</Text> */}
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
});
