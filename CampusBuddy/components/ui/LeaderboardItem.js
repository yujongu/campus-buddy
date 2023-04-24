import { useContext } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { Pressable } from "react-native";
import ThemeContext from "./ThemeContext";
import defaultProfile from "../../assets/defaultProfile.png";
import { Colors } from "../../constants/colors";
export default function LeaderboardItem({
  navigation,
  rank,
  userToken,
  profilePic,
  userId,
  point,
}) {
  const theme = useContext(ThemeContext);

  let rankVal = rank + 1;

  const sayHi = () => {
    console.log("Hi", userId);
  };
  return (
    <Pressable onPress={sayHi} style={{ margin: 10 }}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View style={{ margin: 10, flex: 1 }}>
          <Text style={{ fontSize: 30 }}>{rankVal}</Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            padding: 5,
            backgroundColor: Colors.grey,
            borderRadius: 15,
            flex: 5,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {profilePic ? (
              <Image source={{ uri: profilePic }} style={styles.profImg} />
            ) : (
              <Image source={defaultProfile} style={styles.profImg} />
            )}
            <Text style={{ fontSize: 20, marginLeft: 10 }}>{userId}</Text>
          </View>

          <Text style={{ fontSize: 20, marginRight: 10, fontWeight: 500 }}>
            {point}
          </Text>
        </View>
      </View>
    </Pressable>
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
    width: 40,
    height: 40,
    borderRadius: 15,
    margin: 5,
  },
});
