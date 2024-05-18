import { useEffect, useState } from "react";
import Guest from "../components/guest";
import { sendMessage, socket, useTimer } from "../hooks/SocketProvider";

export type Connection = {
  id: string;
  number: number;
  status: string;
  vote: number[];
};
export enum Action {
  IDLE = 0,
  VOTE = 1,
}
export type Player = { name: string; ingame: boolean; id: number };
export type AppState = { currentAction: Action; players: Player[] };

const timeToString = (time: number) =>
  `${Math.floor(time / 60)}:${(time % 60).toString().padStart(2, "0")}`;

function AdminApp() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [appState, setAppState] = useState<AppState>({
    currentAction: Action.IDLE,
    players: [],
  });
  const [votes, setVotes] = useState<Record<string, number>>({});
  const time = useTimer();
  const [times, setTimes] = useState([
    30, 60, 90, 120, 150, 180, 210, 240, 270, 300,
  ]);
  const [selectedTime, setSelectedTime] = useState<number | null>(null);
  const [voteTime, setVoteTime] = useState<number>(0);
  const [voteTimer, setVoteTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
      sendMessage("admin");
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onConnectionsEvent(connections: Connection[]) {
      setConnections(connections);
    }

    function onStateEvent(state: AppState) {
      setAppState(state);
    }

    function onVotesEvent(votes: Record<string, number>) {
      setVotes(votes);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connections", onConnectionsEvent);
    socket.on("state", onStateEvent);
    socket.on("votes", onVotesEvent);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connections", onConnectionsEvent);
      socket.off("state", onStateEvent);
      socket.off("votes", onVotesEvent);
    };
  }, []);

  useEffect(() => {
    if (appState.currentAction == Action.VOTE && voteTimer == null) {
      setVoteTimer(setInterval(() => setVoteTime((time) => time + 1), 1000));
    } else if (appState.currentAction == Action.IDLE && voteTimer) {
      clearInterval(voteTimer);
      setVoteTimer(null);
    }
    return () => {
      if (voteTimer) {
        clearInterval(voteTimer);
      }
    };
  }, [appState.currentAction, voteTimer]);

  return (
    <main className="flex flex-col p-2 [&>section]:m-0 text-white">
      <section>{isConnected ? "Connecté" : "Erreur de connection"}</section>
      <section>
        <h1 className="text-white text-xl">Public:</h1>
        <div className="flex gap-2 items-start align-baseline space-y-0">
          {connections.map((connection) => (
            <Guest connection={connection} key={connection.id} />
          ))}
        </div>
      </section>
      <section className="flex flex-col gap-1">
        <h1 className="text-white text-xl">Contrôle:</h1>
        <div className="flex gap-2 items-start align-baseline space-y-0">
          <button
            className={`${
              appState.currentAction == Action.IDLE
                ? "bg-amber-500"
                : "bg-slate-500"
            } py-2 px-4 rounded text-white text-md`}
            onClick={() => {
              socket.emit("startPlaying");
            }}
          >
            Au jeu!
          </button>
          <button
            className={`${
              appState.currentAction == Action.VOTE
                ? "bg-amber-500"
                : "bg-slate-500"
            } py-2 px-4 rounded text-white text-md`}
            onClick={() => {
              setVoteTime(0);
              socket.emit("startVoting");
            }}
          >
            Vote
            {appState.currentAction == Action.VOTE
              ? ` (${timeToString(voteTime)})`
              : undefined}
          </button>
        </div>
        <div className="flex gap-2 items-start align-baseline space-y-0">
          {appState.players.map((p, i) => (
            <div
              key={i}
              className={`w-36 flex flex-col overflow-hidden rounded border-2 select-none cursor-pointer ${
                p.ingame ? "border-amber-300" : "border-slate-300"
              } bg-slate-600`}
              onClick={() => {
                socket.emit("toggle", i);
              }}
            >
              <div className="text-center">{p.name}</div>
              <div className="text-center">{votes[p.id] || 0}</div>
            </div>
          ))}
        </div>
      </section>
      <section className="flex flex-col gap-1">
        <h1 className="text-xl">Timer: {timeToString(time)}</h1>
        <div className="flex flex-row justify-start gap-2">
          <button
            className={`bg-green-500 py-2 px-4 rounded text-white text-md`}
            onClick={() => {
              fetch("/admin/timer/start", { method: "POST" });
            }}
          >
            Démarrer
          </button>
          <button
            className={`bg-red-500 py-2 px-4 rounded text-white text-md`}
            onClick={() => {
              fetch("/admin/timer/stop", { method: "POST" });
            }}
          >
            Arrêter
          </button>
          <select
            className="bg-slate-500 rounded"
            onChange={(evt) => {
              let value = parseInt(evt.currentTarget.value);
              console.log(value);
              if (isNaN(value))
                value = parseInt(prompt("Durée en secondes") || "0");
              if (isNaN(value)) value = 0;
              setTimes([...times, value].sort((a, b) => a - b));
              setSelectedTime(value);
            }}
            value={selectedTime || ""}
          >
            {times.map((e, i) => (
              <option key={i} value={e}>
                {timeToString(e)}
              </option>
            ))}
            <option value="custom">Autre</option>
          </select>
          <button
            className={`bg-slate-500 py-2 px-4 rounded text-white text-md`}
            onClick={() => {
              if (!selectedTime) return;
              fetch("/admin/timer/set/" + selectedTime, { method: "POST" });
            }}
          >
            Remise à zéro
          </button>
        </div>
      </section>
    </main>
  );
}

export default AdminApp;
