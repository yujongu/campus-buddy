import { StatusBar } from "expo-status-bar";
import { Button, StyleSheet, Text, TextInput, View, Modal, TouchableOpacity, FlatList, ActivityIndicator } from "react-native";
import { auth, db, userSchedule } from "../firebaseConfig"
import { Button, StyleSheet, Text, TextInput, View } from "react-native";
import { auth, db } from "../firebaseConfig"
import { EmailAuthProvider } from "firebase/auth";
import { signInWithEmailAndPassword } from "firebase/auth";
import { signOut } from "firebase/auth"
import { updateDoc, doc } from "firebase/firestore";
import { useState, useEffect } from "react";
import { onSnapshot } from "firebase/firestore";

export default function ProfileScreen({ navigation, route }) {
  const [newId, setNewId] = useState("");
  const [id, setId] = useState("");
  const [visible, setVisible] = useState(false);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        navigation.popToTop();
      })
  }

  

  const handleChangeId = () => {
    const userDocRef = doc(db, "users", auth.currentUser.uid);
    updateDoc(userDocRef, { id: newId })
      .then(() => {
        console.log("username updated successfully.");
      })
      .catch((error) => {
        console.error("Error updating username:", error);
      });
  }

  const handleDeleteAccount = () => {
    const user = auth.currentUser;
    const credential = EmailAuthProvider.credential(user.email, password);
  
    signInWithEmailAndPassword(auth, user.email, password)
      .then((userCredential) => {
        userCredential.user.delete()
          .then(() => {
            // Account deleted successfully
            navigation.popToTop();
          })
          .catch((error) => {
            alert("Wrong password entered");
            console.error("Error deleting account:", error);
          });
      })
      .catch((error) => {
        alert("Wrong password entered");
        console.error("Error reauthenticating user:", error);
      });
  };
  useEffect(() => {
    const subscriber = onSnapshot(doc(db, "friend_list", auth.currentUser?.email), (doc) => {
      setList(doc.data()['friends'])
      setLoading(false)
    })
    const userDocRef = doc(db, "users", auth.currentUser.uid);
    const unsubscribe = onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        setId(doc.data().id);
      } else {
        console.log("No such document!");
      }
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const renderItem = (item) =>{
    return (
      <View style={styles.item}>
        <Text style={{color: 'black', fontSize: 15}}>{item}</Text>
        <View style={{flexDirection: "row"}}>
          <TouchableOpacity onPress={() => alert("Unfriended")}>
            <Text>Unfriend</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Modal
          animationType="slide"
          transparent={true}
          visible={visible}
          onRequestClose={() => {
            setVisible(!visible)
          }}
        >
          <View
            style={{
              flex: 1,
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View style={{width: '70%', height:'70%', backgroundColor: 'blue'}}>
              {
                loading ?
                <ActivityIndicator />
                :
                <FlatList 
                  data={list}
                  renderItem={({item}) => 
                    renderItem(item)
                  }
                />
              }
            </View>
          </View>
      </Modal>
      <Text>{auth.currentUser?.uid}</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter new Username"
        value={newId}
        onChangeText={(text) => setNewId(text)}
      />
      <Text>Current Id: {id}</Text>
      <Button title="Change Username" onPress={handleChangeId} />
      <Button title="Sign Out" onPress={handleSignOut} />
      <Button title="Friend list" onPress={() => setVisible(true)} />
      <TextInput
        style={styles.input}
        placeholder="Enter Password"
        value={password}
        onChangeText={(text) => setPassword(text)}
        secureTextEntry={true}
      />
      <Button title="Delete Account" onPress={handleDeleteAccount} />
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
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
    width: '90%',
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
});
