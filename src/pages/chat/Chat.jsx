import React, { useContext } from "react";
import './Chat.css';
import LeftSideBar from "../../components/leftsidebar/LeftSideBar";
import ChatBox from "../../components/chatbox/ChatBox";
import { AppContext } from "../../context/AppContext";

const Chat = () => {
  const { chatUser } = useContext(AppContext);

  return (
    <div className="chat">
      <div className={`chat-container ${chatUser ? 'has-chat' : ''}`}>
        <LeftSideBar />
        <ChatBox />
      </div>

    </div>
  );
}

export default Chat;
