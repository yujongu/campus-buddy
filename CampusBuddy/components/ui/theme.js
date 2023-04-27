import { Colors } from "../../constants/colors";

const theme = {
  light: {
    theme: "light",
    color: "black",
    background: "white",
    calendarUIBackground: "white",
    calendarUIInnerBackground: "#F8F8F8",
    plusModalColor: "black",
    borderColor: "black",
    statusBarColor: "dark",
    feedItemBackground: Colors.light.background,
  },
  dark: {
    theme: "dark",
    color: "white",
    background: "black",
    fontColor: "white",
    calendarUIBackground: "black",
    calendarUIInnerBackground: "#1b1d21",
    plusModalColor: "white",
    borderColor: "white",
    statusBarColor: "light",
    feedItemBackground: Colors.dark.background,
  },
};

export default theme;
