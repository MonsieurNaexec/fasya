import { useEffect, useState } from "react";
import { io } from "socket.io-client";

export const socket = io();
socket.onAny((e, ...args) =>
  console.log(`Message ${e} received with arguments: [${args.join(", ")}]`)
);

type Connection = {
  id: string;
  number: number;
  status: string;
};

export const sendMessage = (event: string, ...args: never[]) => {
  socket.emit(event, ...args);
};

export const useConnections = () => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const handleConnectionsChange = (connections: Connection[]) =>
    setConnections(connections);
  socket.on("connections", handleConnectionsChange);
  useEffect(() => () => {
    socket.off("connections", handleConnectionsChange);
  });
  return connections;
};

export const useTimer = () => {
  const [time, setTime] = useState(0);
  const handleTimerChange = (time: number) => setTime(time);
  useEffect(() => {
    socket.on("timer", handleTimerChange);
    return () => {
      socket.off("timer", handleTimerChange);
    };
  });
  return time;
};
