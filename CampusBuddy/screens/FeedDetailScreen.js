import { useContext, useEffect, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Animated,
  FlatList,
  Modal,
} from "react-native";
import ThemeContext from "../components/ui/ThemeContext";
import { SafeAreaView, useSafeAreaFrame } from "react-native-safe-area-context";
import BackIcon from "react-native-vector-icons/Feather";
import { Colors } from "../constants/colors";
import defaultProfile from "../assets/defaultProfile.png";
import Ant from "react-native-vector-icons/AntDesign";
import FontAwesome from "react-native-vector-icons/FontAwesome";

import {
  JSClock,
  jsDateToDate,
  reverseJSGetDateClock,
} from "../helperFunctions/dateFunctions";
import {
  auth,
  db,
  fetchProfilePicture,
  getUserId,
  getUsername,
} from "../firebaseConfig";
import {
  arrayRemove,
  arrayUnion,
  doc,
  getDoc,
  increment,
  onSnapshot,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { Button } from "react-native-elements";
import { TextInput } from "react-native-gesture-handler";

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

  const [comments, setComments] = useState([]);
  const [liked, setLiked] = useState(false);
  const [numLike, setNumlike] = useState(0);
  const [numComments, setNumcomments] = useState(0);
  const [expand, setExpand] = useState(true);
  const [showCOC, setShowcoc] = useState(false);
  const [modal, setModal] = useState(false);
  const [profile, setProfile] = useState();
  const [profile_comment, setCProfile] = useState();
  const [current_prof, setCurrent] = useState();

  const incrementLike = async () => {
    if (liked) {
      const docRef = doc(db, "like_comment", eventId);
      const docSnap = await getDoc(docRef);
      await updateDoc(docRef, {
        total_likes: increment(-1),
        likes: arrayRemove(auth.currentUser?.email),
      });
    } else {
      const docRef = doc(db, "like_comment", eventId);
      const docSnap = await getDoc(docRef);
      await updateDoc(docRef, {
        total_likes: increment(1),
        likes: arrayUnion(auth.currentUser?.email),
      });
    }
    setLiked(!liked);
  };

  const loadmyprofile = async (item) => {
    console.log(item)
    const uid = await getUserId(item);
    const data = await fetchProfilePicture(uid);
    if (data != null) {
      setProfile(data)
    }
  }

  const loadProfile = async (item) => {
    // console.log(item);
    const uid = await getUserId(item);
    const data = await fetchProfilePicture(uid);
    if (data != null) {
      setCProfile(data)
    }
  };

  const renderItem = ({ item }) => {
    var check = item.item.coc.length > 0;
    return (
      <View style={{flex: 1,flexDirection: 'column'}}>
          {check ? (
            <View style={{ flexDirection: "column" }}>
              <View style={{ flexDirection: "row" }}>
                {profile != null ? (
                <Image
                  source={{ uri: profile }}
                  style={{ width: 40, height: 40, borderRadius: 50 }}
                />
              ) : (
                <Image
                  source={require("../assets/user.png")}
                  style={{ width: 40, height: 40, borderRadius: 50 }}
                />
              )}
                <View style={{ marginLeft: 10, justifyContent: "center" }}>
                  <Text style={{ fontSize: 14 }}>{item.item.user}</Text>
                  <Text style={{ fontWeight: "bold", fontSize: 20 }}>
                    {item.item.comment}
                  </Text>
                </View>
              </View>
              {!showCOC ? (
                <Text
                  style={{ marginLeft: 10, marginTop: 5 }}
                  onPress={() => setShowcoc(!showCOC)}
                >
                  See more comments.
                </Text>
              ) : (
                <Text
                  style={{ marginLeft: 10, marginTop: 5 }}
                  onPress={() => setShowcoc(!showCOC)}
                >
                  Collapse comments.
                </Text>
              )}
            </View>
          ) : (
            //when no coc
            // <View
            //   key={item.item}
            //   style={{ flexDirection: "row", alignItems: "center" , marginTop: 10}}
            // >
            //   {profile == null ? (
            //     <Image
            //       source={{ uri: profile }}
            //       style={{ width: 40, height: 40, borderRadius: 50 }}
            //     />
            //   ) : (
            //     <Image
            //       source={require("../assets/user.png")}
            //       style={{ width: 40, height: 40, borderRadius: 50 }}
            //     />
            //   )}
            //   <View style={{ marginLeft: 10 }}>
            //     <Text style={{ fontSize: 14 }}>{item.item.user}</Text>
            //     <Text style={{ fontSize: 20, fontWeight: "bold" }}>
            //       {item.item.comment}
            //     </Text>
            //   </View>
            // </View>
          )}
          {showCOC && check ? (
            <View style={{ marginLeft: 20 }}>
              {item.item.coc.map((comment) => {
                loadProfile(comment.user);
                // loadmyprofile(item.item.user);
                return (
                  <View
                    key={comment}
                    style={{ flexDirection: "row", alignItems: "center" }}
                  >
                    {profile_comment != null ? (
                      <Image
                        source={{ uri: profile_comment }}
                        style={{ width: 40, height: 40, borderRadius: 50 }}
                      />
                    ) : (
                      <Image
                        source={require("../assets/user.png")}
                        style={{ width: 40, height: 40, borderRadius: 50 }}
                      />
                    )}
                    <View style={{ marginLeft: 10 }}>
                      <Text style={{ fontSize: 11 }}>{comment.user}</Text>
                      <Text style={{ fontSize: 15, fontWeight: "bold" }}>
                        {comment.comment}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : null}
       
      </View>
    );
  };

  const load_data = async () => {
    const docRef = doc(db, "like_comment", eventId);

    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      await setDoc(docRef, {
        likes: arrayUnion(),
        comments: arrayUnion(),
        total_likes: 0,
        total_comments: 0,
      });
    } else {
      onSnapshot(docRef, (doc) => {
        const comments = doc.data()["comments"];
        const likes = doc.data()["likes"];
        const tlikes = doc.data()["total_likes"];
        const tcomments = doc.data()["total_comments"];
        setNumlike(tlikes);
        setComments(comments);
        setNumcomments(tcomments);
        likes.forEach((user) => {
          if (user == auth.currentUser?.email) {
            setLiked(true);
          }
        });
      });
    }
  };

  const load_current_user_profile = async () => {
    const data = await fetchProfilePicture(auth.currentUser?.uid);
    if (data != null) {
      setCurrent(data);
    }
  }

  useEffect(() => {
    load_data();
    load_current_user_profile();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modal}
        onRequestClose={() => {
          setModal(!modal);
        }}
      >
        <View
          style={{
            height: "55%",
            marginTop: "auto",
            backgroundColor: "#ffebcd",
          }}
        >
          <FlatList
            data={comments}
            renderItem={(item) => {
              loadProfile(item.item.user)
              renderItem({ item })
            }}
          />
          <View style={{backgroundColor: 'gray', borderRadius: 50, flexDirection: 'row', width: '100%'}}>
            {
              current_prof != null ?
              (
                <View style={{flex: 1}}>
                  <Image
                    source={{ uri: current_prof }}
                    style={{ width: 40, height: 40, borderRadius: 50 }}
                  />
                </View>
              ) : (
                <View style={{flex: 1 }}>
                  <Image
                    source={require("../assets/user.png")}
                    style={{ width: 40, height: 40, borderRadius: 50}}
                  />
                </View>
              )
            }
            <TextInput
              placeholder="Enter a comment..."
              style={{marginLeft: 10, backgroundColor: 'white', borderRadius: 50, flex: 10}}
            />
            <View style={{flex: 1}}>
              <TouchableOpacity>
                <Text>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
          <Button
            style={{ position: "absolute", bottom: 0 }}
            title="close"
            onPress={() => setModal(!modal)}
          />
        </View>
      </Modal>
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
        <View style={{ flexDirection: "column", padding: 10 }}>
          <View style={{ flexDirection: "row" }}>
            <Text style={{ fontSize: 20 }}>{numLike}</Text>
            <TouchableOpacity
              style={{ marginLeft: 5 }}
              onPress={() => incrementLike()}
            >
              {liked ? (
                <Ant name="like1" size={25} color={"black"} />
              ) : (
                <Ant name="like2" size={25} color={"black"} />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={{ marginLeft: 10 }}
              onPress={() => setModal(!modal)}
            >
              <FontAwesome name="comment-o" size={25} color={"black"} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => setModal(!modal)}>
            <Text style={{ top: 10, fontSize: 15 }}>
              Comments ({numComments}){" "}
            </Text>
          </TouchableOpacity>
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
