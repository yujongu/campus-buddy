export const getMonthName = (monthNumber) => {
  const MonthName = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return MonthName[monthNumber];
};

export const getMonthInt = (monthName) => {
  const MonthName = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return MonthName.indexOf(monthName);
};

export const getWeekDayName = (weekdayNumber, isFullname = false) => {
  const WeekdayName = ["Sun", "Mon", "Tues", "Wed", "Thur", "Fri", "Sat"];
  const WeekdayFullName = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  return isFullname
    ? WeekdayFullName[weekdayNumber]
    : WeekdayName[weekdayNumber];
};

export const isOnSameDate = (dateA, dateB) => {
  if (
    dateA.getFullYear() == dateB.getFullYear() &&
    dateA.getMonth() == dateB.getMonth() &&
    dateA.getDate() == dateB.getDate()
  ) {
    return true;
  }
  return false;
};

export const JSGetDate = (time) => {
  if (!time) {
    return "";
  }
  const monthName = getMonthName(time.getMonth());
  const d = time.getDate();
  const y = time.getFullYear();
  return `${monthName} ${d}, ${y}`;
};

export const JSClock = (time, showSeconds = true) => {
  const hour = time.getHours();
  const minute = time.getMinutes();
  const second = time.getSeconds();
  let temp = String(hour % 12);
  if (temp === "0") {
    temp = "12";
  }
  temp += (minute < 10 ? ":0" : ":") + minute;
  if (showSeconds) {
    if (second != 0) {
      temp += (second < 10 ? ":0" : ":") + second;
    }
  }

  temp += hour >= 12 ? " P.M." : " A.M.";
  return temp;
};

export const JSGetDateClock = (time, showSeconds = true) => {
  return JSGetDate(time) + " " + JSClock(time, showSeconds);
};

export const reverseJSGetDateClock = (str) => {
  let temp = str.split(" ");
  let timeTemp = temp[3].split(":");
  let resDate = new Date();
  resDate.setFullYear(temp[2]);
  resDate.setMonth(getMonthInt(temp[0]));
  resDate.setDate(temp[1].replace(",", ""));

  if (temp[4] == "P.M.") {
    resDate.setHours(parseInt(timeTemp[0]) + 12);
  } else {
    resDate.setHours(parseInt(timeTemp[0]));
  }
  resDate.setMinutes(timeTemp[1]);
  return resDate;
};

export const jsClockToDate = (str) => {
  try {
    let temp = str.split(":");
    if (temp.length < 2) {
      return null;
    }
    let hour = parseInt(temp[0]);
    let minute = temp[1].substring(0, 2);
    if (temp[1].substring(2).includes("PM")) {
      hour += 12;
    }
    const res = new Date();
    res.setHours(hour);
    res.setMinutes(minute);
    return res;
  } catch (e) {
    console.log(e);
    console.log(str);
  }
};

export const jsDateToDate = (str) => {
  let temp = str.split("/");
  if (temp.length == 3) {
    // const res = new Date();
    // res.setDate(1);
    // res.setFullYear(temp[2]);
    // res.setMonth(parseInt(temp[0]) - 1);
    // res.setDate(temp[1]);
    const res = new Date(temp[2], parseInt(temp[0]) - 1, temp[1]);

    return res;
  }
  return null;
};
