import { StatusBar } from "expo-status-bar";
import { Button, StyleSheet, Text, SafeAreaView, TextInput, View, Modal, Alert, TouchableOpacity, FlatList, ActivityIndicator } from "react-native";
import { auth, db, userSchedule } from "../firebaseConfig"
import { updateDoc, doc, arrayRemove, onSnapshot, arrayUnion, FieldValue, Firestore } from "firebase/firestore";
import { useState, useEffect } from "react";

export default function FriendScreen({ navigation, route }) {
  const [list, setList] = useState([]);
  const [fav, setFav] = useState([]);

 
  useEffect(() => {
    var data = []
    const subscriber = onSnapshot(doc(db, "friend_list", auth.currentUser?.email), (doc) => {
      if(doc.data()['friends'] !== null){
        doc.data()['friends'].map((temp) => {
            data.push(temp)
        })
      }
      setList(data)
    })
  }, []);
  
  const removeFriend = (item) => {
    const me = doc(db, "friend_list", auth.currentUser?.email)
    const friend = doc(db, "friend_list", item.user)
    console.log(item)
    try{
      updateDoc(me, {
        friends: arrayRemove(item)
      })
      updateDoc(friend, {
        friends: arrayRemove(auth.currentUser?.email)
      })

      alert(item+" has been unfriended")
    } catch (e) {
      console.error("Cancel friend: ", e);
    }
  }

  const renderItem = (item) =>{
    return (
      <View style={styles.item}>
        <TouchableOpacity onPress={(() => navigation.navigate("user_profile", {
          email: item.user
        }))}>
          <Text style={{color: 'black', fontSize: 15}}>{item.user}</Text>
        </TouchableOpacity>
        <View style={{flexDirection: "row"}}>
          <TouchableOpacity onPress={() => Alert.alert("Unfriend", "Do you really want to unfriend?", [
            {text: 'Yes', onPress: () => removeFriend(item)},
            {text: 'Cancel', style: 'cancel'}
          ], {cancelable: false})}>
            <Text>Unfriend</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
        {/* <Text>{"\n\n"+auth.currentUser?.uid}</Text>
        <Text>Current Id: {id}</Text> */}
        <Text>{"\n\n"}Favorites:</Text>
        <View>
            {
                fav && fav.length ?
                <FlatList 
                    data={fav}
                    renderItem={({item}) => 
                    renderItem(item)
                    }
                />
                :
                <Text>No favorite friends yet</Text>
            }
        </View>
        <Text>{"\n\n"}Friends:</Text>
        <View>
        {
                
                <FlatList 
                    data={list}
                    renderItem={({item}) => 
                    renderItem(item)
                    }
                />
                
            }
        </View>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    marginTop: StatusBar.currentHeight || 0
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
    backgroundColor: 'orange',
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    width: '80%',
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
});