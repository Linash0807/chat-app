import React from 'react';
import { useState } from 'react';
import './Login.css';
import assets from '../../../assets/assets';
import {signup} from '../../config/firebase';


const Login = () => {

  const [currState,setCurrState] = useState('Sign up');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');



  return (
    <div className="login-page">
         <img src={assets.logo_big} alt="logo" />
        <form action="" className="login-form">
          <h1>{currState}</h1>
          {currState === 'Sign up' ?<input type="text" placeholder="username" className="form-input" required /> : null}
          <input type="text" placeholder="email" className="form-input" required />
          <input type="password" placeholder="password" className="form-input" required />
          <button type='submit'>{currState === 'Sign up' ? "Create Account" : "Login Now"}</button>
          <div className="login-term">
            <input type="checkbox" />
            <p>Agree to Terms and Conditions</p>
          </div>
          <div className="login-forgot">
            {
              currState === 'Sign up' ? 
              <p className="login-toggle" onClick={() => setCurrState('login')}>Already have an account? <span>Click here</span></p> :
              <p className="login-toggle" onClick={() => setCurrState('Sign up')}>Create an account? <span>Click here</span></p>
            }
          </div>
        </form>
           </div>
  );
}

  export default Login;

