import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Button } from "react-native";
import { sendDataToFirebase } from "./firebaseConfig";
import {
  NavigationContainer,
  DarkTheme,
  DefaultTheme,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import CalendarScreen from "./screens/CalendarScreen";
import HomeScreen from "./BottomTabContainer";
import SignInScreen from "./screens/SignInScreen";
import SignUpScreen from "./screens/SignUpScreen";
import User_profile from "./screens/User_profileScreen";
import SettingsScreen from "./screens/SettingsScreen";
import CompareScreen from "./screens/CompareScreen";
import GoalsScreen from "./screens/GoalsScreen";
import EventDetailsScreen from "./screens/EventDetailsScreen";
import { auth } from "./firebaseConfig";
import FriendScreen from "./screens/FriendScreen";
import { EventRegister } from "react-native-event-listeners";
import ThemeContext from "./components/ui/ThemeContext";
import theme from "./components/ui/theme";
import ForgotEmail from "./screens/ForgotEmail";
import ForgotPassword from "./screens/ForgotPassword";
import { SafeAreaProvider } from "react-native-safe-area-context";
import FeedDetailScreen from "./screens/FeedDetailScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  const [mode, setMode] = useState(false);

  useEffect(() => {
    let eventListener = EventRegister.addEventListener(
      "changeTheme",
      (data) => {
        setMode(data);
        console.log(data);
      }
    );
    return () => {
      EventRegister.removeEventListener(eventListener);
    };
  });

  return (
    <SafeAreaProvider>
      <ThemeContext.Provider value={mode === true ? theme.dark : theme.light}>
        <NavigationContainer theme={mode === true ? DarkTheme : DefaultTheme}>
          <Stack.Navigator>
            <Stack.Screen
              name="SignIn"
              component={SignInScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="SignUp"
              component={SignUpScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="user_profile"
              component={User_profile}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Friend"
              component={FriendScreen}
              options={{ headerShown: true }}
            />
            <Stack.Screen
              name="ForgotEmail"
              component={ForgotEmail}
              options={{ headerShown: true }}
            />
            <Stack.Screen
              name="ForgotPassword"
              component={ForgotPassword}
              options={{ headerShown: true }}
            />
            <Stack.Screen
              name="EventDetails"
              component={EventDetailsScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Compare Screen"
              component={CompareScreen}
              options={{ headerShown: false }}
            ></Stack.Screen>
            <Stack.Screen
              name="Goals"
              component={GoalsScreen}
              options={{ headerShown: false }}
            ></Stack.Screen>
            <Stack.Screen
              name="FeedDetails"
              component={FeedDetailScreen}
              options={{ headerShown: false }}
            ></Stack.Screen>
          </Stack.Navigator>
        </NavigationContainer>
      </ThemeContext.Provider>
    </SafeAreaProvider>
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
