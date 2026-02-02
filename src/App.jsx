import React, { useContext, useEffect } from "react";
import { HashRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Chat from "./pages/chat/Chat";
import Login from "./pages/login/Login";
import ProfileUpdate from "./pages/profileupdate/ProfileUpdate";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AppContext } from "./context/AppContext";

const AppRoutes = () => {
  const { userData, isFetching } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isFetching) return; // Wait for profile fetch to complete

    if (!userData && location.pathname !== '/login') {
      navigate('/login');
    } else if (userData && location.pathname === '/login') {
      navigate('/chat');
    }
  }, [userData, isFetching, location.pathname, navigate]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/profile" element={<ProfileUpdate />} />
      <Route path="*" element={<Login />} />
    </Routes>
  );
}

const App = () => {
  return (
    <>
      <ToastContainer />
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </>
  );
}

export default App;