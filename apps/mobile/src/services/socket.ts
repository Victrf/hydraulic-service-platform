import { io } from "socket.io-client";

const SOCKET_URL = "http://10.145.80.98:3000";

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ["websocket"],
});
