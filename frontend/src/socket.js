import { io } from "socket.io-client";

export const socket = io("http://localhost:3000", {
  withCredentials: true,
  //   transports: ["websocket"],
}); // ya tere backend ka actual URL
