import React, { useState } from 'react';
import { View, Text, Button, TextInput, TouchableOpacity } from 'react-native';
//import firebase from 'firebase/app';
//import 'firebase/database';

export default function CompareScreen({navigation}) {
  const [schedule1, setSchedule1] = useState('');
  const [schedule2, setSchedule2] = useState('');
  const [compareResult, setCompareResult] = useState('');
  //const { navigate } = this.props.navigation;

  const compareSchedules = (props) => {
    // Retrieve schedules from Firebase Realtime Database
    // firebase
    //   .database()
    //   .ref('schedules')
    //   .once('value')
    //   .then((snapshot) => {
    //     const schedules = snapshot.val();

    //     // Here you can write your logic to compare the two schedules
    //     // and set the result using the setCompareResult function
    //   })
    //   .catch((error) => {
    //     console.error(error);
    //   });
    
  };

  //helloworld() {}

  
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Button
        title = "Go Back"
        onPress = {() => navigation.navigate("Calendar")}
        >
        </Button>
      <Text>우엉</Text>
      <Text>Enter schedule 1:</Text>
      <TextInput
        style={{ borderWidth: 1, padding: 5, margin: 10 }}
        onChangeText={setSchedule1}
        value={schedule1}
      />
  
      <Text>Enter schedule 2:</Text>
      <TextInput
        style={{ borderWidth: 1, padding: 5, margin: 10 }}
        onChangeText={setSchedule2}
        value={schedule2}
      />
  
      <TouchableOpacity
        style={{ backgroundColor: 'blue', padding: 10, margin: 10 }}
        onPress={compareSchedules}
      >
      <Text style={{ color: 'white', fontWeight: 'bold' }}>Compare Schedules</Text>
      </TouchableOpacity>
  
      {compareResult !== '' && (
        <View style={{ margin: 10 }}>
          <Text>Result:</Text>
          <Text>{compareResult}</Text>
        </View>
      )}
    </View>
  );
}
  


