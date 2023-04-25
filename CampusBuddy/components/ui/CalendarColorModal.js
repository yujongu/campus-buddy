import React from "react";
import {
  View, 
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Button,
  StyleSheet
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { SelectList } from "react-native-dropdown-select-list";
import {Colors} from "../../constants/colors.js";
import ThemeContext from "./ThemeContext.js";
import theme from "./theme.js";
import { EventRegister } from "react-native-event-listeners";

const colors = [
  '#6874e7',
  '#b8304f',
  '#758E4F',
  '#fa3741',
  '#F26419',
  '#F6AE2D',
  '#DFAEB4',
  '#7A93AC',
  '#33658A',
  '#3d2b56',
  '#42273B',
  '#171A21',
];

const MODAL_HEIGHT = 150;
const CIRCLE_SIZE = 60;
const CIRCLE_RING_SIZE = 2;

// function colorPicker = () => {}

export default class CalendarColorModal extends React.Component {

  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.calendarLightMode = this.calendarLightMode.bind(this);

    this.state = {
      value: 0,
      colorPickModalVisible: false,
    }
  }

  // const theme = useContext(ThemeContext);

  handleChange = () => {
    console.log("Calendar Theme modal closed");
    this.props.closeCalendarColorModal();
  };

  calendarLightMode = (value) => {
    console.log("Calendar Light Mode");
    //EventRegister.emit("changeTheme", value); this code changes the whole theme of the calendar
  }

  calendarDarkMode = (value) => {
    console.log("Calendar Dark Mode");
    //EventRegister.emit("changeTheme", value); this code changes the whole theme of the calendar
  }

  addTheme = () => {
    console.log("Add Theme");
    //this.setState({colorPickModalVisible: true})
  };

  selectColor = () => {
    this.setState({});
  }

  render() {
    const {
      calendarColorVisible,
    } = this.props;

    const { theme } = this.context;

    

    return (
      <View>
        <Modal
          animationType="slide"
          transparent={true}
          visible={calendarColorVisible}
        >
          <View style={styles.modal}>
            <View style={styles.modalContent}>
              <View>
                {/* closing icon */}
                <TouchableOpacity onPress={this.handleChange}>
                  <View style = {styles.closeIcon} >
                    <Icon name="times" size={20} color="#2F4858" />
                  </View>
                </TouchableOpacity>

                {/* Modal Title */}
                <View style={styles.modalTitle}>
                  <Text style={styles.modalTitleText}>Calendar Theme</Text>
                </View>
              </View>

              <View style={styles.themes}>
                {/* Light Calendar */}
                <TouchableOpacity onPress={this.calendarLightMode}>
                  <View style={styles.lightColorCircle}>
                    <Text>Light</Text>
                  </View>
                </TouchableOpacity>
                {/* Dark Calendar */}
                <TouchableOpacity onPress={this.calendarDarkMode}>
                  <View style={styles.darkColorCircle}>
                    <Text style={styles.whiteText}>Dark</Text>
                  </View>
                </TouchableOpacity>
                <View style={styles.customizeBox}>
                  <TouchableOpacity onPress={this.addTheme}>
                      <View style={styles.customizePlus}>
                        <Icon name="plus" size={20} color={Colors.dark}/>
                        <Text>Custom</Text>
                      </View>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>
        {/* <Modal
          animationType="slide"
          transparent={true}
          visible={this.state.colorPickModalVisible}
          >
          <View style={styles.modal}>
            <View style={styles.group}>
              {colors.map((item, index) => {
                const isActive = this.state.value === index;
                return (
                  <View key={item}>
                    <TouchableWithoutFeedback
                      onPress={() => {
                        setValue(index);
                      }}>
                      <View
                        style={[
                          styles.circle,
                          isActive && { borderColor: item },
                        ]}>
                        <View
                          style={[styles.circleInside, { backgroundColor: item }]}
                        />
                      </View>
                    </TouchableWithoutFeedback>
                  </View>
                );
              })}
              </View>
            </View>
        </Modal> */}
      </View>
    );
  }
}




const styles = StyleSheet.create({
  modal: {
    flex: 1,
    //backgroundColor: "white",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "black",
    shadowOffset: {
      width: 0,
      height: 3
    },
    shadowOpacity: 0.29,
    shadowRadius: 4.65
  },
  modalContent: {
    backgroundColor: "white",
    width: 300,
    height: MODAL_HEIGHT,
    borderRadius: 20,
  },
  closeIcon: {
    paddingLeft: 260,
    paddingTop: 10,
  },
  modalTitle: { 
    width: 200,
    alignSelf: "center",
    backgroundColor: Colors.darker,
    justifyContent: "center",
    alignItems: "center",    
  },
  modalTitleText: {
    fontSize: 20,
    color: "white"
  },
  themes: {
    //backgroundColor: "orange",
    padding: 15,
    //alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row"
  },
  lightColorCircle: {
    width: 60,
    height: 60,
    borderRadius: 999,
    backgroundColor: "white",
    borderColor: Colors.primary,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center"
  },
  darkColorCircle: {
    width: 60,
    height: 60,
    borderRadius: 999,
    color: "white",
    backgroundColor: "black",
    //borderColor: Colors.secondary,
    alignItems: "center",
    justifyContent: "center"
  },
  whiteText: {
    color: "white"
  },
  customizeBox: {
    width: 80,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
  },
  customizePlus: {
    width: 60,
    height: 60,
    borderColor: "#DDD",
    borderStyle: "dashed",
    borderWidth: 2,
    alignItems: "center",
    borderRadius: 999,
    justifyContent: 'center',
  },
  sheetHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#efefef',
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  sheetHeaderTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  sheetBody: {
    padding: 24,
  },
  profile: {
    alignSelf: 'center',
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.29,
    shadowRadius: 4.65,
    elevation: 7,
  },
  profileText: {
    fontSize: 34,
    fontWeight: '600',
    color: 'white',
  },
  group: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  circle: {
    width: CIRCLE_SIZE + CIRCLE_RING_SIZE * 4,
    height: CIRCLE_SIZE + CIRCLE_RING_SIZE * 4,
    borderRadius: 9999,
    backgroundColor: 'white',
    borderWidth: CIRCLE_RING_SIZE,
    borderColor: 'transparent',
    marginRight: 8,
    marginBottom: 12,
  },
  circleInside: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: 9999,
    position: 'absolute',
    top: CIRCLE_RING_SIZE,
    left: CIRCLE_RING_SIZE,
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },
  btn: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    padding: 14,
    borderWidth: 1,
    borderColor: '#000',
    backgroundColor: '#000',
    marginBottom: 12,
  },
  btnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  container: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
  },
  sheet: {
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  placeholder: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    height: 400,
    marginTop: 0,
    padding: 24,
  },
  placeholderInset: {
    borderWidth: 4,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    borderRadius: 9,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
  },
})