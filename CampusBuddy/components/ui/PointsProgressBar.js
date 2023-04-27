import React from "react";
import {
  Switch,
  Button,
  StyleSheet,
  Text,
  Pressable,
  TextInput,
  View,
  Modal,
} from "react-native";
import { auth, db } from "../../firebaseConfig";
import { doc, onSnapshot } from "firebase/firestore";
import Ant from "react-native-vector-icons/AntDesign";
import { TouchableOpacity } from "react-native";
import ThemeContext from "./ThemeContext";
import themeCon from "./theme";

export class PointsProgressBar extends React.Component {
  static contextType = ThemeContext;

  constructor(...args) {
    super(...args);
    this.state = {
      //categories are not implemented yet, just using two dummy categories for now
      schoolPoints: 0,
      fitnessPoints: 0,
      likes: 0,
      liked: false,
      numLike: 0,
    };
  }

  componentDidMount() {
    const userDocRef = doc(db, "users", this.props.id);
    const res = onSnapshot(userDocRef, (doc) => {
      if (res != null) {
        this.setState({ schoolPoints: doc.data().points["SCHOOLCOURSE"] });
        this.setState({ fitnessPoints: doc.data().points["FITNESS"] });
      } else {
        console.log("No such document!");
      }
    });
  }

  //converts points to a width percentage for progress bar display
  getWidth = (points) => {
    return (
      (points - 100 * Math.floor(parseInt(points, 10) / 100)).toString() + "%"
    );
  };

  incrementLike = () => {
    this.setState((prevState) => ({
      liked: !prevState.liked,
      numLike: prevState.liked ? prevState.numLike - 1 : prevState.numLike + 1,
    }));
  };


  render() {
    const { theme } = this.context;

    return (
      <View style={[styles.container]}>
        <Text style={{ fontSize: 20 }}>{this.state.numLike}</Text>
        <TouchableOpacity
          style={{ marginLeft: 5 }}
          onPress={() => this.incrementLike()}
        >
          {this.state.liked ? (
            <Ant name="like1" size={25} color={"black"} />
          ) : (
            <Ant name="like2" size={25} color={"black"} />
          )}
        </TouchableOpacity>
        <Text
          style={{
            fontSize: 20,
            textAlign: "center",
            paddingTop: 40,
            paddingBottom: 10,
            color: themeCon[theme].fontColor,
          }}
        >
          Points Progress
        </Text>
        <Text
          style={[styles.categoryText, { color: themeCon[theme].fontColor }]}
        >
          School Courses
        </Text>
        <View style={[styles.row]}>

          <Text
            style={[styles.categoryText, { color: themeCon[theme].fontColor }]}
          >
            {Math.floor(parseInt(this.state.schoolPoints, 10) / 100)}
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                [StyleSheet.absoluteFill],
                {
                  backgroundColor: "#FFC2B0",
                  width: this.getWidth(this.state.schoolPoints),
                },
              ]}
            />
          </View>
          <Text
            style={[styles.categoryText, { color: themeCon[theme].fontColor }]}
          >
            {Math.floor(parseInt(this.state.schoolPoints, 10) / 100) + 1}
          </Text>
        </View>
        <Text
          style={[styles.categoryText, { color: themeCon[theme].fontColor }]}
        >
          Fitness
        </Text>
        <View style={[styles.row]}>
          <Text
            style={[styles.categoryText, { color: themeCon[theme].fontColor }]}
          >
            {Math.floor(parseInt(this.state.fitnessPoints, 10) / 100)}
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                [StyleSheet.absoluteFill],
                {
                  backgroundColor: "#00ACBE",
                  width: this.getWidth(this.state.fitnessPoints),
                },
              ]}
            />
          </View>
          <Text
            style={[styles.categoryText, { color: themeCon[theme].fontColor }]}
          >
            {Math.floor(parseInt(this.state.fitnessPoints, 10) / 100) + 1}
          </Text>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  barContainer: {
    flex: 1,
    flexDirection: "column", //column direction
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 30,
    backgroundColor: "#ecf0f1",
    padding: 8,
  },
  progressBar: {
    height: 30,
    width: "80%",
    backgroundColor: "white",
    borderColor: "#000",
    borderWidth: 2,
    borderRadius: 5,
    marginBottom: 5,
  },
  categoryText: {
    padding: 5,
  },
  row: {
    flexDirection: "row",
  },
  likeButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  likeButtonText: {
    fontSize: 16,
    color: 'white',
  },
});
