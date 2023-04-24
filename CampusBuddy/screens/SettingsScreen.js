// Import React and Component
import React, {useState, useEffect, useRef} from 'react';
import { db,auth } from '../firebaseConfig'
import HomeScreen from "../BottomTabContainer";
import {
  StyleSheet,
  TextInput,
  View,
  Text,
  Switch,
  TouchableOpacity,
  ScrollView,
  Button,
} from 'react-native';
import {
  updateDoc,
  doc,
  arrayRemove,
  collection,
  where,
  getDoc,
  getDocs,
  query,
  onSnapshot,
  arrayUnion } from "firebase/firestore";

export default function SettingsScreen({ navigation, route })  {
  const [newId, setNewId] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [id, setId] = useState("");
  const [isCalendarPublic, setCalendar] = useState(null);
  const [isPointsPublic, setPoints] = useState(null);
  const toggleCalendarSwitch = () => {
    setCalendar(current => !current);
  }

  const togglePointsSwitch = () => {
    setPoints(current => !current);
  }


  const handleChangeId = async () => {
    try {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      const userData = userDocSnap.data();
  
  
      // Check if new id already exists
      const querySnapshot = await getDocs(query(collection(db, 'users'), where('id', '==', newId)));
      if (!querySnapshot.empty) {
        alert('Username already exists');
        return;
      }
  
      await updateDoc(userDocRef, { id: newId });
      console.log('username updated successfully.');
      alert('Username updated successfully');
    } catch (error) {
      console.error('Error updating username:', error);
    }
  };

  const handleChangePassword = () => {
    const userDocRef = doc(db, "users", auth.currentUser.uid);
    updateDoc(userDocRef, { password: newPassword })
      .then(() => {
        console.log("Password updated successfully.");
      })
      .catch((error) => {
        console.error("Error updating password:", error);
      });
  }

  const handleGoBack = () => {
    const userDocRef = doc(db, "users", auth.currentUser.uid);
    updateDoc(userDocRef, { points_privacy: isPointsPublic, calendar_privacy: isCalendarPublic })
      .then(() => {
        console.log("Points privacy updated successfully to", isPointsPublic);
      })
      .catch((error) => {
        console.error("Error updating points privacy:", error);
      });
    navigation.navigate("Home");
  }

  useEffect(() => {
    const fetchData = async () => {
      const res = await getDoc(doc(db, "users", auth.currentUser.uid));
      if (res != null) {
        setId(res.data().id);
        setCalendar(res.data().calendar_privacy);
        setPoints(res.data().points_privacy);
      } else {
        console.log("No such document!");
      }
};
    
  fetchData();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <View style={{width: '70%', height:'70%'}}>
        <Text style={{
          paddingBottom:30,
          fontSize: 20,
          fontWeight: "bold",
          textAlign: "center",
          }}>
        Settings
        </Text>
        <Text style={{
          paddingVertical:5,
          paddingLeft:10,
          fontSize: 12}}
          >
          Username
        </Text>
        <View style={styles.row}>
        <TextInput
        style={styles.inputStyle}
        placeholder={id}
        value={newId}
        onChangeText={(text) => setNewId(text)}
        />
        <TouchableOpacity
          style={styles.editButtonStyle}
          activeOpacity={0.5}
          onPress={handleChangeId}>
          <Text style={styles.buttonTextStyle}>Save</Text>
        </TouchableOpacity>
        </View>
        <Text style={{
          paddingTop:20,
          paddingBottom:5,
          paddingLeft:10,
          fontSize: 12}}
          >
          Password
        </Text>
        <View style={styles.row}>
        <TextInput
        style={styles.inputStyle}
        value={newPassword}
        placeholder={"*********"}
        secureTextEntry={true}
        onChangeText={(text) => setNewPassword(text)}
        />
        <TouchableOpacity
          style={styles.editButtonStyle}
          activeOpacity={0.5}
          onPress={handleChangePassword}>
          <Text style={styles.buttonTextStyle}>Save</Text>
        </TouchableOpacity>
        </View>
        <View style={{
          flexDirection: "row",
          alignItems: "center",
          paddingLeft: 20
          }}>
          <Text style={{
            paddingTop:30,
            paddingBottom:5,
            paddingLeft:40,
            paddingRight: 10,
            fontSize: 12}}
            >
            Calendar Public:
          </Text>
          <Switch
            trackColor={{false: '#767577', true: '#477A74'}}
            thumbColor={isCalendarPublic ? '#DFE0DF' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleCalendarSwitch}
            value={isCalendarPublic}
            style={{
              marginTop:20,
            }}
          />
        </View>
        <View style={{
          flexDirection: "row",
          alignItems: "center",
          paddingLeft: 35
          }}>
          <Text style={{
            paddingTop:30,
            paddingBottom:5,
            paddingLeft:40,
            paddingRight: 10,
            fontSize: 12}}
            >
            Points Public:
          </Text>
          <Switch
            trackColor={{false: '#767577', true: '#477A74'}}
            thumbColor={isPointsPublic ? '#DFE0DF' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            onValueChange={togglePointsSwitch}
            value={isPointsPublic}
            style={{
              marginTop:20,
            }}
          />
        </View>
        <TouchableOpacity
          style={styles.buttonStyle}
          activeOpacity={0.5}
          onPress={() => handleGoBack()}>
          <Text style={styles.buttonTextStyle}>Go Back</Text>
        </TouchableOpacity>

      </View>

    </View>
  );
};

const styles = StyleSheet.create({
    SectionStyle: {
      flexDirection: 'row',
      alignItems: 'center',
      height: 40,
      marginTop: 20,
      marginLeft: 35,
      marginRight: 35,
      margin: 10,
    },
    buttonStyle: {
      backgroundColor: '#477A74',
      borderWidth: 0,
      color: '#FFFFFF',
      borderColor: '#2F4858',
      height: 40,
      alignItems: 'center',
      borderRadius: 30,
      marginLeft: 35,
      marginRight: 35,
      marginTop: 40,
      marginBottom: 20,
    },
    buttonTextStyle: {
      color: '#FFFFFF',
      paddingVertical: 10,
      fontSize: 16,
    },
    inputStyle: {
      color: 'black',
      height: 40,
      width: "70%",
      paddingLeft: 15,
      paddingRight: 15,
      borderWidth: 1,
      borderRadius: 30,
      borderColor: '#2F4858',
      fontSize:16
    },
    errorTextStyle: {
      color: 'red',
      textAlign: 'center',
      fontSize: 14,
    },
    successTextStyle: {
      color: 'black',
      textAlign: 'center',
      fontSize: 18,
      padding: 30,
    },
    row: {
      flexDirection: "row",
    },
    editButtonStyle: {
      backgroundColor: '#477A74',
      borderWidth: 0,
      color: '#FFFFFF',
      borderColor: '#2F4858',
      height: 40,
      alignItems: 'center',
      borderRadius: 30,
      marginLeft: 15,
      marginRight: 35,
      width: "20%"
    },
  });