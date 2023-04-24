import { useContext, useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  Platform,
  ScrollView,
} from "react-native";
import ThemeContext from "../ui/ThemeContext";
import { Dropdown } from "react-native-element-dropdown";
import { JSClock } from "../../helperFunctions/dateFunctions";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Colors } from "../../constants/colors";

export default function EventRepetitionDetailWeekly({
  countVal,
  handleRepeatCount,
  dayOfTheWeekSelected,
  toggleDayOfTheWeekSelected,
  data,
  repetitionDue,
  handleRepetitionHasEndValue,
  showDatePicker,
  eventRepeatDate,
  eventRepeatDateShow,
  eventRepeatMode,
  handleOnDateRepeatSelect,
}) {
  const theme = useContext(ThemeContext);

  return (
    <View
      style={{
        flex: 1,
        flexDirection: "column",
        justifyContent: "flex-start",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {dayOfTheWeekSelected.map((day) => {
          return day.value < 4 ? (
            <Pressable
              style={{ marginHorizontal: 10 }}
              onPress={() => toggleDayOfTheWeekSelected(day.value)}
            >
              <View
                style={{
                  backgroundColor: day.isSelected ? Colors.primary : "#f3f3f3",
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 2,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    color: day.isSelected ? "white" : "black",
                  }}
                >
                  {day.label}
                </Text>
              </View>
            </Pressable>
          ) : (
            <View />
          );
        })}
      </View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {dayOfTheWeekSelected.map((day) => {
          return day.value > 3 ? (
            <Pressable
              style={{ marginHorizontal: 10 }}
              onPress={() => toggleDayOfTheWeekSelected(day.value)}
            >
              <View
                style={{
                  backgroundColor: day.isSelected ? Colors.primary : "#f3f3f3",
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 2,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    color: day.isSelected ? "white" : "black",
                  }}
                >
                  {day.label}
                </Text>
              </View>
            </Pressable>
          ) : (
            <View />
          );
        })}
      </View>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Text style={{}}>Every</Text>
        <TextInput
          style={{
            height: 40,
            borderBottomWidth: 0.5,
            width: 40,
            padding: 10,
            marginHorizontal: 10,
            fontSize: 16,
          }}
          keyboardType="numeric"
          value={countVal}
          onChangeText={(val) => handleRepeatCount(val)}
        />
        <Text style={{ fontSize: 16 }}>weeks</Text>
      </View>
      <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
        <Text>Continue</Text>
        <View style={{ flex: 1 }}>
          <Dropdown
            style={{
              paddingLeft: 10,
              marginHorizontal: 8,
              height: 50,
              borderBottomColor: "grey",
              borderBottomWidth: 0.5,
            }}
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholderStyle={{ fontSize: 16 }}
            placeholder="Select item"
            data={data}
            value={repetitionDue}
            onChange={(item) => {
              handleRepetitionHasEndValue(item.value);
            }}
          />
        </View>
        <View style={{ display: repetitionDue == 0 ? "none" : "flex" }}>
          {Platform.OS === "android" ? (
            <View style={{ flexDirection: "row" }}>
              <Pressable onPress={showDatePicker}>
                <Text
                  style={{
                    backgroundColor: "#AAAAAA",
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 5,
                    marginHorizontal: 4,
                  }}
                >
                  {JSGetDate(eventRepeatDate)}
                </Text>
              </Pressable>

              {eventRepeatDateShow && (
                <DateTimePicker
                  testID="dateTimePicker"
                  value={eventRepeatDate}
                  mode={eventRepeatMode}
                  is24Hour={false}
                  onChange={handleOnDateRepeatSelect}
                />
              )}
            </View>
          ) : (
            <View style={{ flexDirection: "row" }}>
              <DateTimePicker
                testID="dateTimePicker"
                value={eventRepeatDate}
                mode={"date"}
                is24Hour={true}
                onChange={handleOnDateRepeatSelect}
              />
            </View>
          )}
        </View>
      </View>
    </View>
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
});
