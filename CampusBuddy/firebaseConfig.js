// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth"
import { getFirestore, collection, addDoc, getDocs,doc, setDoc, getDoc } from "firebase/firestore";

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
  measurementId: "G-TCW4V6Q3P4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
export {auth};

const db = getFirestore();
export {db};

export async function createUser(username, first, last, email, password) {
  try {
    const docRef = await addDoc(collection(db, "users"), {
      id: username,
      first: first,
      last: last,
      email: email,
      password: password,
      points: 0
    });
    auth.
    console.log("Document written with ID: ", docRef.id)
  } catch (e) {
    console.error("Error adding doc: ", e);
  }
  createUserWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    console.log("Successfully added new user")
  })
  .catch((error) =>
    alert(error)
  )
  
}

export async function addSchedule(user_token, data){
  const docRef = doc(db, "schedule", user_token)
  var res = []
  try {
    data.map(element => {
      const str = {
        data: element.endTime+
        ','+element.location+
        ","+element.startTime+
        ","+element.title
      }
      res.push(str);
    })
    setDoc(docRef, {
      things: res
    });
    console.log("Document written with ID: ", docRef.id)
  } catch (e) {
    console.error("Error adding doc: ", e);
  }
}

export async function userSchedule(user_token){
  try{
    const querySnapShot = await getDoc(doc(db, "schedule", user_token));
    if(querySnapShot.exists()){
      const result = querySnapShot.data();
      return result;
    }else{
      return null;
    }
  }catch(error){
    alert(error);
  }
  
}