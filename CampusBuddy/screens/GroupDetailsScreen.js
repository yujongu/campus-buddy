import { Button, FlatList, StyleSheet, Text, View } from "react-native";
import React, { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { getLeaderboard } from "../firebaseConfig";
import LeaderboardItem from "../components/ui/LeaderboardItem";
import { Colors } from "../constants/colors";
import { ScrollView } from "react-native";

export default function GroupDetailsScreen({ navigation, route }) {
  useEffect(() => {}, []);

  const { groupName, groupMembers } = route.params;
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
          <ScrollView style={{ height: "50%" }}>
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
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
