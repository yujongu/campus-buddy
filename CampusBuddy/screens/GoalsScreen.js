import {
  Button,
  StyleSheet,
  Text,
  TextInput,
  Modal,
  View,
  TouchableOpacity
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { auth, db, userSchedule } from "../firebaseConfig";
import {
  updateDoc,
  doc,
  arrayRemove,
  onSnapshot,
  arrayUnion,
} from "firebase/firestore";
import React, { useState, useEffect, useContext } from "react";
import ThemeContext from "../components/ui/ThemeContext";
import theme from "../components/ui/theme";

export default function ProfileScreen({ navigation, route }) {
  const [visible, setVisible] = useState(false);
  const [pointGoal, setPointGoal] = useState(0);
  const [category, setCategory] = useState("");
  const [deadlineDate, setDeadlineDate] = useState(null);
  const [deadlineTime, setDeadlineTime] = useState(null);


  return (
    <View style={[styles.container]}>
        <View style= {styles.row}>
        <Text style={{paddingRight:10, fontSize:20}}>My Goals</Text>
        <TouchableOpacity
            style = {{left:10, bottom:2}}
            onPress={() =>
            setVisible(true)
            }
        >
            <Icon name="plus" size={25} color="#2F4858" />
        </TouchableOpacity>
        </View>
        <View style= {{top:30}}>
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={()=>navigation.goBack()}
        >
            <Icon name="mail-reply" size={20} color="#2F4858"  />
        </TouchableOpacity>
        </View>
        
        <Modal
          animationType="fade"
          visible={visible}
          transparent={true}
        >
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(0,0,0,0.5)",
            }}
          >
            <View
              style={{
                backgroundColor: "white",
                marginHorizontal: 20,
                borderRadius: 10,
              }}
            >
                <View
                  style={{
                    flexDirection: "column",
                    alignItems: "center",
                    margin:15
                  }}
                >
                  <View style={styles.row}>
                    <TouchableOpacity
                      style={{
                        flex: 1,
                      }}
                      onPress={() =>
                        setVisible(false)
                      }
                    >
                      <View style={{ alignSelf: "flex-end" }}>
                        <Icon name="times" size={20} color="#2F4858" />
                      </View>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.header_text}>New Goal</Text>
                  </View>
                  <View style={styles.row}>
                  <Text
                      style={{
                        textAlign: "center",
                        color: "#2F4858",
                        marginTop:15,
                      }}
                    >
                      Category:
                    </Text>
                  <TextInput
                       style={{
                        color: "black",
                        borderWidth: 1,
                        borderColor: "#8b9cb5",
                        margin:10,
                        width: 100,
                        height: 30,
                        textAlign: "center",
                      }}
                      placeholderTextColor="#8b9cb5"
                      onChangeText={(text) => this.setTitle(text)}
                    ></TextInput>
                    </View>
                  <View style={styles.row}>
                  <Text
                      style={{
                        textAlign: "center",
                        color: "#2F4858",
                        marginTop:15,
                      }}
                    >
                      Point Goal:
                    </Text>
                    <TextInput
                      placeholderTextColor="#8b9cb5"
                      style={{
                        color: "black",
                        borderWidth: 1,
                        borderColor: "#8b9cb5",
                        margin:10,
                        width: 50,
                        height: 30,
                        textAlign: "center",
                      }}
                      value={pointGoal}
                      defaultValue={0}
                      keyboardType="numeric"
                      onChangeText={(text) => setPointGoal(text)}
                    />
                    </View>
                    <View style={styles.row}>
                  <Text
                      style={{
                        textAlign: "center",
                        color: "#2F4858",
                        margin:15,
                      }}
                    >
                      Deadline:
                    </Text>
                    </View>

                  <Button
                    title="Set Goal"
                    onPress={() => {
                      createNewGoal()
                    }}
                  />
                </View>
            </View>
          </View>
        </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    marginTop: 100,
  },
  textStyle: {
    fontWeight: "bold",
    textAlign: "center",
    color: theme.color,
  },
  row: {
    flexDirection: "row",
  },
  header_text: {
    flex: 1,
    fontSize: 20,
    textAlign: "center",
    paddingBottom:10
  },
});
