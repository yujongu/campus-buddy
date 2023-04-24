import { Button, FlatList, StyleSheet, Text, View } from "react-native";
import React, { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { getLeaderboard } from "../firebaseConfig";
import LeaderboardItem from "../components/ui/LeaderboardItem";

export default function LeaderboardScreen({ navigation, route }) {
  const [pointData, setPointData] = useState([]);
  useEffect(() => {
    const getPData = async () => {
      const pData = await getLeaderboard();
      pData.sort((a, b) => b.point - a.point);
      setPointData(pData);
    };
    getPData();
  }, []);

  return (
    <SafeAreaView
      style={{
        flex: 1,
      }}
    >
      <View style={{}}>
        <View style={{ marginBottom: 10 }}>
          <View style={{ position: "absolute", left: 15, top: 5 }}>
            <Button title="Back" onPress={() => navigation.goBack()} />
          </View>

          <Text style={{ alignSelf: "center", fontSize: 25, fontWeight: 500 }}>
            Leaderboard
          </Text>
          <View
            style={{
              borderBottomWidth: 1,
              marginTop: 20,
              width: "95%",
              alignSelf: "center",
            }}
          />
        </View>

        <FlatList
          data={pointData}
          renderItem={({ item, index }) => (
            <LeaderboardItem
              key={item.userToken}
              rank={index}
              navigation={navigation}
              userToken={item.userToken}
              profilePic={item.profilePic}
              userId={item.userId}
              point={item.point}
            />
          )}
          keyExtractor={(item) => item.userToken}
        />
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
