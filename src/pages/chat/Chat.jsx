import React from "react";
import './Chat.css';
import LeftSideBar from "../../components/leftsidebar/LeftSideBar";
import ChatBox from "../../components/chatbox/ChatBox";
const Chat = () => {
  return (
    <div className="chat">
      <div className="chat-container">
        <LeftSideBar />
        <ChatBox />
      </div>

    </div>
  );
}

export default Chat;
