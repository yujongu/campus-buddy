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

export const getWeekDayName = (weekdayNumber) => {
  const WeekdayName = ["Sun", "Mon", "Tues", "Wed", "Thur", "Fri", "Sat"];
  return WeekdayName[weekdayNumber];
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
  const monthName = getMonthName(time.getMonth());
  const d = time.getDate();
  const y = time.getFullYear();
  return `${monthName} ${d}, ${y}`;
};

export const JSClock = (time) => {
  const hour = time.getHours();
  const minute = time.getMinutes();
  const second = time.getSeconds();
  let temp = String(hour % 12);
  if (temp === "0") {
    temp = "12";
  }
  temp += (minute < 10 ? ":0" : ":") + minute;
  if (second != 0) {
    temp += (second < 10 ? ":0" : ":") + second;
  }
  temp += hour >= 12 ? " P.M." : " A.M.";
  return temp;
};
