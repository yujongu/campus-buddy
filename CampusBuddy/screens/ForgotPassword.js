import { StatusBar } from "expo-status-bar";
import { useEffect, useState, useContext } from "react";
import { TouchableOpacity,Button, StyleSheet, Text, TextInput, View, KeyboardAvoidingView, Image } from "react-native";
import ThemeContext from "../components/ui/ThemeContext";
import theme from "../components/ui/theme";
import { ScrollView } from "react-native-gesture-handler";
import { db, auth, checkEmailExists } from "../firebaseConfig";
import { SHA256 } from 'crypto-js';
import { doc, getDocs, updateDoc, setDoc, collection, query, where } from "firebase/firestore";


export default function ForgotPassword({ navigation, route }) {
    const theme = useContext(ThemeContext);
    const [email, setEmail] = useState("");
    const [emailExists, setEmailExists] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const hashedPassword = SHA256(newPassword).toString();

    const handleChangePassword = async () => {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", email));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.size === 0) {
          console.log("User not found.");
          return;
        }
        const userDocRef = querySnapshot.docs[0].ref;
        updateDoc(userDocRef, { password: hashedPassword })
          .then(() => {
            alert("Password update successfully.");
            console.log("Password updated successfully.");
          })
          .catch((error) => {
            alert("Password update failed.");
            console.error("Error updating password:", error);
          });
      };
  
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            justifyContent: 'center',
            alignContent: 'center',
          }}>
          <KeyboardAvoidingView enabled behavior="padding">
            <Text style={[styles.label, { color: theme.color }]}>Email</Text>
            <TextInput
              style={styles.input}
              onChangeText={(text) => setEmail(text)}
              value={email}
              placeholder="Enter your email address"
            />
            <Button
              title="Submit"
              onPress={async () => {
                const exists = await checkEmailExists(email);
                setEmailExists(exists);
              }}
            />
            {emailExists && (
              <>
                <Text style={[styles.label, { color: theme.color }]}>
                  New Password
                </Text>
                <TextInput
                  style={styles.input}
                  onChangeText={(text) => setNewPassword(text)}
                  value={newPassword}
                  placeholder="Enter your new password"
                  secureTextEntry
                />
                <Button
                    title="Reset Password"
                    style={styles.editButtonStyle}
                    activeOpacity={0.5}
                    onPress={handleChangePassword}>
                </Button>
              </>
            )}
            <StatusBar style="auto" />
          </KeyboardAvoidingView>
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
  text: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    alignSelf: "flex-start",
    marginLeft: 20,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 10,
    width: "100%",
    marginBottom: 10,
  },
});