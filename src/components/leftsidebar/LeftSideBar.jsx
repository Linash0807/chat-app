import './LeftSideBar.css'
import assets from '../../../assets/assets';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { createRoom, joinRoom, logout } from '../../config/firebase';
import { toast } from 'react-toastify';

const LeftSideBar = () => {
    const navigate = useNavigate();
    const { userData, chatData, setChatUser, setMessagesId } = useContext(AppContext);

    const handleCreateRoom = async () => {
        if (!userData) {
            toast.warn("Loading user profile, please wait...");
            return;
        }
        const roomId = await createRoom(userData);
        if (roomId) {
            toast.success(`Room created! ID: ${roomId}`);
        }
    }

    const handleJoinRoom = async () => {
        if (!userData) {
            toast.warn("Loading user profile, please wait...");
            return;
        }
        const roomId = prompt("Enter Room ID:");
        if (roomId) {
            const success = await joinRoom(roomId, userData);
            if (success) {
                toast.success("Joined room!");
            }
        }
    }

    const setChat = async (room) => {
        setMessagesId(room.roomId);
        setChatUser(room);
    }

    return (
        <div className="ls">
            <div className="ls-top">
                <div className="ls-nav">
                    <img src={assets.logo} alt="" className="logo" />
                    <div className="menu">
                        <img src={assets.menu_icon} alt="" />
                        <div className="sub-menu">
                            <p onClick={() => navigate('/profile')}>Edit profile</p>
                            <hr />
                            <p onClick={() => logout()}>Logout</p>
                        </div>
                    </div>
                </div>
                <div className="ls-search">
                    <button onClick={handleCreateRoom} className="room-btn">Create Room</button>
                    <button onClick={handleJoinRoom} className="room-btn">Join Room</button>
                </div>
            </div>
            <div className="ls-list">
                {chatData.map((item, index) => (
                    <div key={index} onClick={() => setChat(item)} className="friends">
                        <img src={assets.profile_img} alt="" />
                        <div>
                            <p>{item.name}</p>
                            <span>{item.lastMessage || "No messages yet"}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default LeftSideBar;
