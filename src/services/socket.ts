import { io, Socket } from "socket.io-client";

interface SocketAuth {
  userId: string;
  role?: string;
  name: string;
  token: string;
}

let socket: Socket | null = null;

/**
 * Connect socket (called AFTER login)
 */
export const connectSocket = (auth: SocketAuth): void => {
  if (socket) return;

  socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000", {
    auth: {
      userId: auth.userId,
      role: auth.role,
      name: auth.name,
      token: auth.token,
    },
    transports: ["websocket"],
    reconnection: true,          // ✅ IMPORTANT
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
    autoConnect: true,
  });

  socket.on("connect", () => {
    console.log("🔌 Socket connected:", socket?.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("❌ Socket disconnected:", reason);
  });

  socket.on("connect_error", (err) => {
    console.error("⚠️ Socket connection error:", err.message);
  });
};

/**
 * Get active socket
 */
export const getSocket = (): Socket | null => socket;

/**
 * Disconnect socket (on logout)
 */
export const disconnectSocket = (): void => {
  if (!socket) return;

  socket.off();
  socket.disconnect();
  socket = null;

  console.log("🧹 Socket cleared");
};
