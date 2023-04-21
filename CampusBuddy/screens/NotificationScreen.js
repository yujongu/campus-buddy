import {
  docRef,
  setDoc,
  getDoc,
  arrayRemove,
  doc,
  onSnapshot,
  updateDoc,
  arrayUnion,
} from "@firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { StatusBar } from "expo-status-bar";
import { Component, useEffect, useState } from "react";
import {
  Button,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { FlatList } from "react-native";
import Icon from "react-native-vector-icons/AntDesign";
import AntDesign from "react-native-vector-icons/AntDesign";
import { Modal } from "react-native";
import uuid from "react-native-uuid";
import { addEvent } from "../firebaseConfig";

export default class NotificationScreen extends Component {
  constructor() {
    super();
    this.state = {
      loading: true,
      friend_requests: [],
      requests: [],
      friend_modal: false,
    };
  }

  confirm_friend(user) {
    const docRef = doc(db, "friend_list", auth.currentUser?.email);
    const docRef_to = doc(db, "friend_list", user);
    const remove_alert = doc(db, "requests", auth.currentUser?.email);
    const remove_to = doc(db, "requests", user);
    try {
      //add to own friend list
      updateDoc(docRef, {
        friends: arrayUnion({ user: user, favorite: false }),
      });
      //add to from_user's friend list
      updateDoc(docRef_to, {
        friends: arrayUnion({ user: auth.currentUser?.email, favorite: false }),
      });
      //remove to_request from user who sent the request
      updateDoc(remove_to, {
        to_request: arrayRemove(auth.currentUser?.email + "/" + "friend"),
      });
      //remove from_request from target user
      updateDoc(remove_alert, {
        from_request: arrayRemove(user + "/" + "friend"),
      });
      this.refresh_screen();
      Alert.alert("Accepted", "Now you guys are friends");
    } catch (e) {
      console.error("Adding friend: ", e);
    }
  }

  cancel_friend(user) {
    const remove_alert = doc(db, "requests", auth.currentUser?.email);
    const remove_to = doc(db, "requests", user);
    try {
      updateDoc(remove_alert, {
        from_request: arrayRemove(user + "/" + "friend"),
      });
      updateDoc(remove_to, {
        to_request: arrayRemove(auth.currentUser?.email + "/" + "friend"),
      });
      this.refresh_screen();
      Alert.alert("Rejected", "You rejected the friend request");
    } catch (e) {
      console.error("Cancel friend: ", e);
    }
  }

  refresh_screen() {
    this.setState({ loading: true });
    setTimeout(() => {
      this.load_request();
      this.setState({ loading: false });
    }, 1000);
  }

  load_request() {
    this.setState({ friend_requests: [], requests: [] });
    const subscriber = onSnapshot(
      doc(db, "requests", auth.currentUser?.email),
      (doc) => {
        doc.data()["from_request"].map((request) => {
          const sp = request.split("/");
          if (sp[sp.length - 1] == "friend") {
            this.setState({
              friend_requests: [...this.state.friend_requests, request],
            });
          } else if (sp[sp.length - 1] == "event") {
            this.setState({ requests: [...this.state.requests, request] });
          }
        });
      }
    );
    const subs = onSnapshot(doc(db, "events", auth.currentUser?.uid), (doc) => {
      let temp = [];
      if (doc.data() != undefined) {
        doc.data()["event"].forEach((data) => {
          data = data["details"];
          if (
            new Date(data.startTime.toDate()) <= new Date() &&
            new Date(data.endTime.toDate()) >= new Date()
          ) {
            const event =
              "Event title: " +
              data.title +
              "\n" +
              "Event location: " +
              data.location +
              "\n" +
              "Event point: " +
              data.point_value +
              "\n" +
              "Event description" +
              data.description +
              "\n" +
              "Until event ends: " +
              Math.floor(
                (new Date(data.endTime.toDate()) - new Date()) /
                  (1000 * 60 * 60)
              ) +
              " hour(s)" +
              "/alert";
            temp.push(event);
          }
        });
      }
      this.setState({ requests: [...this.state.requests, ...temp] });
    });
  }

  componentDidMount() {
    this.props.navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity
            style={{ marginRight: 10 }}
            onPress={() =>
              this.setState({ friend_modal: !this.state.friend_modal })
            }
          >
            <AntDesign name={"addusergroup"} size={20} />
          </TouchableOpacity>
          <TouchableOpacity
            style={{ marginRight: 10 }}
            onPress={() => this.refresh_screen()}
          >
            <AntDesign name={"reload1"} size={20} />
          </TouchableOpacity>
        </View>
      ),
    });
    this.load_request();
    this.setState({ loading: false });
  }

  async confirm_event(event_data, from) {
    const temp = event_data.split("/")[1].split(";");
    console.log(temp);
    const docRef = doc(db, "events", auth.currentUser?.uid);
    const querySnapShot = await getDoc(docRef);
    if (!querySnapShot.exists()) {
      setDoc(docRef, {
        event: [],
      });
    }

    const eventId = uuid.v4();

    addEvent(
      //   user_token,
      auth.currentUser?.uid,
      //   title,
      temp[1],
      //   startTime,
      new Date(temp[2]),
      //   endTime,
      new Date(temp[3]),
      //   location,
      temp[4],
      //   description,
      temp[5],
      //   category,
      temp[0],
      //   point_value,
      temp[7],
      //   color,
      temp[6],
      //   repetition,
      0,
      //   id;
      eventId,
      //eventMandatory
      temp[8],
      //audienceLevel
      temp[9]
    );

    const reqRef = doc(db, "requests", auth.currentUser?.email);
    const reqRef_f = doc(db, "requests", from);

    updateDoc(reqRef, {
      from_request: arrayRemove(event_data),
    });
    const remove = event_data.replace(from, auth.currentUser?.email);
    updateDoc(reqRef_f, {
      to_request: arrayRemove(remove),
    });

    this.refresh_screen();
    console.log("Event doc written with ID: ", docRef.id);
  }

  cancel_event(event_data, from) {
    const reqRef = doc(db, "requests", auth.currentUser?.email);
    const reqRef_f = doc(db, "requests", from);

    updateDoc(reqRef, {
      from_request: arrayRemove(event_data),
    });
    const remove = event_data.replace(from, auth.currentUser?.email);
    updateDoc(reqRef_f, {
      to_request: arrayRemove(remove),
    });
    this.refresh_screen();
  }

  renderItem = (item) => {
    const words = item.split("/");
    const type = words[words.length - 1];
    if (type == "friend") {
      const str = '"' + words[0] + '" sent you a friend request';
      return (
        <TouchableOpacity
          style={styles.item}
          onPress={() => Alert.alert("Information", str)}
        >
          <Text numberOfLines={1} style={{ color: "black", fontSize: 15 }}>
            {str}
          </Text>
          <View style={{ flexDirection: "row", marginLeft: 5 }}>
            <TouchableOpacity onPress={() => this.confirm_friend(words[0])}>
              <Icon name="checkcircleo" size={20} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => this.cancel_friend(words[0])}>
              <Icon name="closecircleo" size={20} style={{ marginLeft: 5 }} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      );
    } else if (type == "event") {
      const from = words[0];
      const contents = words[1].split(";");
      var event = contents[0],
        title = contents[1],
        startTime = contents[2],
        endTime = contents[3],
        location = contents[4],
        description = contents[5],
        color = contents[6],
        points = contents[7];

      const str = from + " invited you to an event!";
      const info =
        "Event type: " +
        event +
        "\n\n" +
        "Title: " +
        title +
        "\n\n" +
        "Start: " +
        startTime +
        "\n\n" +
        "End: " +
        endTime +
        "\n\n" +
        "Location: " +
        location +
        "\n\n" +
        "Description: " +
        description +
        "\n\n" +
        "Points: " +
        points +
        "\n";

      return (
        <TouchableOpacity
          style={styles.item2}
          onPress={() => Alert.alert("Information", info)}
        >
          <Text style={{ fontSize: 14 }}>{str}</Text>
          <View style={{ flexDirection: "row", marginLeft: 5 }}>
            <TouchableOpacity onPress={() => this.confirm_event(item, from)}>
              <Icon name="checkcircleo" size={20} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => this.cancel_event(item, from)}>
              <Icon name="closecircleo" size={20} style={{ marginLeft: 5 }} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      );
    } else if (type == "alert") {
      return (
        <View style={[styles.item, { justifyContent: "flex-start" }]}>
          <Text>{words[0]}</Text>
        </View>
      );
    }
  };

  render() {
    return (
      <View style={styles.container}>
        <Modal
          animationType="slide"
          visible={this.state.friend_modal}
          transparent={true}
          onRequestClose={() => {
            this.setState({ friend_modal: !this.state.friend_modal });
          }}
        >
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <View style={styles.modalView}>
              {this.state.loading ? (
                <ActivityIndicator />
              ) : (
                <FlatList
                  data={this.state.friend_requests}
                  renderItem={({ item }) => this.renderItem(item)}
                />
              )}
              <Button
                title="Back"
                onPress={() =>
                  this.setState({ friend_modal: !this.state.friend_modal })
                }
              />
            </View>
          </View>
        </Modal>
        {this.state.loading ? (
          <ActivityIndicator />
        ) : (
          <FlatList
            data={this.state.requests}
            renderItem={({ item }) => this.renderItem(item)}
          />
        )}
        <StatusBar style="auto" />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopColor: "black",
    borderTopWidth: 2,
  },
  item: {
    backgroundColor: "orange",
    padding: 10,
    marginTop: 10,
    width: "95%",
    alignSelf: "center",
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    borderRadius: 20,
  },
  item2: {
    backgroundColor: "orange",
    padding: 10,
    marginTop: 10,
    width: "95%",
    alignSelf: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    borderRadius: 20,
  },
  modalView: {
    flex: 6,
    backgroundColor: "white",
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    margin: 20,
    marginTop: 100,
    marginBottom: 100,
    width: "80%",
    height: "100%",
  },
});
