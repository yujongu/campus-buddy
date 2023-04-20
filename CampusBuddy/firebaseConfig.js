// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { getDownloadURL, getStorage, ref } from "firebase/storage";
import { EmailAuthProvider, credential } from "firebase/auth";
import {
  arrayRemove,
  deleteDoc,
  query,
  runTransaction,
  where,
} from "firebase/firestore";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  getDoc,
  QueryEndAtConstraint,
  updateDoc,
  arrayUnion,
  addDoc,
} from "firebase/firestore";
import uuid from "react-native-uuid";
import { FieldValue } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDBf2TxclOxjPE5OshjJVCkS6ZCDQ8mIXc",
  authDomain: "campusbuddy-8ef5d.firebaseapp.com",
  projectId: "campusbuddy-8ef5d",
  storageBucket: "campusbuddy-8ef5d.appspot.com",
  messagingSenderId: "968571721255",
  appId: "1:968571721255:web:61445d3dc559a1f4afa002",
  measurementId: "G-TCW4V6Q3P4",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore();
const storage = getStorage(app);
export { auth, db, storage };
const dbRef = collection(db, "users");

export async function checkUser(firstName, lastName, userId) {
  console.log(userId);
  return new Promise((resolve, reject) => {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("id", "==", userId));
    getDocs(q)
      .then((querySnapshot) => {
        let foundUser = null;
        querySnapshot.forEach((doc) => {
          const user = doc.data();
          if (user.first === firstName && user.last === lastName) {
            foundUser = user;
          }
        });
        if (foundUser) {
          alert(`The email address of the user is ${foundUser.email}`);
        } else {
          resolve(null);
          alert("The entered informations are wrong");
        }
      })
      .catch((error) => {
        console.error(error);
        reject(error);
      });
  });
}

export async function checkEmailExists(email) {
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("email", "==", email));
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) {
    console.log("User not found.");
    alert("User not found");
    return false;
  }
  return true;
}

export async function createUser(username, first, last, email, password) {
  const querySnapshot = await getDocs(
    query(collection(db, "users"), where("id", "==", username))
  );
  if (!querySnapshot.empty) {
    throw new Error("Username already exists");
  }
  await createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      console.log("Successfully added new user " + userCredential.user.uid);
      try {
        //add user to db
        setDoc(doc(db, "users", userCredential.user.uid), {
          id: username,
          first: first,
          last: last,
          email: email,
          password: password,
          points: {
            school: 0,
            fitness: 0,
          },
          points_privacy: false,
          calendar_privacy: false,
        });
        //initialize a user in db/requests
        setDoc(doc(db, "requests", userCredential.user.email), {
          from_request: [],
          to_request: [],
        });
        //initialize user friend list
        setDoc(doc(db, "friend_list", userCredential.user.email), {
          friends: [],
          favorite: [],
        });
      } catch (e) {
        console.error("Error adding doc: ", e);
      }
    })
    .catch((error) => {
      alert("creating user:" + error);
    });
}

export async function fetchProfilePicture(user_id) {
  const imageRef = ref(storage, `profilePictures/${user_id}`);
  try {
    const downloadURL = await getDownloadURL(imageRef);
    return downloadURL;
  } catch (error) {
    if (error.code === "storage/object-not-found") {
      console.log("No profile picture found, using a default image.");
      return null;
    } else {
      console.error("Error fetching profile picture:", error);
      return null;
    }
  }
}

export async function addSchedule(user_token, data) {
  const docRef = doc(db, "schedule", user_token);
  const querySnapShot = await getDoc(docRef);
  if (!querySnapShot.exists()) {
    setDoc(docRef, {
      classes: [],
    });
  }

  try {
    data.map((element) => {
      const x = {
        title: element.title,
        location: element.location,
        startTime: element.startTime,
        endTime: element.endTime,
      };
      const data = {
        id: uuid.v4(),
        class: x,
      };
      updateDoc(docRef, {
        classes: arrayUnion(data),
      });
    });

    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding doc: ", e);
  }
}

export async function userSchedule(user_token) {
  try {
    const querySnapShot = await getDoc(doc(db, "schedule", user_token));
    if (querySnapShot.exists()) {
      const result = querySnapShot.data();
      return result;
    } else {
      return null;
    }
  } catch (error) {
    alert("userSchedule: " + error);
  }
}

export async function getGoals(user_token) {
  try {
    const querySnapShot = await getDoc(doc(db, "goals", user_token));
    if (querySnapShot.exists()) {
      const result = querySnapShot.data();
      return result;
    } else {
      return null;
    }
  } catch (error) {
    alert("Error retrieving user goals " + error);
  }
}

