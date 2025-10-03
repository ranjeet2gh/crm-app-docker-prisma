 
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import "./Navbar.css";

export default function Navbar({ notifications, setNotifications }) {
  const { user, logout } = useContext(AuthContext);
  const [imgError, setImgError] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const getInitial = (name) => (name ? name[0].toUpperCase() : "?");

  const getProfileSrc = () => {
    if (!user?.profilePicture) return null;
    if (user.profilePicture.startsWith("http")) return user.profilePicture;
    return `http://localhost:3000/${user.profilePicture}`;
  };

  const clearNotifications = (e) => {
    e.stopPropagation();
    setNotifications([]);
  };

  return (
    <nav className="navbar">
      <span className="navbar-title">CRM Dashboard</span>

      {user && (
        <div className="navbar-right">
          {/* Notifications */}
          <div
            className="notification-wrapper"
            onClick={() => setShowDropdown((prev) => !prev)}
          >
            <span className="notification-bell">🔔</span>
            {notifications.length > 0 && (
              <span className="notification-count">{notifications.length}</span>
            )}

            {showDropdown && (
              <div className="notification-dropdown">
                <div className="dropdown-header">
                  <strong>Notifications</strong>
                  {notifications.length > 0 && (
                    <button onClick={clearNotifications} className="clear-btn">
                      Clear
                    </button>
                  )}
                </div>
                <hr />
                {notifications.length === 0 ? (
                  <div className="no-notifications">No notifications</div>
                ) : (
                  notifications.map((n, idx) => (
                 <div key={idx} className="notification-item">
                 <div>{n.message}</div>
                 <small>{n.time}</small>
                 </div>
                 ))
                )}
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="navbar-user">
            {user.profilePicture && !imgError ? (
              <img
                src={getProfileSrc()}
                alt="Profile"
                onError={() => setImgError(true)}
                className="profile-img"
              />
            ) : (
              <div className="profile-initial">{getInitial(user.name)}</div>
            )}
            <span>{user.name}</span>
            <button onClick={logout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
