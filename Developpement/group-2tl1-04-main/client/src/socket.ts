import { io } from "socket.io-client";

const socket = io("http://91.134.138.136:3000", {
  transports: ["websocket", "polling"],
  withCredentials: true,
  autoConnect: true,
});

socket.on("connect", () => {
  console.log("🟢 Socket connecté :", socket.id);
});

socket.on("disconnect", () => {
  console.log("🔴 Socket déconnecté");
});

socket.on("connect_error", (err) => {
  console.log("❌ Socket error :", err.message);
});

export default socket;