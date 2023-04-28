import { Button, FlatList, StyleSheet, Text, View } from "react-native";
import React, { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { getLeaderboard } from "../firebaseConfig";
import LeaderboardItem from "../components/ui/LeaderboardItem";
import { Colors } from "../constants/colors";
import { ScrollView } from "react-native";
import { addGroupEvent, getGroupEvents } from "../firebaseConfig";

export default function GroupDetailsScreen({ navigation, route }) {
  // useEffect(() => {}, []);

  const { groupName, groupMembers } = route.params;
  const [ groupEvents, setGroupEvents ] = useState([]);

  // const groupEvents = getGroupEvents(groupName);

  const handleAddEvent = () => {
    // console.log('Hello world');
    addGroupEvent(groupName, "Testsdf event", 'test start', 'test end', 'desc', 'location')

  }

  useEffect(() => {
    const fetchEvents = async () => {
      const events = await getGroupEvents(route.params.groupName);
      setGroupEvents(events);
      console.log(groupEvents);
      console.log(groupMembers);
    };
    fetchEvents();
  }, [groupName]);


  return (
    <SafeAreaView
      style={{
        flex: 1,
      }}
    >
      <View style={{ margin: 10 }}>
        <View style={{ alignContent: "flex-start", flexDirection: "row" }}>
          <Button title="Back" onPress={() => navigation.goBack()} />
        </View>
        <View style={{ alignContent: "center", marginBottom: 10 }}>
          <Text
            adjustsFontSizeToFit={true}
            numberOfLines={1}
            style={{ fontSize: 30, margin: 10, fontWeight: 500 }}
          >
            {groupName}
          </Text>
        </View>
        <View>
          <View>
            <Text style={{ fontSize: 25 }}>Members:</Text>
          </View>
          <ScrollView style={{ height: "45%"}}>
            {groupMembers.map((item) => {
              return (
                <View
                  style={{
                    backgroundColor: Colors.secondary,
                    padding: 8,
                    margin: 10,
                    borderRadius: 10,
                  }}
                >
                  {item.nickname == "" ? (
                    <Text style={{ fontSize: 18 }}>{item.user}</Text>
                  ) : (
                    <Text style={{ fontSize: 20 }}>{item.nickname}</Text>
                  )}
                </View>
              );
            })}
          </ScrollView>
          <View style={styles.container}>
            <Text style={{ fontSize: 25 }}>Group Events</Text>
          </View>
          {/* <View>
            <ScrollView >
              {groupEvents.map((item) => {
                return (
                  <View
                    style={{
                      backgroundColor: Colors.secondary,
                      padding: 8,
                      margin: 10,
                      borderRadius: 10,
                  }}>
                    <Text>Title: {item.details.title}</Text>
                    <Text>Description: {item.details.description}</Text>
                  </View>
                )
              })}
            </ScrollView>
            <Button 
              title='Add group event'
              onPress={handleAddEvent}
            />
          </View> */}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
