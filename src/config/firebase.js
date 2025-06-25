import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, getFirestore, setDoc } from "firebase/firestore";
import { toast } from "react-toastify";
const firebaseConfig = {
  apiKey: "AIzaSyDSSDqb4dP8Nwt0oeW-quMF8UF9dxD1cK0",
  authDomain: "chat-app-f9b89.firebaseapp.com",
  projectId: "chat-app-f9b89",
  storageBucket: "chat-app-f9b89.firebasestorage.app",
  messagingSenderId: "1095716375029",
  appId: "1:1095716375029:web:b63c5f887103943be238bc"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const signup = async (username, email, password) => {
  try {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const user = res.user;
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      username: username.toLowerCase(),
      email,
      name:"",
      avatar: "",
      bio: "Hey there! I am using Chat App",
      lastSeen: Date.now()
    })
    await setDoc(doc(db, "userChats", user.uid), {
        chatData:[]
    })
  } catch (error) {
    console.error("Error signing up:");
    toast.error(error.code)
  }
};

export {signup}