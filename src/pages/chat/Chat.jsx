import React from "react";
import './Chat.css'; 
import LeftSideBar from "../../components/leftsidebar/leftSideBar";
import RightSideBar from "../../components/rightsidebar/rightSideBar";
import ChatBox from "../../components/chatbox/chatBox";
const Chat = () => {
  return (
    <div className="chat">
      <div className="chat-container">
        <LeftSideBar/>
        <ChatBox/>
        <RightSideBar/>
      </div>

    </div>
  );
}

export default Chat;
