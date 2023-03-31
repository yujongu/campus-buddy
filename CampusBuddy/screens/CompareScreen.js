import React, { useState } from 'react';
import { Component } from 'react';
import { View, Text, Button, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { ListItem, SearchBar } from "react-native-elements";
import { userList, to_request } from "../firebaseConfig";
import { auth } from "../firebaseConfig";


export default function CompareScreen({props, navigation}) {

  const [state, setState] = useState('');
  const [arrayholder, setArrayHolder] = useState('');
  const [compareResult, setCompareResult] = useState('');

  const compareSchedules = (props) => {
    //
    
  };

  const handleRequest = (email, user_ID) => {

  }
  
  // Item
  const Item = ({ title }) => {
    return (
      <View style={styles.item}>
        <Text>
          {title[1] + " " + title[3] + " (" + title[2] + ")"}
          {'\n'}
          {title[0]}
        </Text>
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => handleRequest(title[0], title[2])}
            style={styles.touchableOpacityStyle}>
            <Icon name="user-plus" size={25} />
        </TouchableOpacity>
      </View>
    );
  };

  // Awaiting user list
  const componentDidMount = async () => {
    const res = await userList();
    this.setState({data: res, arrayholder: res});
  }

  const renderItem = ({ item }) => <Item title={[item.email, item.first, item.id, item.last]} />;

  const searchFunction = (text) => {
    const updatedData = arrayholder.filter((item) => {
      const item_data = `${item.id.toUpperCase()})`;
      const text_data = text.toUpperCase();
      return item_data.indexOf(text_data) > -1;
    });
    setState({ data: updatedData, searchValue: text });
  };

  return (
    <View style={{ flex: 1, paddingTop: 50}}>
      <Button
        title = "Go Back"
        onPress = {() => navigation.navigate("Calendar")}
        />
      <Text style={styles.enter}>Enter schedule 1:</Text>
      <SearchBar 
          placeholder="Choose a user..."
          lightTheme
          round
          style={styles.searchBar}
          onChangeText={(text) => searchFunction(text)}
          autoCorrect={false}
      />
  
      <Text style={styles.enter}>Enter schedule 2:</Text>
      <SearchBar 
          placeholder="Choose a user..."
          lightTheme
          round
          style={styles.SearchBar}
          onChangeText={(text) => searchFunction(text)}
          autoCorrect={false}
      />
  
      <TouchableOpacity
        style={{ backgroundColor: '#CEB888', padding: 10, margin: 10 }}
        onPress={compareSchedules}
      >
      <Text style={styles.compareButton}>Compare Schedules</Text>
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
  
const styles = StyleSheet.create({
  container: {
    padding: 2,
  },
  enter: {
    fontSize: 16,
    marginTop: 25,
    alignSelf: "center",
    paddingTop: 1,
  },
  compareButton: {
    alignSelf: "center",
    padding: 1,
    color: 'white',
    fontWeight: 'bold' 
  },
  searchBar: {
    padding: 5, 
    color: '#000'
  }

});

