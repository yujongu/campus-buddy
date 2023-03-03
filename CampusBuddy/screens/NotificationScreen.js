import { arrayRemove, doc, onSnapshot, updateDoc, arrayUnion } from "@firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { async } from "@firebase/util";
import { StatusBar } from "expo-status-bar";
import { Component, useEffect, useState } from "react";
import { Button, Alert, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { FlatList } from "react-native";
import Icon from 'react-native-vector-icons/AntDesign'



export default class NotificationScreen extends Component{
  constructor() {
    super();
    this.state = {
      loading: true,
      noti: []
    }
  }

  confirm_friend(user) {
    const docRef = doc(db, "friend_list", auth.currentUser?.email)
    const docRef_to = doc(db, "friend_list", user)
    const remove_alert = doc(db, "requests", auth.currentUser?.email)
    const remove_to = doc(db, "requests", user)
    try {
      console.log(user)
      console.log(auth.currentUser?.email)
      //add to own friend list
      updateDoc(docRef, {
        friends: arrayUnion({user: user, group: []})
      });
      //add to from_user's friend list
      updateDoc(docRef_to, {
        friends: arrayUnion({user: auth.currentUser?.email, group: []})
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

  componentDidMount() {
    const subscriber = onSnapshot(doc(db, "requests", auth.currentUser?.email), (doc) => {
      const notis = [];
      notis.push(doc.data()['from_request'])
      this.setState({noti: notis[0]})
      this.setState({loading: false})
    })
    return () => subscriber();
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
    }
  }
  
    

  render() {
    return (
      <View style={styles.container}>
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
