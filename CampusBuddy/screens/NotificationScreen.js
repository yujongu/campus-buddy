import { arrayRemove, doc, onSnapshot, updateDoc, arrayUnion, onSnapshotsInSync } from "@firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { async } from "@firebase/util";
import { StatusBar } from "expo-status-bar";
import { Component, useEffect, useState } from "react";
import { Button, Alert, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { FlatList } from "react-native";
import Icon from 'react-native-vector-icons/AntDesign'
import ThemeContext  from "../components/ui/ThemeContext";
import AntDesign from "react-native-vector-icons/AntDesign"
import { Modal } from "react-native";


export default class NotificationScreen extends Component{
  constructor() {
    super();
    this.state = {
      loading: true,
      noti: [],
      friend_request: [],
      friend_modal: false,
    }
  }

  confirm_friend(user) {
    const docRef = doc(db, "friend_list", auth.currentUser?.email)
    const docRef_to = doc(db, "friend_list", user)
    const remove_alert = doc(db, "requests", auth.currentUser?.email)
    const remove_to = doc(db, "requests", user)
    try {
      //add to own friend list
      updateDoc(docRef, {
        friends: arrayUnion({user: user, favorite: false})
      });
      //add to from_user's friend list
      updateDoc(docRef_to, {
        friends: arrayUnion({user: auth.currentUser?.email, favorite: false})
      })
      //remove to_request from user who sent the request
      updateDoc(remove_to, {
        to_request: arrayRemove(auth.currentUser?.email+"/"+"friend")
      })
      //remove from_request from target user
      updateDoc(remove_alert, {
        from_request: arrayRemove(user+"/"+"friend")
      })
      Alert.alert("Accepted","Now you guys are friends")
    } catch (e) {
      console.error("Adding friend: ", e);
    }
  }

  cancel_friend(user) {
    const remove_alert = doc(db, "requests", auth.currentUser?.email)
    const remove_to = doc(db, "requests", user)
    try{
      updateDoc(remove_alert, {
        from_request: arrayRemove(user+"/"+"friend")
      })
      updateDoc(remove_to, {
        to_request: arrayRemove(auth.currentUser?.email+"/"+"friend")
      })
      Alert.alert("Rejected","You rejected the friend request")
    } catch (e) {
      console.error("Cancel friend: ", e);
    }
  }

  refresh_screen() {
    this.setState({loading: true})
    setTimeout(() => {
      this.load_events()
      this.load_friend()
      this.setState({loading: false})
    }, 1000)
  }

  load_friend() {
    const subscriber = onSnapshot(doc(db, "requests", auth.currentUser?.email), (doc) => {
      const notis = [];
      notis.push(doc.data()['from_request'])
      this.setState({friend_request: notis[0]})
    })
  }

  load_events() {
    const subs = onSnapshot(doc(db, "events", auth.currentUser?.uid), (doc) => {
      let temp = [];
      if(doc.data() != undefined){
        doc.data()['event']
        .forEach(data => {
          if(data.startTime.toDate() <= new Date() && data.endTime.toDate() >= new Date()){
            const event = 
            "event/"+
            "Event title: " + data.title + "\n" +
            "Event location: " + data.location + "\n" +
            "Event point: " + data.point_value + "\n" +
            "Until event ends: " + 
            Math.floor((data.endTime.toDate() - new Date())/(1000*60*60))
            + " hour(s)"
            temp.push(event)
          }
        }
        )
      }
      this.setState({noti: temp})
    })
  }

  componentDidMount() {
    this.props.navigation.setOptions({
      headerRight: () => (
        <View style={{flexDirection: "row"}}>
          <TouchableOpacity style={{marginRight: 10}} onPress = {() => this.setState({friend_modal: !this.state.friend_modal})}>
            <AntDesign name = {"addusergroup"} size = {20} />
          </TouchableOpacity>
          <TouchableOpacity style={{marginRight: 10}} onPress = {() => this.refresh_screen()}>
            <AntDesign name = {"reload1"} size = {20} />
          </TouchableOpacity>
        </View>
        
      )
    })
    const subscriber = onSnapshot(doc(db, "requests", auth.currentUser?.email), (doc) => {
      const notis = [];
      notis.push(doc.data()['from_request'])
      this.setState({friend_request: notis[0]})
    })
    this.load_friend()
    this.load_events()
    this.setState({loading: false})
  }

  renderItem = (item) => {
    const words = item.split('/')
    if(words[1] == "friend"){
      return(
      <View style={styles.item}>
        <Text style={{color: 'black', fontSize: 15}}>{"\""+words[0] + "\" sent you a friend request"}</Text>
        <View style={{flexDirection: "row"}}>
          <TouchableOpacity onPress={() => this.confirm_friend(words[0])}>
            <Icon name="checkcircleo" size={20}/>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.cancel_friend(words[0])}>
            <Icon name="closecircleo" size={20} style={{marginLeft: 5}}/>
          </TouchableOpacity>
        </View>
      </View>
      );
    }else if(words[0] == "event"){
      return (
        <View style = {styles.item}>
          <Text>{words[1]}</Text>
        </View>
      )
    }
  }
  
    

  render() {
    return (
      <View style={styles.container}>
        <Modal 
          animationType="slide"
          visible={this.state.friend_modal}
        >
          <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <View style={{width: '100%', height: '80%'}}>
              {
                this.state.loading ?
                <ActivityIndicator />
                :
                <FlatList 
                  data={this.state.friend_request}
                  renderItem={({item}) => 
                    this.renderItem(item)
                  }
                />
              }
              <Button title="Back" onPress={() => this.setState({friend_modal: !this.state.friend_modal})}/>
            </View>
          </View>
        </Modal>
        {
          this.state.loading ?
          <ActivityIndicator />
          :
          <FlatList 
            data={this.state.noti}
            renderItem={({item}) => 
              this.renderItem(item)
            }
          />
        }
        <StatusBar style="auto" />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopColor: 'black',
    borderTopWidth: 2,
  },
  item: {
    backgroundColor: 'orange',
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    width: '90%',
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
});
