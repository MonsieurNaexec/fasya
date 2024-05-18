import { sendMessage, socket } from "hooks/SocketProvider";
import { useEffect, useState } from "react";
import { Action, AppState } from "./admin-app";
import Vote from "./pages/vote";
import Wait from "./pages/wait";

function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [appState, setAppState] = useState<AppState>({
    currentAction: Action.IDLE,
    players: [],
  });
  const [voteFor, setVoteFor] = useState<number[]>([]);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
      sendMessage("guest");
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onStateEvent(state: AppState) {
      if (
        appState.currentAction != Action.VOTE &&
        state.currentAction == Action.VOTE
      ) {
        setVoteFor([]);
        window.navigator.vibrate([200, 100, 300]);
      }
      if (appState.players.some((p) => !p.ingame && voteFor.includes(p.id)))
        setVoteFor([]);
      setAppState(state);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("state", onStateEvent);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("state", onStateEvent);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    socket.emit("vote", voteFor);
  }, [voteFor]);

  return (
    <main className="h-[100dvh] w-screen overflow-hidden flex text-white select-none">
      {isConnected ? (
        appState.currentAction == Action.IDLE ? (
          <Wait statusText="Profite du spectacle!" />
        ) : appState.currentAction == Action.VOTE ? (
          <Vote
            players={appState.players}
            voteFor={voteFor}
            onVote={setVoteFor}
          />
        ) : null
      ) : (
        <Wait statusText="Connexion..." />
      )}
    </main>
  );
}

export default App;
