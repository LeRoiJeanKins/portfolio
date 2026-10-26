import app from "./app.js";
import sequelize from "./config/database.js";
import "./models/Utilisateur.js";
import Question from "./models/Question.js";
import "dotenv/config";
import "./models/Salon.js";
import Salon from "./models/Salon.js";
import Utilisateur from "./models/Utilisateur.js";
import ListeStat from "./models/ListeStat.js";



import http from "http";
import { Server } from "socket.io";

const rooms: Record<string, RoomState> = {};

const port = 3000;
const MAX_PLAYERS = 12;
const ANSWER_TIME = 10000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://91.134.138.136:5173",
    credentials: true,
  },
});

type Player = {
  id: string;
  pseudo: string;
  score: number;
  blocked: boolean;
  isHost: boolean;
  userId: number | null;
  buzzes: number;
  correctAnswers: number;
  wrongAnswers: number;
  responseTimes: number[];
};

 type RoomState = {
  players: Player[];
  questions: any[];
  currentIndex: number;
  buzzer: string | null;
  timer: ReturnType<typeof setTimeout> | null;
  answerTimer: ReturnType<typeof setTimeout> | null;
  questionStartTime: number | null;
};

 function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) =>
      i === 0 ? j : j === 0 ? i : 0
    )
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

function isCloseEnough(guess: string, answer: string): boolean {
  const g = guess.trim().toLowerCase();
  const a = answer.trim().toLowerCase();
  const dist = levenshtein(g, a);
  if (a.length <= 4) return dist === 0;
  if (a.length <= 7) return dist <= 1;
  return dist <= 2;
}



function allBlocked(state: RoomState): boolean {
  return state.players.every((p) => p.blocked);
}

function shuffleQuestions(questions: any[]): any[] {
  const q = [...questions];
  for (let i = q.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [q[i], q[j]] = [q[j], q[i]];
  }
  return q;
}

function emitScores(room: string) {
  const state = rooms[room];
  if (!state) return;
  io.to(room).emit(
    "scores-update",
    state.players.map((p: Player) => ({
      id: p.id,
      pseudo: p.pseudo,
      score: p.score,
    }))
  );
}

function startQuestionTimer(room: string) {
  const state = rooms[room];
  if (!state) return;

  if (state.timer) clearTimeout(state.timer);

  state.questionStartTime = Date.now();
  io.to(room).emit("timer-start", { duration: 30 });

  state.timer = setTimeout(() => {
    if (!rooms[room]) return;
    const currentQuestion = state.questions[state.currentIndex];
    if (!currentQuestion) return;

    io.to(room).emit("answer-result-reveal", {
      answer: currentQuestion.reponse,
    });

    state.currentIndex++;
    state.buzzer = null;
    setTimeout(() => sendCurrentQuestion(room), 3000);
  }, 30000);
}

function startAnswerTimer(room: string) {
  const state = rooms[room];
  if (!state) return;

  if (state.answerTimer) clearTimeout(state.answerTimer);

  io.to(room).emit("answer-timer-start", { duration: 10 });

  state.answerTimer = setTimeout(() => {
    if (!rooms[room]) return;
    if (!state.buzzer) return;

    const player = state.players.find((p: Player) => p.id === state.buzzer);
    if (!player) return;

    player.blocked = true;
    player.wrongAnswers += 1;
    state.buzzer = null;

    io.to(room).emit("answer-result", {
      correct: false,
      pseudo: player.pseudo,
      answer: null,
    });

    emitScores(room);

    if (allBlocked(state)) {
      if (state.timer) clearTimeout(state.timer);
      const currentQuestion = state.questions[state.currentIndex];
      io.to(room).emit("answer-result-reveal", { answer: currentQuestion.reponse });
      state.currentIndex++;
      setTimeout(() => sendCurrentQuestion(room), 3000);
    }
  }, ANSWER_TIME);
}

function sendCurrentQuestion(room: string) {
  const state = rooms[room];
  if (!state) return;

  state.buzzer = null;
  state.players.forEach((p: Player) => (p.blocked = false));

  if (state.currentIndex >= state.questions.length) {
    const winner = state.players.reduce((best: Player, p: Player) =>
      p.score > best.score ? p : best
    );
    io.to(room).emit("game-over", {
      winner: winner.pseudo,
      scores: state.players.map((p: Player) => ({ pseudo: p.pseudo, score: p.score })),
    });
    saveStats(room);
    return;
  }

  const q = state.questions[state.currentIndex];
  io.to(room).emit("new-question", {
    id: q.id,
    question: q.ennonce,
    imageUrl: q.pieceJointe
      ? "http://91.134.138.136:3000" + q.pieceJointe
      : null,
    index: state.currentIndex + 1,
    total: state.questions.length,
  });

  startQuestionTimer(room);
}


async function deleteSalonFromDb(roomName: string) {
  try {
    await Salon.destroy({ where: { nom_salon: roomName } });
    console.log(`Salon ${roomName} supprimé de la DB`);
  } catch (e) {
    console.error("Erreur suppression salon :", e);
  }
}