export async function addGoal(user_token, id, points, category, deadline) {
  const docRef = doc(db, "goals", user_token);

  try {
    const querySnapShot = await getDoc(doc(db, "goals", user_token));
    if (!querySnapShot.exists()) {
      setDoc(docRef, {
        goal_list: [],
      });
    }
    const data = {
      id: id,
      points: points,
      category: category,
      deadline: deadline,
      progress: 0,
    };
    updateDoc(docRef, { goal_list: arrayUnion(data) });
    console.log("Goal written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding goal: ", e);
  }
}

export async function addEvent(
  user_token,
  title,
  startTime,
  endTime,
  location,
  description,
  category,
  point_value,
  color,
  repetition,
  id,
  eventMandatory,
  audienceLevel
) {
  const docRef = doc(db, "events", user_token);
  const x = {
    title: title,
    startTime: startTime,
    endTime: endTime,
    location: location,
    description: description,
    category: category,
    point_value: point_value,
    color: color,
    repetition: repetition,
    eventMandatory: eventMandatory,
    audienceLevel: audienceLevel,
  };
  try {
    const querySnapShot = await getDoc(doc(db, "events", user_token));
    if (!querySnapShot.exists()) {
      setDoc(docRef, {
        event: [],
      });
    }
    const data = {
      id: id,
      details: x,
    };
    updateDoc(docRef, { event: arrayUnion(data) });
    console.log("Event doc written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding event: ", e);
  }
}

export async function addRepeatingEvent(
  user_token,
  title,
  startTime,
  endTime,
  location,
  description,
  category,
  point_value,
  color,
  repetitionPattern,
  repetitionValue,
  repetitionHasEndDateValue,
  repetitionEndDate,
  repetitionDays,
  id,
  eventMandatory,
  audienceLevel
) {
  const docRef = doc(db, "recurring_events", user_token);
  const x = {
    title: title,
    startTime: startTime,
    endTime: endTime,
    location: location,
    description: description,
    category: category,
    point_value: point_value,
    color: color,
    repetitionPattern: repetitionPattern,
    repetitionValue: repetitionValue,
    repetitionHasEndDateValue: repetitionHasEndDateValue,
    repetitionEndDate: repetitionEndDate,
    repetitionDays: repetitionDays,
    eventMandatory: eventMandatory,
    audienceLevel: audienceLevel,
  };
  try {
    const querySnapShot = await getDoc(doc(db, "recurring_events", user_token));
    if (!querySnapShot.exists()) {
      setDoc(docRef, {
        event: [],
      });
    }
    const data = {
      id: id,
      details: x,
    };
    updateDoc(docRef, { event: arrayUnion(data) });
    console.log("Event doc written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding event: ", e);
  }
}

export async function getUserEvents(user_token) {
  try {
    const querySnapShot = await getDoc(doc(db, "events", user_token));
    if (querySnapShot.exists()) {
      const result = querySnapShot.data();
      return result;
    } else {
      return null;
    }
  } catch (error) {
    alert("Error getting user events: " + error);
  }
}

export async function getUserRecurringEvents(user_token) {
  try {
    const querySnapShot = await getDoc(doc(db, "recurring_events", user_token));
    if (querySnapShot.exists()) {
      const result = querySnapShot.data();
      return result;
    } else {
      return null;
    }
  } catch (error) {
    alert("Error getting user events: " + error);
  }
}

export async function userList() {
  var result = [];
  try {
    const querySnapShot = await getDocs(collection(db, "users"));
    querySnapShot.forEach((element) => {
      if (auth.currentUser?.email != element.data().email)
        result.push(element.data());
    });
    return result;
  } catch (error) {
    alert("userList: " + error);
  }
}

export async function friendList(user_token) {
  const querySnapShot = await getDoc(doc(db, "friend_list", user_token));
  if (querySnapShot.exists()) {
    const result = querySnapShot.data();
    return result;
  } else {
    const docRef = doc(db, "friend_list", user_token);
    var res = [];
    setDoc(docRef, {
      friends: res,
    });
    return null;
  }
}

/** If group name exists, returns group doc id. Else returns null  */
export async function addGroup(groupName, groupAuthor) {
  try {
    const res = await getDocs(
      query(collection(db, "groups"), where("groupName", "==", groupName))
    );
    if (res.empty) {
      const docRef = await addDoc(collection(db, "groups"), {
        groupName,
        memberList: [groupAuthor],
      });
      // console.log("Group created with docref id: ", docRef.id);
      return docRef.id;
    } else {
      return null;
    }
  } catch (e) {
    console.log(e);
  }
}

