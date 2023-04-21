import { useContext } from "react";
import { Pressable, StyleSheet, Text, View, Image } from "react-native";
import ThemeContext from "../components/ui/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";
import BackIcon from "react-native-vector-icons/Feather";
import { Colors } from "../constants/colors";
import defaultProfile from "../assets/defaultProfile.png";

import {
  JSClock,
  jsDateToDate,
  reverseJSGetDateClock,
} from "../helperFunctions/dateFunctions";

export default function FeedDetailScreen({ navigation, route }) {
  const theme = useContext(ThemeContext);
  const {
    eventId,
    userId,
    profilePic,
    title,
    description,
    location,
    startTime,
    endTime,
    color,
    pointValue,
    category,
    eventMandatory,
  } = route.params;

  const startDate = startTime.split(" ")[1].replace(",", "");
  const startMonth = startTime.split(" ")[0];
  const sTimeObj = reverseJSGetDateClock(startTime);
  const eTimeObj = reverseJSGetDateClock(endTime);
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flexDirection: "column" }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Pressable onPress={() => navigation.goBack()}>
            <BackIcon name="chevron-left" size={40} color="grey"></BackIcon>
          </Pressable>
          <Pressable
            style={{
              marginHorizontal: 16,
              backgroundColor: Colors.fourth,
              padding: 10,
              borderRadius: 12,
            }}
          >
            <Text style={{ fontSize: 18, color: "white" }}>Attend!</Text>
          </Pressable>
        </View>
        <View style={{ flexDirection: "column", marginTop: 10, padding: 10 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 38, fontWeight: 600, flex: 1 }}>
              {title}
            </Text>
            <View
              style={{
                borderWidth: 0.5,
                paddingHorizontal: 16,
                paddingVertical: 20,
                borderRadius: 16,
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 20, fontWeight: 600 }}>{startDate}</Text>
              <Text style={{ fontSize: 14 }}>{startMonth.substring(0, 3)}</Text>
            </View>
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            {profilePic ? (
              <Image source={{ uri: profilePic }} style={styles.profImg} />
            ) : (
              <Image source={defaultProfile} style={styles.profImg} />
            )}

            <View
              style={{
                flex: 1,
                flexDirection: "column",
                marginLeft: 20,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Text style={styles.rowLable}>Starts at:</Text>
                <Text style={styles.rowContent}>
                  {JSClock(sTimeObj, false)}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.rowLable}>Ends at:</Text>
                <Text style={styles.rowContent}>
                  {JSClock(eTimeObj, false)}
                </Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.rowLable}>Location:</Text>
                <Text style={styles.rowContent}>{location}</Text>
              </View>
            </View>
          </View>

          <Text style={{ fontSize: 20, marginTop: 16, fontWeight: 400 }}>
            {description}
          </Text>
        </View>

        <View>
          <Text>This is for comments and like container </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    margin: 4,
    borderRadius: 8,
  },
  profImg: {
    width: 70,
    height: 70,
    borderRadius: 15,
    margin: 5,
  },
  row: { flexDirection: "row", alignItems: "center", marginTop: 16 },
  rowLable: { fontSize: 16, flex: 1 },
  rowContent: { fontSize: 18, flex: 2 },
});
