import './ChatBox.css';
import assets from '../../../assets/assets';
import React, { useContext, useEffect, useState, useRef } from 'react';
import { AppContext } from '../../context/AppContext';
import { db, leaveRoom, deleteRoom } from '../../config/firebase';
import { doc, onSnapshot, serverTimestamp, updateDoc, collection, addDoc, query, orderBy, getDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';

const ChatBox = () => {
  const { userData, messagesId, chatUser, messages, setMessages, setMessagesId, setChatUser } = useContext(AppContext);
  const [input, setInput] = useState("");
  const [participants, setParticipants] = useState([]);
  const [userMap, setUserMap] = useState({}); // UID to Name mapping
  const scrollRef = useRef();

  const fetchParticipants = async () => {
    if (chatUser && chatUser.participants) {
      const newUserMap = { ...userMap };
      const names = [];

      await Promise.all(chatUser.participants.map(async (uid) => {
        if (!newUserMap[uid]) {
          const userRef = doc(db, 'users', uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            newUserMap[uid] = userSnap.data().name;
          } else {
            newUserMap[uid] = "Unknown";
          }
        }
        names.push(newUserMap[uid]);
      }));

      setUserMap(newUserMap);
      setParticipants(names);
    }
  }

  useEffect(() => {
    fetchParticipants();
  }, [chatUser, messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleDeleteRoom = async () => {
    if (window.confirm("Are you the creator? This will delete the room for EVERYONE. Proceed?")) {
      const success = await deleteRoom(messagesId);
      if (success) {
        setMessagesId(null);
        setChatUser(null);
        localStorage.removeItem('activeRoomId');
        localStorage.removeItem('activeChatUser');
      }
    }
  }

  const handleLeaveRoom = async () => {
    if (window.confirm("Are you sure you want to leave this room?")) {
      const success = await leaveRoom(messagesId, userData);
      if (success) {
        setMessagesId(null);
        setChatUser(null);
        localStorage.removeItem('activeRoomId');
        localStorage.removeItem('activeChatUser');
        toast.success("Left room");
      }
    }
  }

  const sendMessage = async () => {
    try {
      if (input && messagesId) {
        const messageData = {
          text: input,
          sId: userData.uid,
          sName: userData.name,
          createdAt: serverTimestamp()
        }

        await addDoc(collection(db, "rooms", messagesId, "messages"), messageData);

        const roomRef = doc(db, 'rooms', messagesId);
        await updateDoc(roomRef, {
          lastMessage: `${userData.name}: ${input}`,
          updatedAt: Date.now()
        });

        setInput("");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  }

  useEffect(() => {
    if (messagesId) {
      const q = query(
        collection(db, "rooms", messagesId, "messages"),
        orderBy("createdAt", "asc")
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        setMessages(snapshot.docs.map(doc => doc.data()));
      }, (error) => {
        console.error("Messages snapshot listener error:", error);
        if (error.code === 'permission-denied') {
          toast.error("Permission denied: Unable to load messages.");
        }
      });

      return () => unsubscribe();
    }
  }, [messagesId]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  }

  return chatUser ? (
    <div className="chat-box">
      <div className="chat-user">
        <img className='arrow' onClick={() => { setMessagesId(null); setChatUser(null); }} src={assets.arrow_icon} alt="Back" />
        <img src={assets.profile_img} alt="" />
        <div className="chat-info">
          <p>{chatUser.name || chatUser.roomId} <img className='dot' src={assets.green_dot} alt="" /></p>
          <span className="participants">{participants.join(", ")}</span>
        </div>
        <div className="chat-actions">
          {chatUser.createdBy === userData?.uid ? (
            <img onClick={handleDeleteRoom} src={assets.help_icon} className='help' title="Delete Room (Creator)" alt="Delete Room" />
          ) : (
            <img onClick={handleLeaveRoom} src={assets.help_icon} className='help' title="Leave Room" alt="Leave Room" />
          )}
        </div>
      </div>

      <div className="chat-msg" ref={scrollRef}>
        {messages.map((msg, index) => (
          <div key={index} className={msg.sId === userData.uid ? "s-msg" : "r-msg"}>
            <div className="msg-content">
              <p className="sender-name">
                {msg.sId === userData?.uid ? "You" : (msg.sName || userMap[msg.sId] || "Unknown")}
              </p>
              <p className="msg">{msg.text}</p>
            </div>
            <div>
              <img src={assets.profile_img} alt="" />
              <p>{msg.createdAt ? new Date(msg.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="chat-input" onKeyDown={handleKeyDown}>
        <input onChange={(e) => setInput(e.target.value)} value={input} type="text" placeholder='Send a Message' />
        <input type="file" name="" id="image" accept='image/png , image/jpeg' hidden />
        <label htmlFor="image">
          <img src={assets.gallery_icon} alt="" />
        </label>
        <img onClick={sendMessage} src={assets.send_button} alt="" />
      </div>
    </div>
  ) : (
    <div className='chat-welcome'>
      <img src={assets.logo_icon} alt="" />
      <p>Select a room to start chatting</p>
    </div>
  );
}

export default ChatBox;
