
import { useEffect, useContext, useState, useRef } from "react";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import Register from "./components/Register";
import OAuthSuccess from "./components/OAuthSuccess";
import { connectSocket, joinUserRoom, onRoleUpdated, onUserDeleted, onUserRegistered } from "./socket";

function AppContent() {
  const { user } = useContext(AuthContext);
  const [page, setPage] = useState("login");
  const [notifications, setNotifications] = useState([]);
  const socketInitialized = useRef(false); // ensure socket only initialized once

  useEffect(() => {
    if (!user?.id || socketInitialized.current) return;

    const socket = connectSocket();

    // Event listeners
    const roleListener = (data) => setNotifications((prev) => [...prev, data]);
    const deleteListener = (data) => setNotifications((prev) => [...prev, data]);
    const registeredListener = (data) => setNotifications((prev) => [...prev, data]);

    onRoleUpdated(roleListener);
    onUserDeleted(deleteListener);
    onUserRegistered(registeredListener);

    // Join user room
    joinUserRoom(user.id);

    socketInitialized.current = true; // prevent re-initialization

    // Cleanup (only remove listeners)
    return () => {
      socket.off("roleUpdated", roleListener);
      socket.off("userDeleted", deleteListener);
      socket.off("userRegistered", registeredListener);
    };
  }, [user?.id]);

  //OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has("accessToken")) setPage("oauth-success");
  }, []);

  if (user) return <Dashboard notifications={notifications} setNotifications={setNotifications} />;
  if (page === "oauth-success") return <OAuthSuccess />;
  if (page === "login") return <Login switchPage={setPage} />;
  return <Register switchPage={setPage} />;
  }

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
