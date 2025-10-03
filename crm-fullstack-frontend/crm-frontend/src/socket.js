
import tokenService from "./services/tokenService";
import { io } from "socket.io-client";
 

let socket = null;

export const getSocket = () => socket;

export const connectSocket = () => {
  if (!socket) {
    const token = tokenService.getAccessToken();
    socket = io("http://localhost:3000", {
      auth: { token },
      autoConnect: true,
    });
    console.log("🔌 Socket connected with token:", token);
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log("🔌 Socket disconnected");
  }
};

export const joinUserRoom = (userId) => {
  socket?.emit("joinRoom", userId);
};

export const onRoleUpdated = (callback) => {
  socket?.on("roleUpdated", callback);
};

export const onUserDeleted = (callback) => {
  socket?.on("userDeleted", callback);
};

export const onUserRegistered = (callback) => {
  socket?.on("userRegistered", callback);
};

