import React, { useState } from 'react';
import './Login.css';
import assets from '../../../assets/assets';
import { loginAnonymous } from '../../config/firebase';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';

const Login = () => {
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const { loadUserData } = React.useContext(AppContext);

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    if (name.trim()) {
      const user = await loginAnonymous(name);
      if (user) {
        await loadUserData(user.uid);
        navigate('/chat');
      }
    }
  };

  return (
    <div className="login-page">
      <img src={assets.logo_big} alt="logo" />
      <form onSubmit={onSubmitHandler} className="login-form">
        <h1>Join Chat</h1>
        <input
          onChange={(e) => setName(e.target.value)}
          value={name}
          type="text"
          placeholder="Enter your name"
          className="form-input"
          required
        />
        <button type="submit">Start Chatting</button>
        <div className="login-term">
          <input type="checkbox" required />
          <p>Agree to Terms and Conditions</p>
        </div>
      </form>
    </div>
  );
}

export default Login;

