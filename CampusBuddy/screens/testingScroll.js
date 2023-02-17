import React from "react";
import { ScrollView, Animated, Text, View } from "react-native";
import { Constants } from "expo";

export default class SyncScrollTest extends React.Component {
  constructor() {
    super();
    this.scrollPosition = new Animated.Value(0);
    this.scrollEvent = Animated.event(
      [{ nativeEvent: { contentOffset: { y: this.scrollPosition } } }],
      { useNativeDriver: false }
    );
  }

  render() {
    return (
      <View style={{ flex: 1, marginTop: 20 }}>
        <View style={{ flexDirection: "row" }}>
          <ScrollViewVerticallySynced
            style={{ width: 50, marginTop: 60 }}
            name="C1"
            color="#F2AFAD"
            onScroll={this.scrollEvent}
            scrollPosition={this.scrollPosition}
          />
          <ScrollView horizontal bounces={true}>
            <View style={{ width: 400 }}>
              <View
                style={{
                  height: 60,
                  justifyContent: "center",
                  backgroundColor: "#B8D2EC",
                }}
              >
                <Text>
                  I am Column Header!! I am Column Header!! I am Column Header!!
                  I am Column Header!! I am Column Header!! I am Column Header!!
                  I am Column Header!!
                </Text>
              </View>
              <ScrollViewVerticallySynced
                style={{ width: 400 }}
                name="C2"
                color="#D9E4AA"
                onScroll={this.scrollEvent}
                scrollPosition={this.scrollPosition}
              />
            </View>
          </ScrollView>
        </View>
      </View>
    );
  }
}

class ScrollViewVerticallySynced extends React.Component {
  componentDidMount() {
    this.listener = this.props.scrollPosition.addListener((position) => {
      this.instance.scrollTo({
        y: position.value,
        animated: false,
      });
    });
  }

  render() {
    const { name, color, style, onScroll } = this.props;
    return (
      <ScrollView
        key={name}
        ref={(ref) => (this.instance = ref)}
        style={style}
        scrollEventThrottle={1}
        onScroll={onScroll}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        {someRows(name, 25, color)}
      </ScrollView>
    );
  }
}

const someRows = (name, rowCount, color) =>
  Array.from(Array(rowCount).keys()).map((index) => (
    <View
      key={`${name}-${index}`}
      style={{
        height: 50,
        backgroundColor: index % 2 === 0 ? color : "white",
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text>
        {name} R{index + 1}
      </Text>
    </View>
  ));
