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

  return (
    <View style={[styles.container]}>
        <View style= {styles.row}>
        <Text style={{paddingRight:10}}>My Goals</Text>
        <TouchableOpacity
            onPress={() =>
            setVisible(true)
            }
        >
            <Icon name="plus" size={20} color="#2F4858" />
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
                height: "40%",
                width:"80%",
                borderRadius: 10,
              }}
            >
                <View
                  style={{
                    flexDirection: "column",
                    alignItems: "center",
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
    justifyContent: "center",
    marginTop: 20,
  },
  textStyle: {
    fontWeight: "bold",
    textAlign: "center",
    color: theme.color,
  },
  row: {
    flexDirection: "row",
  },
});
