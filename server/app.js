const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const path = require("path");
const io = new Server(server);
const basicAuth = require("express-basic-auth");
// const { Server: WSServer, WebSocket } = require("ws");
// const companion = new WSServer({ server });

// companion.on("error", (e) => {
//   console.error(e);
// });

// companion.on("connection", (sock) => {
//   sendCompanion([votes[0] ?? 0, votes[1] ?? 0, votes[2] ?? 0, votes[3] ?? 0]);
//   console.log("companion", sock.readyState);
// });

// const sendCompanion = (data) => {
//   console.log("clients", companion.clients);
//   companion.clients.forEach(function each(client) {
//     if (client.readyState === WebSocket.OPEN) {
//       client.send(data);
//     }
//   });
// };

const PORT = process.env.PORT || 3030;

const Action = {
  IDLE: 0,
  VOTE: 1,
};

let index = 100;
let state = {
  currentAction: Action.IDLE,
  players: [
    {
      id: 0,
      name: " Soulaymane",
      ingame: true,
    },
    {
      id: 1,
      name: "Fatima",
      ingame: true,
    },
    {
      id: 2,
      name: "Salima",
      ingame: true,
    },
    {
      id: 3,
      name: "Noé",
      ingame: true,
    },
  ],
};
let votes = {};
let timeLeft = 240;
let timerInterval = null;

const sendTimer = () => {
  io.to(["timer", "admins"]).emit("timer", timeLeft);
};
const startTimer = () => {
  if (timerInterval !== null) return;
  timerInterval = setInterval(() => {
    if (timeLeft > 0) timeLeft--;
    else {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    sendTimer();
    console.log("Time left:", timeLeft);
  }, 1000);
  console.log("starting timer");
};
const stopTimer = () => {
  clearInterval(timerInterval);
  timerInterval = null;
  console.log("stopping timer");
};
const setTimer = (time) => {
  timeLeft = time;
  sendTimer();
};

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

app.get("/admin/votes", (req, res) => {
  res.json([votes[0] ?? 0, votes[1] ?? 0, votes[2] ?? 0, votes[3] ?? 0]);
});

app.get("/admin", basicAuth({ users: { admin: "FASYA&123" } }), (req, res) => {
  res.sendFile(path.join(__dirname, "public/admindashboard.html"));
});

app.post("/admin/timer/start", (req, res) => {
  startTimer();
  res.sendStatus(204);
});
app.post("/admin/timer/stop", (req, res) => {
  stopTimer();
  res.sendStatus(204);
});
app.post("/admin/timer/set/:time", (req, res) => {
  if (isNaN(parseInt(req.params.time))) {
    res.sendStatus(400);
    return;
  }
  setTimer(parseInt(req.params.time));
  res.sendStatus(204);
});

const sendConnections = () => {
  const guests = io.sockets.adapter.rooms.get("guests");
  io.to("admins").emit(
    "connections",
    (guests ? [...guests] : []).map((sockId) => {
      const sock = io.sockets.sockets.get(sockId);
      return {
        id: sock.id,
        number: sock.number,
        status: sock.status,
        vote: sock.vote,
      };
    })
  );
  console.log(guests);
};
const sendState = () => {
  io.emit("state", state);
};
const sendVotes = () => {
  io.to("admins").emit("votes", votes);
  //sendCompanion([votes[0] ?? 0, votes[1] ?? 0, votes[2] ?? 0, votes[3] ?? 0]);
};
const updateVotes = () => {
  const guests = io.sockets.adapter.rooms.get("guests");
  votes = (guests ? [...guests] : []).reduce((result, sockId) => {
    const sock = io.sockets.sockets.get(sockId);
    const newResults = result;
    sock.vote?.forEach((v) => (newResults[v] = (newResults[v] ?? 0) + 1));
    return newResults;
  }, {});
};

io.on("connection", (socket) => {
  socket.on("guest", async () => {
    await socket.join("guests");
    socket.status = "OK";
    socket.vote = [];
    if (typeof socket.number === "undefined") socket.number = index++;
    socket.on("vote", (vote) => {
      if (state.currentAction !== Action.VOTE) return;
      socket.vote = vote;
      sendConnections();
      updateVotes();
      sendVotes();
    });
    sendConnections();
    sendState();
  });
  socket.on("admin", async () => {
    await socket.join("admins");
    sendConnections();
    sendState();
    sendTimer();
    socket.on("startVoting", () => {
      state.currentAction = Action.VOTE;
      sendState();
    });
    socket.on("startPlaying", () => {
      state.currentAction = Action.IDLE;
      sendState();
    });
    socket.on("toggle", (i) => {
      if (state.players[i]) state.players[i].ingame = !state.players[i].ingame;
      sendState();
    });
  });
  socket.on("timer", async () => {
    await socket.join("timer");
    sendTimer();
  });

  socket.on("disconnect", () => {
    if (state.currentAction == Action.VOTE) updateVotes();
    sendVotes();
    sendConnections();
  });

  socket.onAny(console.log);
  socket.onAnyOutgoing((...args) => console.log(["out", ...args]));
  console.log("New client joined");
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`listening on *:${PORT}`);
});
