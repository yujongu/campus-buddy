export const getSportsFromTitle = (title) => {
  const sports = [
    "Baseball",
    "Cross Country",
    "Football",
    "Men's Basketball",
    "Men's Golf",
    "Men's Swimming & Diving",
    "Men's Tennis",
    "Soccer",
    "Softball",
    "Track & Field",
    "Volleyball",
    "Women's Basketball",
    "Women's Golf",
    "Women's Swimming & Diving",
    "Women's Tennis",
    "Wrestling",
  ];

  for (let i = 0; i < sports.length; i++) {
    if (title.includes(sports[i])) {
      return sports[i];
    }
  }
  return "";
};

export const extractTitle = (title) => {
  const temp = title.split(" ");
  //   console.log(temp.indexOf(""));
  let t = temp[temp.indexOf("") + 1];
  for (let i = temp.indexOf("") + 2; i < temp.length; i++) {
    t += " " + temp[i];
  }
  return t;
};

export const rssParser = (str) => {
  const temp = JSON.parse(str);
  console.log(temp);
};
