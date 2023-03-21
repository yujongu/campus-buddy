// Import React and Component
import React, { useState } from "react";

import {
  StyleSheet,
  TextInput,
  View,
  Text,
  Image,
  KeyboardAvoidingView,
  Keyboard,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from "react-native";
import { Colors } from "../constants/colors";

const MonthViewItem = ({ date, hasEvent, isThisMonth }) => {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: isThisMonth ? Colors.third : Colors.secondary,
        padding: 10,
        margin: 3,
        borderRadius: "10",
        height: Dimensions.get("window").width / 6,
      }}
    >
      <Text style={{ color: isThisMonth ? "white" : "grey" }}>{date}</Text>

      <Text></Text>
    </View>
  );
};

const styles = StyleSheet.create({
  SectionStyle: {
    flexDirection: "row",
    height: 40,
    marginTop: 20,
    marginLeft: 35,
    marginRight: 35,
    margin: 10,
  },
  buttonStyle: {
    backgroundColor: "#477A74",
    borderWidth: 0,
    color: "#FFFFFF",
    borderColor: "#2F4858",
    height: 40,
    alignItems: "center",
    borderRadius: 30,
    marginLeft: 35,
    marginRight: 35,
    marginTop: 20,
    marginBottom: 20,
  },
  buttonTextStyle: {
    color: "#FFFFFF",
    paddingVertical: 10,
    fontSize: 16,
  },
  inputStyle: {
    flex: 1,
    color: "black",
    paddingLeft: 15,
    paddingRight: 15,
    borderWidth: 1,
    borderRadius: 30,
    borderColor: "#2F4858",
  },
  errorTextStyle: {
    color: "red",
    textAlign: "center",
    fontSize: 14,
  },
  successTextStyle: {
    color: "black",
    textAlign: "center",
    fontSize: 18,
    padding: 30,
  },
});

export default MonthViewItem;
