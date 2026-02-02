import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged, signOut, updateProfile } from "firebase/auth";
import { doc, getFirestore, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove, collection, addDoc, query, where, onSnapshot, orderBy, serverTimestamp, deleteDoc } from "firebase/firestore";
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

const loginAnonymous = async (displayName) => {
  try {
    const res = await signInAnonymously(auth);
    const user = res.user;

    // Check if user document already exists
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        username: displayName.toLowerCase(),
        name: displayName,
        avatar: "",
        bio: "Hey there! I am using Chat App",
        lastSeen: Date.now(),
        isAnonymous: true
      });
      await setDoc(doc(db, "userChats", user.uid), {
        chatData: []
      });
    } else {
      // Just update the name if it's already there
      await updateDoc(userRef, {
        name: displayName,
        lastSeen: Date.now()
      });
    }

    return user;
  } catch (error) {
    if (error.code === 'auth/admin-restricted-operation') {
      console.error("Anonymous Authentication is disabled in Firebase Console.");
      toast.error("Anonymous login is disabled. Please enable it in Firebase Console.");
    } else {
      console.error("Error logging in anonymously:", error);
      toast.error(`Entry error: ${error.message}`);
    }
  }
};

const logout = async () => {
  try {
    await signOut(auth);
    localStorage.removeItem('activeRoomId');
    localStorage.removeItem('activeChatUser');
  } catch (error) {
    console.error("Error logging out:", error);
    toast.error(error.code);
  }
}

const deleteRoom = async (roomId) => {
  try {
    const roomRef = doc(db, "rooms", roomId);
    await deleteDoc(roomRef);
    toast.success("Room deleted successfully");
    return true;
  } catch (error) {
    console.error("Error deleting room:", error);
    toast.error("Failed to delete room");
    return false;
  }
};

const createRoom = async (user) => {
  try {
    const roomId = Math.floor(100000 + Math.random() * 900000).toString();
    const roomRef = doc(db, "rooms", roomId);

    await setDoc(roomRef, {
      roomId,
      createdBy: user.uid,
      createdAt: serverTimestamp(),
      participants: [user.uid],
      name: `Room ${roomId}`
    });

    // Add room to user's chat list
    const userChatRef = doc(db, "userChats", user.uid);
    await updateDoc(userChatRef, {
      chatData: arrayUnion({
        roomId,
        lastMessage: "",
        updatedAt: Date.now()
      })
    });

    return roomId;
  } catch (error) {
    console.error("Error creating room:", error);
    toast.error("Failed to create room");
  }
};

const joinRoom = async (roomId, user) => {
  try {
    const roomRef = doc(db, "rooms", roomId);
    const roomSnap = await getDoc(roomRef);

    if (!roomSnap.exists()) {
      toast.error("Room does not exist");
      return false;
    }

    const roomData = roomSnap.data();
    if (roomData.participants.includes(user.uid)) {
      toast.info("You are already in this room");
      return true;
    }

    await updateDoc(roomRef, {
      participants: arrayUnion(user.uid)
    });

    const userChatRef = doc(db, "userChats", user.uid);
    await updateDoc(userChatRef, {
      chatData: arrayUnion({
        roomId,
        lastMessage: "",
        updatedAt: Date.now()
      })
    });

    return true;
  } catch (error) {
    console.error("Error joining room:", error);
    toast.error("Failed to join room");
    return false;
  }
};

const leaveRoom = async (roomId, user) => {
  try {
    const roomRef = doc(db, "rooms", roomId);
    const roomSnap = await getDoc(roomRef);

    if (roomSnap.exists()) {
      const roomData = roomSnap.data();
      const updatedParticipants = roomData.participants.filter(id => id !== user.uid);

      if (updatedParticipants.length === 0) {
        // Delete messages subcollection first (not strictly required for Firestore but good practice if you had many users, 
        // here we just delete the main doc for simplicity)
        await deleteDoc(roomRef);
        toast.info("Room deleted as last participant left");
      } else {
        await updateDoc(roomRef, {
          participants: arrayRemove(user.uid)
        });
      }
    }
    return true;
  } catch (error) {
    console.error("Error leaving room:", error);
    toast.error("Failed to leave room");
    return false;
  }
};

export { loginAnonymous, logout, deleteRoom, createRoom, joinRoom, leaveRoom, auth, db }