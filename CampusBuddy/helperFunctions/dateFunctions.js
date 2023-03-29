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
