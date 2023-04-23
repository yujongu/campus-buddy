import { StyleSheet, Text, View } from "react-native";
import FeedScreen from "./screens/FeedScreen";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import SearchScreen from "./screens/SearchScreen";
import CalendarScreen from "./screens/CalendarScreen";
import CompareScreen from "./screens/CompareScreen";
import ProfileScreen from "./screens/ProfileScreen";
import NotificationScreen from "./screens/NotificationScreen";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import AntDesign from "react-native-vector-icons/AntDesign";
import { Colors } from "./constants/colors";
import { TouchableOpacity } from "react-native";
import BoardScreen from "./screens/BoardScreen";

const Tab = createBottomTabNavigator();

export default function HomeScreen() {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Feed"
        component={FeedScreen}
        options={{
          tabBarLabel: "Feed",
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            iconName = focused ? "post" : "post-outline";
            return (
              <MaterialCommunityIcons name={iconName} color={color} size={30} />
            );
          },
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.darkGrey,
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Board"
        component={BoardScreen}
        options={{
          tabBarLabel: "Board",
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            iconName = focused ? "user-circle" : "user-circle-o";
            return <FontAwesome name={iconName} color={color} size={26} />;
          },
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.darkGrey,
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarLabel: "Search",
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            iconName = focused ? "search" : "search-outline";
            return <Ionicons name={iconName} color={color} size={30} />;
          },
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.darkGrey,
        }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{
          tabBarLabel: "Calendar",
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            iconName = focused ? "calendar-month" : "calendar-month-outline";
            return (
              <MaterialCommunityIcons name={iconName} color={color} size={30} />
            );
          },
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.darkGrey,
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            iconName = focused ? "user-circle" : "user-circle-o";
            return <FontAwesome name={iconName} color={color} size={26} />;
          },
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.darkGrey,
        }}
      />
      <Tab.Screen
        name="Notification"
        component={NotificationScreen}
        options={{
          tabBarLabel: "Notification",
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            iconName = focused
              ? "notifications-circle"
              : "notifications-circle-outline";
            return <Ionicons name={iconName} color={color} size={34} />;
          },
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.darkGrey,
          headerRight: () => (
            <TouchableOpacity style={{ marginRight: 10 }}>
              <AntDesign name={"addusergroup"} size={20} />
            </TouchableOpacity>
          ),
        }}
      />
    </Tab.Navigator>
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
