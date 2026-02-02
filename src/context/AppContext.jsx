import { createContext, useEffect, useState } from "react";
import { auth, db } from "../config/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, onSnapshot, query, collection, where } from "firebase/firestore";
import { toast } from "react-toastify";

export const AppContext = createContext();

const AppContextProvider = (props) => {
    const [userData, setUserData] = useState(null);
    const [isFetching, setIsFetching] = useState(true);
    const [chatData, setChatData] = useState([]);
    const [messagesId, setMessagesId] = useState(localStorage.getItem('activeRoomId') || null);
    const [messages, setMessages] = useState([]);
    const [chatUser, setChatUser] = useState(JSON.parse(localStorage.getItem('activeChatUser')) || null);

    const loadUserData = async (uid) => {
        setIsFetching(true);
        try {
            const userRef = doc(db, 'users', uid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                const data = userSnap.data();
                setUserData(data);

                // Listen to ALL rooms where this user is a participant
                const roomsQuery = query(
                    collection(db, 'rooms'),
                    where('participants', 'array-contains', uid)
                );

                onSnapshot(roomsQuery, (snapshot) => {
                    const rooms = snapshot.docs.map(doc => doc.data());
                    setChatData(rooms.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)));

                    if (messagesId) {
                        const currentRoom = rooms.find(r => r.roomId === messagesId);
                        if (currentRoom) {
                            setChatUser(currentRoom);
                            localStorage.setItem('activeChatUser', JSON.stringify(currentRoom));
                        } else if (chatUser) {
                            setMessagesId(null);
                            setChatUser(null);
                            localStorage.removeItem('activeRoomId');
                            localStorage.removeItem('activeChatUser');
                            toast.info("Room has been deleted");
                        }
                    }
                }, (error) => {
                    console.error("Rooms snapshot listener error:", error);
                    if (error.code === 'permission-denied') {
                        toast.error("Permission denied: Unable to fetch chat rooms.");
                    }
                });
            } else {
                console.warn("User profile not found in Firestore for UID:", uid);
                setUserData(null);
            }
        } catch (error) {
            console.error("Error loading user data:", error);
            setUserData(null);
        } finally {
            setIsFetching(false);
        }
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                await loadUserData(user.uid);
            } else {
                setUserData(null);
                setChatData([]);
                setMessagesId(null);
                setChatUser(null);
                localStorage.removeItem('activeRoomId');
                localStorage.removeItem('activeChatUser');
                setIsFetching(false);
            }
        });
        return () => unsubscribe();
    }, []);

    const value = {
        userData, setUserData,
        isFetching, setIsFetching,
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
