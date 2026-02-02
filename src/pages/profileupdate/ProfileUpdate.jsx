import React, { useState, useContext, useEffect } from "react";
import './ProfileUpdate.css';
import assets from "../../../assets/assets";
import { AppContext } from "../../context/AppContext";
import { db } from "../../config/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const ProfileUpdate = () => {
  const { userData, setUserData } = useContext(AppContext);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [image, setImage] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (userData) {
      setName(userData.name || "");
      setBio(userData.bio || "");
    }
  }, [userData]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      if (!userData) return;

      const userRef = doc(db, 'users', userData.uid);
      const updateData = {
        name: name,
        bio: bio,
        lastSeen: Date.now()
      };

      await updateDoc(userRef, updateData);

      setUserData({ ...userData, ...updateData });
      toast.success("Profile updated successfully!");
      navigate('/chat');
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  return (
    <div className="profile">
      <div className="profile-container">
        <form onSubmit={handleUpdate}>
          <h3>Profile Details</h3>
          <label htmlFor="avatar">
            <input onChange={(e) => setImage(e.target.files[0])} type="file" id="avatar" accept='.png, .jpg, .jpeg' hidden />
            <img src={image ? URL.createObjectURL(image) : (userData?.avatar || assets.avatar_icon)} alt="" />
            upload Profile Image
          </label>
          <input
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <textarea
            placeholder="Write profile Bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            required
          ></textarea>
          <button type="submit">Update Profile </button>
        </form>
        <img className="profile-pic" src={image ? URL.createObjectURL(image) : (userData?.avatar || assets.logo_icon)} alt="" />
      </div>
    </div>
  );
}

export default ProfileUpdate;