export async function addMembersToGroup(gid, memberList) {
  try {
    const docRef = await doc(db, "groups", gid);
    await updateDoc(docRef, { memberList: arrayUnion(...memberList) });
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
}

export async function removeMemberFromGroup(groupName, memberInfo) {
  const q = query(
    collection(db, "groups"),
    where("groupName", "==", groupName)
  );

  const querySnapshot = await getDocs(q);

  if (querySnapshot.size == 1) {
    const groupDocRef = doc(db, "groups", querySnapshot.docs[0].id);

    await updateDoc(groupDocRef, { memberList: arrayRemove(memberInfo.user) });
    const data = await getDoc(groupDocRef);
    if (data.data().memberList.length == 0) {
      //if I'm the last member of the group, remove the group all together.
      await deleteDoc(doc(db, "groups", querySnapshot.docs[0].id));
    }
    return true;
  } else {
    return false;
  }
}

export async function addNicknameInGroup(
  groupName,
  email,
  prevNickname,
  newNickname
) {
  const q = query(
    collection(db, "groups"),
    where("groupName", "==", groupName)
  );

  const querySnapshot = await getDocs(q);

  if (querySnapshot.size == 1) {
    const groupDocRef = doc(db, "groups", querySnapshot.docs[0].id);

    try {
      await runTransaction(db, async (transaction) => {
        const docRef = await transaction.get(groupDocRef);
        if (!docRef.exists()) {
          throw "Document does not exist!";
        }

        transaction.update(groupDocRef, {
          nicknames: arrayRemove({ nickname: prevNickname, user: email }),
        });
        transaction.update(groupDocRef, {
          nicknames: arrayUnion({ nickname: newNickname, user: email }),
        });
      });
    } catch (e) {
      console.error(e);
    }
  }
}

export async function getUserId(email) {
  var res = [];
  try {
    const querySnapShot = await getDocs(collection(db, "users"));
    querySnapShot.forEach(async (element) => {
      if (element.data().email == email) {
        console.log("id found", element.id);
        res.push(element.id);
        // const schedule = await userSchedule(element.id)
        // console.log("schedule", schedule);
      }
    });
    return res;
  } catch (e) {
    console.error("Error getting user's id: ", e);
  }
}

export async function to_request(own, to_user, type, message) {
  const docRef = doc(db, "requests", own);
  const docRef_to = doc(db, "requests", to_user);

  if (type == "friend") {
    try {
      updateDoc(docRef, {
        to_request: arrayUnion(to_user + "/" + type),
      });
      updateDoc(docRef_to, {
        from_request: arrayUnion(own + "/" + type),
      });
      console.log("Successfully sent friend request: ", docRef.id);
    } catch (e) {
      console.error("Error adding doc: ", e);
    }
  } else if (type == "event") {
    try {
      updateDoc(docRef, {
        to_request: arrayUnion(to_user + "/" + message + "/" + type),
      });
      updateDoc(docRef_to, {
        from_request: arrayUnion(own + "/" + message + "/" + type),
      });
      console.log("Successfully sent event request: ", docRef.id);
    } catch (e) {
      console.error("Error adding doc: ", e);
    }
  }
}

export async function addPoints(user_token, category, points) {
  const docRef = doc(db, "users", user_token);
  const querySnapShot = await getDoc(doc(db, "users", user_token));
  //const oldPoints = querySnapShot.data().points.school;
  let oldPoints;
  switch(category){
    case 'school':
      oldPoints = querySnapShot.data().points.school;
      break;
    case 'fitness':
      oldPoints = querySnapShot.data().points.fitness;
      break;
    default:
      console.log(`Category \"${category}\" was not recognized. It may need added to the switch case.`);
  }

  console.log("snapshot", category, points);
  try {
    updateDoc(docRef, {
      ["points." + category]: oldPoints + points,
    });
    console.log("Successfully updated points: ", docRef.id);
    if (Math.floor((oldPoints / 100)) != (Math.floor((oldPoints + points) / 100)) && querySnapShot.data().points_privacy == true){ //They passed a multiple of 100 and their points are public
      recordLevelUp(user_token, category, oldPoints+points);
    }
  } catch (e) {
    console.error("Error updating points: ", e);
  }
}

//Makes a new levelup entry and records it under the user document.
export async function recordLevelUp(user_token, category, points){
  const docRef = doc(db, "levelups", user_token);
  const level = Math.floor(points / 100);
  const time = new Date();
  try {
    const querySnapShot = await getDoc(doc(db, "levelups", user_token));
    const data = {
      id: id,
      category: category,
      level: level,
      time: time
    };
    if (querySnapShot.exists()) {
      const oldLevelUps = querySnapShot.data();
      for(let lvl in oldLevelUps) m
    }
    //TODO: Check if this user already has an older levelup in this category, and overwrite it instead if so.
    else{
      setDoc(docRef, {
        levelup: [],
      });
    }

    updateDoc(docRef, { levelup: arrayUnion(data) });
    console.log("Levelup doc written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error recording levelup: ", e);
  }
}

//gets the level ups from a single user. Includes all categories of levelups.
export async function getLevelUps(user_token){
  var result = [];
  try{
    const querySnapshot = await getDoc(doc(db, "levelups", user_token));
    if(querySnapshot.exists()){
      result = querySnapshot.data();
      return result;
    } else {
      return null;
    }
  } catch (error){
    alert(`Error getting levelups for user ${user_token}: ` + error);
  }
}