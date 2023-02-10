import { useState, createContext, useContext} from 'react'
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Button } from "react-native";
import { sendDataToFirebase } from "./firebaseConfig";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import CalendarScreen from "./screens/CalendarScreen";
import HomeScreen from "./BottomTabContainer";
import SignInScreen from "./screens/SignInScreen";
import SignUpScreen from "./screens/SignUpScreen";

const Stack = createNativeStackNavigator();
export const UserContext = createContext(null);

export default function App() {

  return (
      <NavigationContainer>
        <Stack.Navigator>
            <Stack.Screen
              name="SignIn"
              component={SignInScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ headerShown: false }}
            />
          <Stack.Screen
            name="SignUp"
            component={SignUpScreen}
            options={{headerShown: false}}
          />
        </Stack.Navigator>
      </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});

