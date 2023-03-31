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
} from "react-native";
import { auth, db, userSchedule } from "../firebaseConfig";
import { EmailAuthProvider } from "firebase/auth";
import { signInWithEmailAndPassword } from "firebase/auth";
import { signOut } from "firebase/auth";
import {
  updateDoc,
  doc,
  arrayRemove,
  onSnapshot,
  arrayUnion,
} from "firebase/firestore";
import React, { useState, useEffect, useContext } from "react";
import { SHA256 } from "crypto-js";
import ThemeContext from "../components/ui/ThemeContext";
import theme from "../components/ui/theme";
import { EventRegister } from "react-native-event-listeners";
import { PointsProgressBar } from "../components/ui/PointsProgressBar";
import * as ImagePicker from "expo-image-picker";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "../firebaseConfig";

export default function ProfileScreen({ navigation, route }) {
  const [newId, setNewId] = useState("");
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState(false);
  const theme = useContext(ThemeContext);
  const [profilePicture, setProfilePicture] = useState(null);

  useEffect(() => {
    const fetchProfilePicture = async () => {
      const imageRef = ref(storage, `profilePictures/${auth.currentUser.uid}`);
      try {
        const downloadURL = await getDownloadURL(imageRef);
        setProfilePicture(downloadURL);
      } catch (error) {
        if (error.code === "storage/object-not-found") {
          console.log("No profile picture found, using a default image.");
        } else {
          console.error("Error fetching profile picture:", error);
        }
      }
    };
    fetchProfilePicture();
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

  return (
    <View style={[styles.container]}>
      {profilePicture && (
        <Image
          source={{ uri: profilePicture }}
          style={{ width: 100, height: 100, borderRadius: 50 }}
        />
      )}
      <Button title="Pick an image from the gallery" onPress={pickImage} />
      <Text style={[styles.textStyle, { color: theme.color }]}>
        {auth.currentUser?.uid}
      </Text>

      <Text style={[styles.textStyle, { color: theme.color }]}>
        Current Id: {id}
      </Text>
      <Switch
        value={mode}
        onValueChange={(value) => {
          setMode(value);
          EventRegister.emit("changeTheme", value);
        }}
      />
      <Button
        title="Settings"
        onPress={() => navigation.navigate("Settings")}
      />
      <Button title="Sign Out" onPress={handleSignOut} />
      <Button
        title="Friend page"
        onPress={() => navigation.navigate("Friend")}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter Password"
        value={password}
        onChangeText={(text) => setPassword(text)}
        secureTextEntry={true}
      />
      <Button title="Delete Account" onPress={handleDeleteAccount} />
      <PointsProgressBar id={auth.currentUser?.uid} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
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
});
