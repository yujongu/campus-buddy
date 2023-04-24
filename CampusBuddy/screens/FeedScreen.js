import { useEffect, useState, useContext } from "react";
import { StyleSheet, Image, FlatList, View, Pressable } from "react-native";
import ThemeContext from "../components/ui/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";
import LogoBanner from "../assets/LogoBanner.png";
import LogoBannerWhite from "../assets/LogoBannerWhite.png";
import FeedItem from "../components/FeedItem";
import { auth, getFeed } from "../firebaseConfig";
import AntDesignicons from "react-native-vector-icons/AntDesign";
import { Colors } from "../constants/colors";
export default function FeedScreen({ navigation, route }) {
  const theme = useContext(ThemeContext);

  const LogoImg = theme.theme == "light" ? LogoBanner : LogoBannerWhite;

  const [feedData, setFeedData] = useState([]);
  useEffect(() => {
    const getFeedData = async (currUserUid, currUserEmail) => {
      const fData = await getFeed(currUserUid, currUserEmail);
      setFeedData(fData);
      return fData;
    };

    getFeedData(auth.currentUser?.uid, auth.currentUser?.email);
  }, []);

  const navigateToLeaderboardPage = () => {
    navigation.navigate("LeaderboardScreen");
    // navigation.navigate("FeedDetails", {
    //   navigation,
    //   eventId,
    //   userId,
    //   profilePic,
    //   title,
    //   description,
    //   location,
    //   startTime,
    //   endTime,
    //   color,
    //   pointValue,
    //   category,
    //   eventMandatory,
    // });
  };

  return (
    <SafeAreaView style={[{ flex: 1, backgroundColor: theme.background }]}>
      {/* <StatusBar style={theme.statusBarColor} /> */}
      <Image
        source={LogoImg}
        style={{
          width: null,
          resizeMode: "contain",
          height: 30,
          marginBottom: 10,
          width: 250,
          alignSelf: "center",
        }}
      />
      <Pressable
        style={{
          position: "absolute",
          right: 20,
          top: 40,
          backgroundColor: Colors.grey,
          padding: 10,
          borderRadius: "50%",
        }}
        onPress={() => {
          navigateToLeaderboardPage();
        }}
      >
        <AntDesignicons name="Trophy" size={30} />
      </Pressable>

      <FlatList
        data={feedData}
        renderItem={({ item }) => (
          <FeedItem
            navigation={navigation}
            eventId={item.id}
            userId={item.userId}
            profilePic={item.profilePic}
            title={item.title}
            description={item.description}
            location={item.location}
            startTime={item.startTime}
            endTime={item.endTime}
            color={item.color}
            pointValue={item.pointValue}
            category={item.category}
            eventMandatory={item.eventMandatory}
          />
        )}
        keyExtractor={(item) => item.id}
      />
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
