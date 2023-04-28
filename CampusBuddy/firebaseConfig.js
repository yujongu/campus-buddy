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
  Timestamp,
  arrayRemove,
  deleteDoc,
  increment,
  onSnapshot,
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
import { AudienceLevelType } from "./constants/AudienceLevelType";
import { JSGetDateClock } from "./helperFunctions/dateFunctions";

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
        color: element.color, //need to test
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

export async function addEvent_maybe(
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
  audienceLevel,
  profilePic
) {
  const docRef = doc(db, "events_maybe", user_token);
  const x = {
    title: title,
    startTime: new Date(startTime),
    endTime: new Date(endTime),
    location: location,
    description: description,
    category: category,
    point_value: point_value,
    color: color,
    repetition: repetition,
    eventMandatory: eventMandatory,
    audienceLevel: audienceLevel,
    profilePic: profilePic
  };
  try {
    const querySnapShot = await getDoc(doc(db, "events_maybe", user_token));
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
    console.log("Maybe doc written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding event: ", e);
  }
}

export async function updateEventPrivacy (user_token, id, privacy) {
  const userDocRef = doc(db, "events", user_token);
  const res = await getUserEvents(user_token);
  console.log(res)
  for (let i = 0; i < res["event"].length; i++) {
    console.log(res["event"][i]["id"], id)
    if (res["event"][i]["id"] == id) {
      console.log("match")
      await updateDoc(userDocRef, { event: arrayRemove(res["event"][i]) })
        .then(() => {
          console.log("Successfully removed old event.");
        })
        .catch((error) => {
          console.error("Error removing old event", error);
        });
      let tempItem = res["event"][i];
      tempItem.details.audienceLevel = privacy;
      tempItem.id = uuid.v4();
      await updateDoc(userDocRef, { event: arrayUnion(tempItem) })
        .then(() => {
          console.log("Successfully updated event privacy.");
        })
        .catch((error) => {
          console.error("Error updating event privacy", error);
        });
      break;
    }
  }
}
export async function addBoardData(
  user_token,
  point_value, 
  category,
) {
  const docRef = doc(db, "board", user_token);
  const x = {
    category: category,
    point_value: point_value,
  };
  try {
    const querySnapShot = await getDoc(doc(db, "board", user_token));
    if (!querySnapShot.exists()) {
      setDoc(docRef, {
        data: [],
        point: point_value
      });
    }
    const data = {
      category: category,
      point_value: point_value,
    };
    updateDoc(docRef, { data: arrayUnion(data), point: increment(point_value) });
    console.log("Board doc written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding board data: ", e);
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
export async function removeRecurringEvents(user_token, eventId, newEndDate) {
  const docRef = doc(db, "recurring_events", user_token);
  try {
    const querySnapShot = await getDoc(doc(db, "recurring_events", user_token));
    if (!querySnapShot.exists()) {
      console.error("Something went wrong overwriteRecurringEvents");
      return;
    }

    for (let i = 0; i < querySnapShot.data().event.length; i++) {
      let item = querySnapShot.data().event[i];

      if (item.id == eventId) {
        console.log(item.details);
        let tempItem = querySnapShot.data().event[i];
        tempItem.details.repetitionHasEndDateValue = 1;
        tempItem.details.repetitionEndDate = newEndDate;
        await runTransaction(db, async (transaction) => {
          transaction.update(docRef, { event: arrayRemove(item) });
          transaction.update(docRef, { event: arrayUnion(tempItem) });
        });
      }
    }
    console.log("Overwrite event doc written with ID: ", docRef.id);
  } catch (error) {
    console.error(error);
  }
}

export async function overwriteRecurringEvents(
  user_token,
  eventId,
  overwriteDate,
  removeFromArray
) {
  const docRef = doc(db, "recurring_events", user_token);
  try {
    const querySnapShot = await getDoc(doc(db, "recurring_events", user_token));
    if (!querySnapShot.exists()) {
      console.error("Something went wrong overwriteRecurringEvents");
      return;
    }
    if (removeFromArray) {
      updateDoc(docRef, {
        cancelRecurringEvent: arrayRemove({ eventId, overwriteDate }),
      });
    } else {
      updateDoc(docRef, {
        cancelRecurringEvent: arrayUnion({ eventId, overwriteDate }),
      });
    }

    console.log("Overwrite event doc written with ID: ", docRef.id);
  } catch (error) {
    console.error(error);
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
        privacy: true
      });
      //console.log("Group created with docref id: ", docRef.id);
      setDoc(doc(db, "group_events", groupName), {
        event: [],
      });

      // initialize group_events database
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

export async function addGroupEvent(
  groupName,
  title,
  startTime,
  endTime,
  description,
  location) {
  const docRef = doc(db, "group_events", groupName);
  const x = {
    title: title,
    startTime: startTime,
    endTime: endTime,
    description: description,
    location: location,
  };
  try{
    const querySnapShot = await getDoc(doc(db, "group_events", groupName));
    if (!querySnapShot.exists()) {
      setDoc(docRef, {
        event: [],
      });
    }
    const data = {
      details: x,
    };
    updateDoc(docRef, { event: arrayUnion(data) });
    //console.log("Group Event doc written with ID: ", docRef.id);
  } catch (e) {
    console.log(e);
    console.log("Error adding group event");
    return false;
  }
}

export async function getGroupEvents(groupName) {
  try {
    const docRef = doc(db, "group_events", groupName);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return data.event || [];
    } else {
      console.log("No such document!");
      return [];
    }
  } catch (e) {
    console.log(e);
    return [];
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
  const oldPoints = querySnapShot.data().points.school;
  console.log("snapshot", category, points);
  try {
    updateDoc(docRef, {
      ["points." + category]: oldPoints + points,
    });
    console.log("Successfully updated points: ", docRef.id);
  } catch (e) {
    console.error("Error updating points: ", e);
  }
}

export async function getLeaderboard() {
  const boardsnapshot = await getDocs(collection(db, "board"));
  const eventPromises = []; // Create an array to hold all the promises

  let fList = new Map();

  const usersSnapshot = await getDocs(collection(db, "users"));
  usersSnapshot.forEach((doc) => {
    fList.set(doc.id, doc.data().id);
  });
  const result = [];
  boardsnapshot.forEach((doc) => {
    const promise = (async () => {
      const data = await fetchProfilePicture(doc.id);
      const x = {
        userToken: doc.id,
        userId: fList.get(doc.id),
        profilePic: data,
        point: doc.data().point,
      };
      result.push(x);
    })();
    eventPromises.push(promise); // Add the promise to the array
  });

  await Promise.all(eventPromises); // Wait for all promises to resolve
  return result;
}

export async function getFeed(user_token, user_email) {
  //Fetch all friends' token and email address
  const friendsSnapshot = await getDoc(doc(db, "friend_list", user_email));

  let fList = new Map();

  //Include myself
  let friendList = [user_email];
  if (friendsSnapshot.exists()) {
    friendsSnapshot.data().favorite.forEach((fav) => {
      friendList.push(fav.user);
    });
    friendsSnapshot.data().friends.forEach((friend) => {
      friendList.push(friend.user);
    });
  }

  const usersSnapshot = await getDocs(collection(db, "users"));
  usersSnapshot.forEach((doc) => {
    if (friendList.indexOf(doc.data().email) != -1) {
      fList.set(doc.id, doc.data().email);
    }
  });

  let eventList = [];
  const eventsSnapshot = await getDocs(collection(db, "events"));
  const eventPromises = []; // Create an array to hold all the promises

  eventsSnapshot.forEach((doc) => {
    const promise = (async () => {
      const data = await fetchProfilePicture(doc.id);

      for (eventItem of doc.data().event) {
        switch (eventItem.details.audienceLevel) {
          case AudienceLevelType.PUBLIC.value:
            const eventItemDetail = eventItem.details;
            const x = {
              id: eventItem.id,
              userId: doc.id,
              profilePic: data,
              title: eventItemDetail.title,
              description: eventItemDetail.description,
              location: eventItemDetail.location,
              startTime: JSGetDateClock(
                new Date(eventItemDetail.startTime.seconds * 1000),
                false
              ),
              endTime: JSGetDateClock(
                new Date(eventItemDetail.endTime.seconds * 1000),
                false
              ),
              color: eventItemDetail.color,
              pointValue: eventItemDetail.point_value,
              category: eventItemDetail.category,
              eventMandatory: eventItemDetail.eventMandatory,
            };
            eventList.push(x);
            break;
          case AudienceLevelType.PRIVATE.value:
            //Don't fetch private events
            break;
          case AudienceLevelType.FRIENDS.value:
            if (fList.get(doc.id) != undefined) {
              const eventItemDetail = eventItem.details;
              const x = {
                id: eventItem.id,
                userId: doc.id,
                profilePic: data,
                title: eventItemDetail.title,
                description: eventItemDetail.description,
                location: eventItemDetail.location,
                startTime: JSGetDateClock(
                  new Date(eventItemDetail.startTime.seconds * 1000),
                  false
                ),
                endTime: JSGetDateClock(
                  new Date(eventItemDetail.endTime.seconds * 1000),
                  false
                ),
                color: eventItemDetail.color,
                pointValue: eventItemDetail.point_value,
                category: eventItemDetail.category,
                eventMandatory: eventItemDetail.eventMandatory,
              };
              eventList.push(x);
            }
            break;
        }
      }
    })();
    eventPromises.push(promise); // Add the promise to the array
  });

  await Promise.all(eventPromises); // Wait for all promises to resolve

  return eventList;
}

export async function getMaybe(user_token, user_email) {
  //Fetch all friends' token and email address
  const friendsSnapshot = await getDoc(doc(db, "friend_list", user_email));

  let fList = new Map();

  //Include myself
  let friendList = [user_email];
  if (friendsSnapshot.exists()) {
    friendsSnapshot.data().favorite.forEach((fav) => {
      friendList.push(fav.user);
    });
    friendsSnapshot.data().friends.forEach((friend) => {
      friendList.push(friend.user);
    });
  }

  const usersSnapshot = await getDocs(collection(db, "users"));
  usersSnapshot.forEach((doc) => {
    if (friendList.indexOf(doc.data().email) != -1) {
      fList.set(doc.id, doc.data().email);
    }
  });

  let eventList = [];
  const eventsSnapshot = await onSnapshot(doc(db, "events_maybe", auth.currentUser?.uid), (doc) => {
    const promise = (async () => {
      const data = await fetchProfilePicture(doc.id);

      for (eventItem of doc.data().event) {

            const eventItemDetail = eventItem.details;
            const x = {
              id: eventItem.id,
              userId: doc.id,
              profilePic: eventItemDetail.profilePic,
              title: eventItemDetail.title,
              description: eventItemDetail.description,
              location: eventItemDetail.location,
              startTime: JSGetDateClock(
                new Date(eventItemDetail.startTime.seconds * 1000),
                false
              ),
              endTime: JSGetDateClock(
                new Date(eventItemDetail.endTime.seconds * 1000),
                false
              ),
              color: eventItemDetail.color,
              pointValue: eventItemDetail.point_value,
              category: eventItemDetail.category,
              eventMandatory: eventItemDetail.eventMandatory,
            };
            eventList.push(x);
        }
      }
    )();
    eventPromises.push(promise); // Add the promise to the array
  });
  const eventPromises = []; // Create an array to hold all the promises

  // eventsSnapshot.forEach((doc) => {
    
  // });

  await Promise.all(eventPromises); // Wait for all promises to resolve

  return eventList;
}