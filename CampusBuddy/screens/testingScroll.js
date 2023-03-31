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
            style={{
              width: leftHeaderWidth,
              marginTop: topHeaderHeight,
            }}
            name="Time"
            onScroll={this.scrollEvent}
            scrollPosition={this.scrollPosition}
          />
          {/* This is the right vertical content */}
          <ScrollView horizontal bounces={true}>
            <View style={{ width: dailyWidth * 7 }}>
              <View
                style={{
                  height: topHeaderHeight,
                  justifyContent: "center",
                }}
              >
                <TopHeaderDays
                  holidays={this.state.holidays}
                  startDay={this.state.weekViewStartDate}
                />
              </View>
              {/* This is the vertically scrolling content. */}
              <ScrollViewVerticallySynced
                style={{
                  width: dailyWidth * 7,
                  backgroundColor: "#F8F8F8",
                }}
                name="notTime"
                onScroll={this.scrollEvent}
                scrollPosition={this.scrollPosition}
                eventList={this.state.totalCalendarList}
                weekStartDate={this.state.weekViewStartDate}
                calendarFilter={this.state.calendarUIVisibilityFilter}
                navigation={this.props.navigation}
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
