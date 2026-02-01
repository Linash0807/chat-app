import { createContext, useEffect, useState } from "react";
import { auth, db } from "../config/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";

export const AppContext = createContext();

const AppContextProvider = (props) => {
    const [userData, setUserData] = useState(null);
    const [chatData, setChatData] = useState([]);
    const [messagesId, setMessagesId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [chatUser, setChatUser] = useState(null);

    const loadUserData = async (uid) => {
        try {
            const userRef = doc(db, 'users', uid);
            const userSnap = await getDoc(userRef);
            const userData = userSnap.data();
            setUserData(userData);

            // Watch userChats for changes (real-time room list)
            const chatRef = doc(db, 'userChats', uid);
            onSnapshot(chatRef, async (res) => {
                if (res.exists()) {
                    const chatItems = res.data().chatData;
                    const tempDate = [];
                    for (const item of chatItems) {
                        const roomRef = doc(db, 'rooms', item.roomId);
                        const roomSnap = await getDoc(roomRef);
                        if (roomSnap.exists()) {
                            const roomData = roomSnap.data();
                            tempDate.push({ ...item, roomData });
                        }
                    }
                    setChatData(tempDate.sort((a, b) => b.updatedAt - a.updatedAt));
                }
            })
        } catch (error) {
            if (error.code === 'permission-denied') {
                console.error("Firestore permission denied. Check your security rules.");
                toast.error("Permission denied. Check Firestore rules.");
            } else {
                console.error("Error loading user data:", error);
            }
        }
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                await loadUserData(user.uid);
            } else {
                setUserData(null);
                setChatData([]);
            }
        });
        return () => unsubscribe();
    }, []);

    const value = {
        userData, setUserData,
        chatData, setChatData,
        loadUserData,
        messages, setMessages,
        messagesId, setMessagesId,
        chatUser, setChatUser
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}

export default AppContextProvider;
