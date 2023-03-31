import React from "react";
import { View, Text, Modal, TouchableOpacity, Button } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { SelectList } from "react-native-dropdown-select-list";
export default class CalendarColorModal extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    // this.handleListChange = this.handleListChange.bind(this);
    // this.saveData = this.saveData.bind(this);
  }
  handleChange = () => {
    this.props.closeHCalendarColorgModal();
  };

//   handleListChange = (val) => {
//     this.props.selectCountryHolidaySettingModal(val);
//   };

//   saveData = async (val) => {
//     this.props.storeData(val);
//   };

  render() {
    const {
      CalendarThemeVisible,
    } = this.props;

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={holidaySettingVisible}
      >
        <View
          style={{
            flex: 1,
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              width: 300,
              height: 450,
              borderRadius: 20,
              justifyContent: "space-between",
            }}
          >
            <View>
              <TouchableOpacity onPress={this.handleChange}>
                <View
                  style={{
                    paddingLeft: 260,
                    paddingTop: 10,
                  }}
                >
                  <Icon name="times" size={20} color="#2F4858" />
                </View>
              </TouchableOpacity>

              <View style={{ marginRight: 10, marginLeft: 10 }}>
                <Text>Country</Text>
                <SelectList
                  setSelected={(val) => this.handleListChange(val)}
                  data={holidayCountryList}
                />
                <View style={{ marginTop: 15, flexDirection: "row" }}>
                  <Text style={{ fontWeight: "bold", marginRight: 10 }}>
                    Current Selected Option:
                  </Text>
                  <Text>{selectedCountryCode}</Text>
                </View>
              </View>
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginLeft: 10,
                marginRight: 10,
                marginBottom: 10,
              }}
            >
              <Button
                // onPress={() => this.storeData(this.state.selectedCountry)}
                // onPress={() => this.props.storeData(selectedCountry)}
                onPress={() => this.saveData(selectedCountry)}
                title="Save"
              />
              {/* <Button title="Hide holidays" onPress={this.removeData} /> */}
              <Button title="Hide holidays" onPress={this.props.removeData} />
            </View>
          </View>
        </View>
      </Modal>
    );
  }
}
