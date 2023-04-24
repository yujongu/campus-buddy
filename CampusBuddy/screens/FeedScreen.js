import { useEffect, useState, useContext } from "react";
import { StyleSheet, Image, FlatList } from "react-native";
import ThemeContext from "../components/ui/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";
import LogoBanner from "../assets/LogoBanner.png";
import LogoBannerWhite from "../assets/LogoBannerWhite.png";
import FeedItem from "../components/FeedItem";
import { auth, getFeed } from "../firebaseConfig";

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
        }}
      />
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
