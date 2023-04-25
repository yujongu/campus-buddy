import { StatusBar } from "expo-status-bar";
import {
  Image,
  Switch,
  Button,
  StyleSheet,
  Text,
  Pressable,
  TextInput,
  View,
  Modal,
  Alert,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  ScrollView
} from "react-native";
import Setting from 'react-native-vector-icons/Feather';
import Img_icon from 'react-native-vector-icons/Ionicons';
import Fri_icon from 'react-native-vector-icons/FontAwesome5';
import Ant from 'react-native-vector-icons/AntDesign'
import Entypo from 'react-native-vector-icons/Entypo'
import { auth, db, fetchProfilePicture, userSchedule } from "../firebaseConfig";
import { EmailAuthProvider } from "firebase/auth";
import { signInWithEmailAndPassword } from "firebase/auth";
import Block from "react-native-vector-icons/Entypo";
import { signOut } from "firebase/auth";
import {
  updateDoc,
  doc,
  arrayRemove,
  onSnapshot,
  arrayUnion,
  getDoc,
} from "firebase/firestore";
import React, { useState, useEffect, useContext } from "react";
import { SHA256 } from "crypto-js";
import ThemeContext from "../components/ui/ThemeContext";
import theme from "../components/ui/theme";
import { EventRegister } from "react-native-event-listeners";
import { PointsProgressBar } from "../components/ui/PointsProgressBar";
import * as ImagePicker from "expo-image-picker";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage, getUserId } from "../firebaseConfig";