async function saveStats(room: string) {
  const state = rooms[room];
  if (!state) return;

  console.log("saveStats players:", state.players.map((p: Player) => ({ pseudo: p.pseudo, userId: p.userId })));

  const winner = state.players.reduce((best: Player, p: Player) =>
    p.score > best.score ? p : best
  );

  for (const player of state.players) {
    console.log("checking player:", player.pseudo, "userId:", player.userId, "!!userId:", !!player.userId);

    if (!player.userId) {
      console.log("skip player (no userId):", player.pseudo);
      continue;
    }

    try {
      console.log("updating stats for userId:", player.userId);

      const user = await Utilisateur.findByPk(player.userId, {
        include: [{ model: ListeStat, as: "ListeStat" }],
      });

      if (!user) {
        console.log("user not found for userId:", player.userId);
        continue;
      }

      console.log("id_liste_stat:", (user as any).id_liste_stat);

      const stat = await ListeStat.findByPk((user as any).id_liste_stat);
      if (!stat) {
        console.log("stat not found for id_liste_stat:", (user as any).id_liste_stat);
        continue;
      }

      const avgTime = player.responseTimes.length > 0
        ? player.responseTimes.reduce((a: number, b: number) => a + b, 0) / player.responseTimes.length / 1000
        : 0;

      const currentAvg = (stat as any).temps_moyen_reponse || 0;
      const currentParties = (stat as any).nbr_parties || 0;
      const newAvg = currentParties > 0
        ? (currentAvg * currentParties + avgTime) / (currentParties + 1)
        : avgTime;

      await (stat as any).update({
        nbr_parties: currentParties + 1,
        nbr_victoires: (stat as any).nbr_victoires + (winner.id === player.id ? 1 : 0),
        nbr_bonnes_reponses: (stat as any).nbr_bonnes_reponses + player.correctAnswers,
        nbr_mauvaises_reponse: (stat as any).nbr_mauvaises_reponse + player.wrongAnswers,
        nbr_de_buzz: (stat as any).nbr_de_buzz + player.buzzes,
        temps_moyen_reponse: newAvg,
      });

      console.log("stats updated for userId:", player.userId);
    } catch (e) {
      console.error("Erreur sauvegarde stats :", e);
    }
  }
}

