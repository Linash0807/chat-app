import React, { useState } from "react";
import './ProfileUpdate.css'; // Assuming you have a CSS file for styling
import assets from "../../../assets/assets";
const ProfileUpdate = () => {
 
  const [image,setimage]=useState(false);

  return (
    <div className="profile">
      <div className="profile-container">
        <form>
          <h3>Profile Details</h3>
          <label htmlFor="avatar">
            <input onChange={(e) => setimage(e.target.files[0])} type="file" id="avatar" accept='.png, .jpg, .jpeg' hidden/>
            <img src={image?URL.createObjectURL(image):assets.avatar_icon} alt="" />
            upload Profile Image
          </label>
          <input type="text"  placeholder="Your Name" name="" id="" required/>
          <textarea placeholder="Write profile Bio"  required ></textarea>
          <button type="submit">Update Profile </button>
        </form>
        <img  className="profile-pic" src={image?URL.createObjectURL(image):assets.logo_icon} alt="" />
      </div>
    </div>
  );
}

export default ProfileUpdate;