export default function ProfileScreen({ navigation, route }) {
  const [newId, setNewId] = useState("");
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState(false);
  const theme = useContext(ThemeContext);
  const [profilePicture, setProfilePicture] = useState(null);
  const [show, setShow] = useState(false);
  const [show_block, setShowblock] = useState(false);
  const [blocked_list, setBlocked_list] = useState([]);
  const [update, setUpdate] = useState(false)

  useEffect(() => {
    // const fetchProfilePicture = async () => {
    //   const imageRef = ref(storage, `profilePictures/${auth.currentUser.uid}`);
    //   try {
    //     const downloadURL = await getDownloadURL(imageRef);
    //     setProfilePicture(downloadURL);
    //   } catch (error) {
    //     if (error.code === "storage/object-not-found") {
    //       console.log("No profile picture found, using a default image.");
    //     } else {
    //       console.error("Error fetching profile picture:", error);
    //     }
    //   }
    // };
    // fetchProfilePicture();
    const getProfilePicture = async (uid) => {
      const data = await fetchProfilePicture(uid);
      if (data != null) {
        setProfilePicture(data);
      }

      return data;
    };

    getProfilePicture(auth.currentUser.uid);
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setProfilePicture(result.uri);
      uploadImage(result.uri);
    }
  };

  const uploadImage = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const imageRef = ref(storage, `profilePictures/${auth.currentUser.uid}`);

    const uploadTask = uploadBytesResumable(imageRef, blob);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log(`Upload is ${progress}% done`);
      },
      (error) => {
        console.error("Error uploading image:", error);
      },
      async () => {
        const downloadURL = await getDownloadURL(imageRef);
        setProfilePicture(downloadURL);
        console.log("Image uploaded successfully");
      }
    );
  };

  const handleSignOut = () => {
    signOut(auth).then(() => {
      navigation.popToTop();
    });
  };

  const handleChangeId = () => {
    const userDocRef = doc(db, "users", auth.currentUser.uid);
    updateDoc(userDocRef, { id: newId })
      .then(() => {
        console.log("username updated successfully.");
      })
      .catch((error) => {
        console.error("Error updating username:", error);
      });
  };

  const handleDeleteAccount = () => {
    const user = auth.currentUser;
    const hashedPassword = SHA256(password).toString(); // Store this in the database

    const credential = EmailAuthProvider.credential(user.email, hashedPassword);

    signInWithEmailAndPassword(auth, user.email, hashedPassword)
      .then((userCredential) => {
        userCredential.user
          .delete()
          .then(() => {
            // Account deleted successfully
            navigation.popToTop();
            alert("Successfully deleted");
          })
          .catch((error) => {
            alert("Wrong password entered");
            console.error("Error deleting account:", error);
            console.log(password);
            console.log(hashedPassword);
          });
      })
      .catch((error) => {
        alert("Wrong password entered");
        console.error("Error reauthenticating user:", error);
        console.log(password);
        console.log(hashedPassword);
      });
  };

  const load_data = async () => {
    const blockDocRef = doc(db, 'block', auth.currentUser.uid);
    const res = await getDoc(blockDocRef);
    var temp = []
    res.data()["blocked_to"].forEach((user) => {
      temp.push(user.split("/")[1])
    })
    setBlocked_list(temp)
  }

  useEffect(() => {
    load_data()
  }, [show_block])

  useEffect(() => {    
    const userDocRef = doc(db, "users", auth.currentUser.uid);
    const unsubscribe = onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        setId(doc.data().id);
        /*doc.data().points.map(([key, value]) => {
          console.log(key, value)
        })*/
      } else {
        console.log("No such document!");
      }
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const refresh_screen = () => {
    setUpdate(true)
    setTimeout(() => {
      setUpdate(false)
    }, 1000);
  }

  const handleUnblock = async (item) => {
    const me = auth.currentUser?.uid+"/"+auth.currentUser?.email
    const target_uid = await getUserId(item)
    const target = target_uid[0] + "/" + item
    
    const Ref_me = doc(db, "block", auth.currentUser?.uid);
    const Ref_target = doc(db, "block", target_uid[0]);



    updateDoc(Ref_me, {
      blocked_to: arrayRemove(target),
    });

    updateDoc(Ref_target, {
      blocked_from: arrayRemove(me),
    });

    const index = blocked_list.indexOf(item)
    blocked_list.splice(index, 1)

    Alert.alert("Unblocked", "Successfully unblocked " + item)
    console.log(blocked_list)
    refresh_screen();
  }

  const renderItem = ({ item }) => {
    return (
      <View key={item} style={[styles.items, { borderBottomColor: mode ? 'white' : 'mode'}]}>
        <Text style={{ color: mode ? "white" : 'black'}}>
          {item}
          {"\n"}
        </Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => handleUnblock(item)}
          style={styles.touchableOpacityStyle}
        >
          <Block name={"block"} size={20} color={mode ? "white" : "black"} />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container]}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={show}
        onRequestClose={() => {
          setShow(!show);
          setShowblock(false)
          setPassword("");
        }}>
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <View style={{backgroundColor: !mode ? 'white' : 'black', justifyContent: 'center', alignItems: 'center', width: '70%', height: '30%'}}>
            {
              show_block ? 
                update ?
                <ActivityIndicator />
                :
                <ScrollView>
                  <Text style={{alignSelf: 'center', fontSize: 25, fontWeight: 'bold'}}>Blocked List</Text>
                  {blocked_list.map((item) => {
                    return (
                      renderItem({item})
                    )
                  })}
                </ScrollView>
              :
              <View style={{width: '100%', alignItems: 'center', justifyContent: 'center'}}>
                <Text style={mode ? styles.text_w : styles.text_t}>Enter your password to delete account</Text>
                <TextInput
                  style={[styles.input, {color: mode ? 'white' : 'black'}]}
                  placeholder="Enter Password"
                  placeholderTextColor= {mode ? "white" : "black"}
                  value={password}
                  onChangeText={(text) => setPassword(text)}
                  secureTextEntry={true}
                />
                <Button title="Delete Account" onPress={handleDeleteAccount} />
              </View>
            }
            <View style={{marginTop: 10}}>
              <Button title="Close" onPress={() => {
                setShow(!show)
                setShowblock(false);
                setPassword("");
              }} />
            </View>
          </View>
        </View>
      </Modal>
      <View style={{flex: 0.3, width: '100%' ,flexDirection: 'row', justifyContent: 'center', alignContent: 'center'}}>
        <View style={{width: '100%', alignItems: 'center', justifyContent: 'space-around'}}>
          {profilePicture && (
            <Image
              source={{ uri: profilePicture }}
              style={{ width: 100, height: 100, borderRadius: 50 }}
            />
          )}
          
          <View style={{flexDirection: 'row'}}>
            <Text style={{fontWeight: 'bold', fontSize: 20, textDecorationLine: 'underline', color: mode ? "white" : "black"}}>
              {id}
            </Text>
            <Text style={{fontSize: 20, color: mode ? "white" : "black"}}>
            's profile page
            </Text>
          </View>
        </View>
      </View>
      <ScrollView style={{flex: 4, width: '100%'}} contentContainerStyle={{alignItems: 'center', justifyContent: 'center'}}>
        <TouchableOpacity style={[styles.menu, {borderBottomColor: mode ? "white" : '#D3D3D3'}]} onPress={pickImage}>
          <Img_icon name = {"images"} size={30} color={mode ? 'white' : 'black'} style={styles.icon_left}/>
          <Text style={[mode ? styles.text_w : styles.text_b,]}>Change Profile</Text>
        </TouchableOpacity>
        <View style={[styles.menu, {borderBottomColor: mode ? "white" : '#D3D3D3'}]}>
          <Img_icon name = {'color-palette-outline'} size={30} color={mode ? 'white' : 'black'} style={styles.icon_left}/>
          <Text style={[mode ? styles.text_w : styles.text_b ]}>Dark Mode</Text>
          <View style={styles.icon_right}>
            <Switch
              value={mode}
              onValueChange={(value) => {
                setMode(value);
                EventRegister.emit("changeTheme", value);
              }}
            />
          </View>
        </View>
        <TouchableOpacity style={[styles.menu, {borderBottomColor: mode ? "white" : '#D3D3D3'}]} onPress={() => navigation.navigate("Settings")}>
          <Setting name = {"settings"} size={30} style={styles.icon_left} color={mode ? "white": "black"}/>
          <Text style={[mode ? styles.text_w : styles.text_b ]}>Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.menu, {borderBottomColor: mode ? "white" : '#D3D3D3'}]} onPress={() => navigation.navigate("Friend")}>
          <Fri_icon name = {"user-friends"} size={30} style={styles.icon_left} color={mode ? "white": "black"}/>
          <Text style={[mode ? styles.text_w : styles.text_b ]}>
              Friends page
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.menu, {borderBottomColor: mode ? "white" : '#D3D3D3'}]} onPress={() => {
          setShow(!show)
          setShowblock(true)
        }}>
          <Ant name = {"deleteuser"} size={30} style={styles.icon_left} color={mode ? "white": "black"}/>
          <Text style={[mode ? styles.text_w : styles.text_b ]}>
              Blocked accounts
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.menu, {borderBottomColor: mode ? "white" : '#D3D3D3'}]} onPress={() => navigation.navigate("Goals")}>
          <Setting name = {"target"} size={30} style={styles.icon_left} color={mode ? "white": "black"}/>
          <Text style={[mode ? styles.text_w : styles.text_b ]}>Goals</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.menu, {borderBottomColor: mode ? "white" : '#D3D3D3'}]} onPress={() => setShow(!show)}>
          <Ant name = {"delete"} size={30} style={styles.icon_left} color={mode ? "white": "black"}/>
          <Text style={[mode ? styles.text_w : styles.text_b ]}>Delete account</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSignOut} style={[styles.menu, {borderBottomColor: mode ? "white" : '#D3D3D3'}]}>
          <Entypo name={'log-out'} size={30} style={styles.icon_left} color={mode ? "white": "black"}/>
          <Text style={[mode ? styles.text_w : styles.text_b]}>Sign Out</Text>
        </TouchableOpacity>
        <PointsProgressBar id={auth.currentUser?.uid} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    width: "80%",
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginVertical: 10,
    padding: 10,
  },
  item: {
    backgroundColor: "orange",
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    width: "90%",
    alignSelf: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  textStyle: {
    fontWeight: "bold",
    textAlign: "center",
    color: theme.color,
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
  barContainer: {
    flex: 1,
    flexDirection: "column", //column direction
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 30,
    backgroundColor: "#ecf0f1",
    padding: 8,
  },
  progressBar: {
    height: 30,
    width: "80%",
    backgroundColor: "white",
    borderColor: "#000",
    borderWidth: 2,
    borderRadius: 5,
    marginBottom: 5,
  },
  categoryText: {
    padding: 5,
    color: theme.color,
  },
  row: {
    flexDirection: "row",
  },
  menu: {
    width: '100%',
    margin: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    borderBottomWidth: 1
  },
  text_w:{
    color: "white",
    fontSize: 15, 
    fontWeight: 'bold'
  },
  text_b: {
    color: 'black',
    fontSize: 15, 
    fontWeight: 'bold'
  },
  icon_left: {
    position: 'absolute', 
    left: "5%"
  },
  icon_right: {
    position: 'absolute', 
    right: "5%"
  },
  items: {
    
    borderBottomWidth: 1,
    padding: 10,
    marginVertical: 8,
    marginHorizontal: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