io.on("connection", (socket) => {
  console.log("connecté :", socket.id);

  socket.on("join-room", ({ room, pseudo, userId }) => {
    console.log("join-room userId:", userId);
    socket.join(room);

    if (!rooms[room]) {
      rooms[room] = {
        players: [],
        questions: [],
        currentIndex: 0,
        buzzer: null,
        timer: null,
        answerTimer: null,
        questionStartTime: null,
      };
    }

    if (rooms[room].players.length >= MAX_PLAYERS) {
      socket.emit("room-full");
      return;
    }

    const isFirstPlayer = rooms[room].players.length === 0;

    rooms[room].players.push({
      id: socket.id,
      pseudo,
      score: 0,
      blocked: false,
      isHost: isFirstPlayer,
      userId: userId || null,
      buzzes: 0,
      correctAnswers: 0,
      wrongAnswers: 0,
      responseTimes: [],
    });

    io.to(room).emit("players-update", rooms[room].players);
    io.to(room).emit("host-update", rooms[room].players.find((p: Player) => p.isHost)?.id || null);
  });

  socket.on("start-game", async (room) => {
    const state = rooms[room];
    if (!state) return;

    if (state.players.length < 2) {
      socket.emit("start-denied", "Il faut au moins 2 joueurs pour lancer la partie");
      return;
    }

    const player = state.players.find((p: Player) => p.id === socket.id);
    if (!player?.isHost) return;

    try {
      const data = await Question.findAll();
      state.questions = shuffleQuestions(data.map((q) => q.toJSON()));
      state.currentIndex = 0;
    } catch (e) {
      console.error("Erreur chargement questions :", e);
      return;
    }

    io.to(room).emit("game-started");
    setTimeout(() => {
      emitScores(room);
      sendCurrentQuestion(room);
    }, 500);
  });

  socket.on("restart-game", async (room) => {
    const state = rooms[room];
    if (!state) return;

    const player = state.players.find((p: Player) => p.id === socket.id);
    if (!player?.isHost) return;

    try {
      const data = await Question.findAll();
      state.questions = shuffleQuestions(data.map((q) => q.toJSON()));
      state.currentIndex = 0;
      state.buzzer = null;
      if (state.timer) clearTimeout(state.timer);
      if (state.answerTimer) clearTimeout(state.answerTimer);
      state.timer = null;
      state.answerTimer = null;
      state.players.forEach((p: Player) => {
        p.score = 0;
        p.blocked = false;
        p.buzzes = 0;
        p.correctAnswers = 0;
        p.wrongAnswers = 0;
        p.responseTimes = [];
      });
    } catch (e) {
      console.error("Erreur rechargement questions :", e);
      return;
    }

    io.to(room).emit("game-started");
    setTimeout(() => {
      emitScores(room);
      sendCurrentQuestion(room);
    }, 500);
  });

  socket.on("buzz", ({ room }) => {
    const state = rooms[room];
    if (!state) return;

    const player = state.players.find((p: Player) => p.id === socket.id);
    if (!player || player.blocked || state.buzzer !== null) {
      socket.emit("buzz-denied");
      return;
    }

    state.buzzer = socket.id;
    player.buzzes += 1;

    if (state.questionStartTime) {
      player.responseTimes.push(Date.now() - state.questionStartTime);
    }

    socket.emit("buzz-granted");
    io.to(room).emit("buzzer-taken", { pseudo: player.pseudo, id: socket.id });

    startAnswerTimer(room);
  });

  socket.on("submit-answer", ({ room, answer }) => {
    const state = rooms[room];
    if (!state) return;

    if (state.buzzer !== socket.id) return;

    const player = state.players.find((p: Player) => p.id === socket.id);
    if (!player) return;

    if (state.answerTimer) clearTimeout(state.answerTimer);

    const currentQuestion = state.questions[state.currentIndex];
    const correctAnswer: string = currentQuestion.reponse;

    if (isCloseEnough(answer, correctAnswer)) {
      player.score += 10;
      player.correctAnswers += 1;
      state.buzzer = null;
      if (state.timer) clearTimeout(state.timer);

      io.to(room).emit("answer-result", {
        correct: true,
        pseudo: player.pseudo,
        answer: correctAnswer,
      });

      emitScores(room);

      if (player.score >= 100) {
        io.to(room).emit("game-over", {
          winner: player.pseudo,
          scores: state.players.map((p: Player) => ({
            pseudo: p.pseudo,
            score: p.score,
          })),
        });
        saveStats(room);
        return;
      }

      state.currentIndex++;
      setTimeout(() => sendCurrentQuestion(room), 2000);
    } else {
      player.blocked = true;
      player.wrongAnswers += 1;

      // Score ne descend pas en dessous de 0
      player.score = Math.max(0, player.score - 5);

      state.buzzer = null;

      io.to(room).emit("answer-result", {
        correct: false,
        pseudo: player.pseudo,
        answer: null,
      });

      emitScores(room);

      if (allBlocked(state)) {
        if (state.timer) clearTimeout(state.timer);
        io.to(room).emit("answer-result-reveal", { answer: correctAnswer });
        state.currentIndex++;
        setTimeout(() => sendCurrentQuestion(room), 3000);
      }
    }
  });

  socket.on("pass-question", ({ room }) => {
    const state = rooms[room];
    if (!state) return;

    const player = state.players.find((p: Player) => p.id === socket.id);
    if (!player || player.blocked) return;

    player.blocked = true;

    if (state.buzzer === socket.id) {
      state.buzzer = null;
      if (state.answerTimer) clearTimeout(state.answerTimer);
      io.to(room).emit("buzzer-released");
    }

    io.to(room).emit("answer-result", {
      correct: false,
      pseudo: player.pseudo,
      answer: "SKIP",
    });

    // On vérifie si tout le monde est bloqué (soit mauvaise réponse, soit skip)
    if (allBlocked(state)) {
      if (state.timer) clearTimeout(state.timer);
      if (state.answerTimer) clearTimeout(state.answerTimer);

      const currentQuestion = state.questions[state.currentIndex];
      io.to(room).emit("answer-result-reveal", { answer: currentQuestion.reponse });

      state.currentIndex++;
      setTimeout(() => sendCurrentQuestion(room), 3000);
    }
  });

  socket.on("disconnect", async () => {
    for (const room in rooms) {
      const state = rooms[room];
      const wasHoldingBuzzer = state.buzzer === socket.id;
      const wasHost = state.players.find((p: Player) => p.id === socket.id)?.isHost || false;

      state.players = state.players.filter((p: Player) => p.id !== socket.id);

      if (wasHoldingBuzzer) {
        state.buzzer = null;
        if (state.answerTimer) clearTimeout(state.answerTimer);
        io.to(room).emit("buzzer-released");
      }

      if (wasHost && state.players.length > 0) {
        state.players[0].isHost = true;
        io.to(state.players[0].id).emit("host-granted");
        io.to(room).emit("host-update", state.players[0].id);
      }

      io.to(room).emit("players-update", state.players);
      emitScores(room);

      if (state.players.length === 0) {
        if (state.timer) clearTimeout(state.timer);
        if (state.answerTimer) clearTimeout(state.answerTimer);
        delete rooms[room];
        await deleteSalonFromDb(room);
      }
    }
  });
});



sequelize
  .authenticate()
  .then(() => {
    console.log("DB OK");
    return sequelize.sync();
  })
  .then(() => {
    console.log("DB sync OK");
    server.listen(port, "0.0.0.0", () => {
      console.log(`Serveur lancé sur http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("DB ERROR:", err);
  });

console.log("Server file loaded");