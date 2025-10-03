import { createContext, useState, useEffect } from "react";
import tokenService from "../services/tokenService";
import userService from "../services/userService";
import { logoutUser } from "../services/apis";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Restore user from localStorage on page load
  useEffect(() => {
    const storedUser = userService.getUser();
    if (storedUser) setUser(storedUser);
  }, []);

  const login = (accessToken, refreshToken, userData) => {
    tokenService.setTokens(accessToken, refreshToken);
    userService.setUser(userData);
    setUser(userData);
  };


const logout = async () => {
  try {
    const refreshToken = tokenService.getRefreshToken();
    if (refreshToken) {
      // Pass the token string directly
      await logoutUser(refreshToken);
    }
  } catch (err) {
    console.error(err);
  } finally {
    tokenService.removeTokens();
    userService.removeUser();
    setUser(null);
  }
};

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
