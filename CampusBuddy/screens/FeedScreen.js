import { useEffect, useState, useContext } from "react";
import {
  StyleSheet,
  Image,
  FlatList,
  Modal,
  Pressable,
  TouchableOpacity,
  View,
  Text,
  StatusBar,
  ScrollView,
  Platform
} from "react-native";

import ThemeContext from "../components/ui/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";
import LogoBanner from "../assets/LogoBanner.png";
import LogoBannerWhite from "../assets/LogoBannerWhite.png";
import FeedItem from "../components/FeedItem";
import { auth, db, getFeed, getMaybe } from "../firebaseConfig";
import Feather from "react-native-vector-icons/Feather";
import Material from "react-native-vector-icons/MaterialIcons";
import { Colors } from "../constants/colors";
import { ActivityIndicator } from "react-native";
import { RadioButton } from "react-native-paper";
import { doc, onSnapshot } from "firebase/firestore";
import AntDesignicons from "react-native-vector-icons/AntDesign";

export default function FeedScreen({ navigation, route }) {
  const theme = useContext(ThemeContext);
  const [modal, setModal] = useState(false);
  const [filter, setFilter] = useState(false);
  const [category, setCategory] = useState(null);
  const [maybe, setMaybe] = useState([]);

  const LogoImg = theme.theme == "light" ? LogoBanner : LogoBannerWhite;


  const [feedData, setFeedData] = useState([]);

  
  
  useEffect(() => {
    const docRef = doc(db, "events_maybe", auth.currentUser?.uid);
    const getFeedData = async (currUserUid, currUserEmail) => {
      const fData = await getFeed(currUserUid, currUserEmail);
      setFeedData(fData);
      return fData;
    };
    const snap = onSnapshot(docRef, (doc) => console.log(doc.data()))
    const getMaybeData = async (currUserUid, currUserEmail) => {
      const fData = await getMaybe(currUserUid, currUserEmail);
      setMaybe(fData);

      return fData;
    };

    getMaybeData(auth.currentUser?.uid, auth.currentUser?.email);
    getFeedData(auth.currentUser?.uid, auth.currentUser?.email);
    
  }, []);

  const renderItem = ({ item }) => {
    return (
      <View
        key={item.category}
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View style={ Platform.OS === 'ios' ? {borderWidth: 1, borderRadius: 100, margin: 5} : null}>
          <RadioButton
            value={item.category}
            status={category === item.category ? "checked" : "unchecked"}
            onPress={() => {
              if (category === item.category) {
                setCategory(null);
              } else {
                setCategory(item.category);
              }
            }}
          />
        </View>
        <Text style={{ fontSize: 15 }}>{item.category}</Text>
      </View>
    );
  }
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
      <Modal
        transparent={true}
        visible={modal}
        // onRequestClose={() => {
        //   setModal(!modal);
        // }}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            marginTop: 22,
          }}
        >
          <View
            style={{
              margin: 20,
              backgroundColor: "white",
              borderRadius: 20,
              alignItems: "center",
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 5,
              width: "80%",
              height: "80%",
            }}
          >
            <Text style={{ fontWeight: "bold", fontSize: 20 }}>
              Pending Event
            </Text>
            <FlatList
              style={{width: '80%', height: '100%'}}
              data={maybe.filter(
                (id, index, self) =>
                  index ===
                  self.findIndex((p) => p.id === id.id)
              )}
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
            <Pressable
              style={{
                marginHorizontal: 5,
                backgroundColor: Colors.fourth,
                padding: 10,
                borderRadius: 12,
                position: "absolute",
                bottom: 0,
              }}
              onPress={() => setModal(!modal)}
            >
              <Text style={{ fontSize: 18, color: "white" }}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
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
        <View style={{flexDirection: 'row'}}>
          <TouchableOpacity
            onPress={() => {
              setFilter(!filter);
            }}
          >
            <Feather name="filter" size={30} />
          </TouchableOpacity>

          <TouchableOpacity
            style={{ marginHorizontal: 3 }}
            onPress={() => {
              setModal(!modal);
              setFilter(false);
            }}
          >
            <Material name="pending-actions" size={30} />
          </TouchableOpacity>
          <TouchableOpacity
            style={{ marginHorizontal: 3 }}
            onPress={() => {
              navigateToLeaderboardPage();
            }}
          >
            <AntDesignicons name="Trophy" size={30} />
          </TouchableOpacity>
        </View>
      </View>
      {filter ? (
        <View
          style={{
            margin: 20,
            backgroundColor: "white",
            borderRadius: 20,
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Text style={{ fontWeight: "bold", fontSize: 15 }}>
            Choose category:
          </Text>
          {feedData.length > 0 ? (
            <FlatList
              data={feedData.filter(
                (category, index, self) =>
                  index ===
                  self.findIndex((p) => p.category === category.category)
              )}
              renderItem={(item) => renderItem(item)}
              showsHorizontalScrollIndicator={true}
              horizontal
            />
          ) : (
            <ActivityIndicator />
          )}
        </View>
      ) : null}
      <View
        style={{
          flexDirection: "row",
          position: "absolute",
          right: "2%",
          top: StatusBar.currentHeight,
        }}
      >
        {/* <TouchableOpacity
          onPress={() => {
            setFilter(!filter);
          }}
        >
          <Feather name="filter" size={30} />
        </TouchableOpacity>

        <TouchableOpacity
          style={{ marginHorizontal: 3 }}
          onPress={() => {
            setModal(!modal);
            setFilter(false);
          }}
        >
          <Material name="pending-actions" size={30} />
        </TouchableOpacity>
        <TouchableOpacity
          style={{ marginHorizontal: 3 }}
          onPress={() => {
            navigateToLeaderboardPage();
          }}
        >
          <AntDesignicons name="Trophy" size={30} />
        </TouchableOpacity> */}
      </View>

      <FlatList
        data={feedData}
        renderItem={({ item }) =>
          category !== null ? (
            category === item.category ? (
              
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
            ) : null
          ) : (
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
          )
        }
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
