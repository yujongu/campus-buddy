import { StatusBar } from "expo-status-bar";
import { useEffect, useState, useContext } from "react";
import { Button, StyleSheet, Text, TextInput, View, KeyboardAvoidingView, Image } from "react-native";
import ThemeContext from "../components/ui/ThemeContext";
import theme from "../components/ui/theme";
import { ScrollView } from "react-native-gesture-handler";
import { checkUser } from "../firebaseConfig";

export default function ForgotEmail({ navigation, route }) {
  const theme = useContext(ThemeContext);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [id, setId] = useState("");

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          justifyContent: 'center',
          alignContent: 'center',
        }}>
        <KeyboardAvoidingView enabled behavior="padding">
      <Text style={[styles.label, { color: theme.color }]}>First Name</Text>
      <TextInput
        style={styles.input}
        onChangeText={(text) => setFirstName(text)}
        value={firstName}
        placeholder="Enter your first name"
      />
      <Text style={[styles.label, { color: theme.color }]}>Last Name</Text>
      <TextInput
        style={styles.input}
        onChangeText={(text) => setLastName(text)}
        value={lastName}
        placeholder="Enter your last name"
      />
      <Text style={[styles.label, { color: theme.color }]}>User ID</Text>
      <TextInput
        style={styles.input}
        onChangeText={(text) => setId(text)}
        value={id}
        placeholder="Enter your user ID"
      />
      <Button
        title="Submit"
        onPress={() =>
          checkUser(firstName, lastName, id).then((user) => {
            if (user) {
              console.log('User found:', user);
              // do something with the user object
            } else {
              console.log('User not found');
              // show an error message to the user
            }
          })
        }
      />
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