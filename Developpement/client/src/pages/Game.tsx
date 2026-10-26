import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { io, Socket } from "socket.io-client";

import QuestionCard from "../composants/question";
import Buzzer from "../composants/buzzer";

import "./css/game.css";

type Question = {
  id: number;
  question: string;
  imageUrl: string | null;
  index: number;
  total: number;
};

type Player = {
  id: string;
  pseudo: string;
};

type Score = {
  id: string;
  pseudo: string;
  score: number;
};

type AnswerResult = {
  correct: boolean;
  pseudo: string;
  answer: string | null;
};

type GameOverData = {
  winner: string;
  scores: { pseudo: string; score: number }[];
};

export default function Game() {
  const [question, setQuestion] = useState<Question | null>(null);
  const [answer, setAnswer] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [scores, setScores] = useState<Score[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState<GameOverData | null>(null);
  const [buzzerState, setBuzzerState] = useState<"free" | "mine" | "taken" | "blocked">("free");
  const [buzzerOwner, setBuzzerOwner] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    type: "correct" | "wrong" | "reveal";
    message: string;
  } | null>(null);

  // États pour les chronomètres (Principal et Réponse Buzzer)
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [answerTimeLeft, setAnswerTimeLeft] = useState<number | null>(null);

  const [isHost, setIsHost] = useState(false);
  const [userId, setUserId] = useState<number | null | undefined>(undefined);

  const [socket, setSocket] = useState<Socket | null>(null);

  // Références pour les intervalles des chronomètres
  const socketRef = useRef<Socket | null>(null);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const answerTimerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [searchParams] = useSearchParams();
  const room = searchParams.get("room") || "";
  const pseudo = searchParams.get("pseudo") || "";
  const hostParam = searchParams.get("host");

  function clearTimerInterval() {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }

  function clearAnswerTimerInterval() {
    if (answerTimerIntervalRef.current) {
      clearInterval(answerTimerIntervalRef.current);
      answerTimerIntervalRef.current = null;
    }
  }

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/auth/me`, { credentials: "include" })
        .then(res => res.json())
        .then(data => setUserId(data.id_user ?? null))
        .catch(() => setUserId(null));
  }, []);

  useEffect(() => {
    if (!room || !pseudo || userId === undefined) return;

    const newSocket = io("http://91.134.138.136:3000", {
      withCredentials: true,
    });

    setSocket(newSocket);
    socketRef.current = newSocket;

    newSocket.emit("join-room", { room, pseudo, userId });

    if (hostParam === "true") setIsHost(true);

    newSocket.on("connect", () => {
      console.log("connecté :", newSocket.id);
    });

    newSocket.on("host-granted", () => {
      setIsHost(true);
    });

    newSocket.on("host-update", (hostSocketId: string) => {
      if (newSocket.id === hostSocketId) {
        setIsHost(true);
      }
    });

    newSocket.on("players-update", (data: Player[]) => {
      setPlayers(data);
    });

    newSocket.on("scores-update", (data: Score[]) => {
      setScores(data.map(s => ({ ...s })));
    });

    newSocket.on("game-started", () => {
      setGameStarted(true);
      setGameOver(null);
      setQuestion(null);
      setFeedback(null);
      setBuzzerState("free");
      setBuzzerOwner(null);
      clearTimerInterval();
      setTimeLeft(null);
      clearAnswerTimerInterval();
      setAnswerTimeLeft(null);
    });

    newSocket.on("timer-start", ({ duration }: { duration: number }) => {
      clearTimerInterval();
      setTimeLeft(duration);
      timerIntervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev === null || prev <= 1) {
            clearTimerInterval();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    });

    newSocket.on("answer-timer-start", ({ duration }: { duration: number }) => {
      clearAnswerTimerInterval();
      setAnswerTimeLeft(duration);
      answerTimerIntervalRef.current = setInterval(() => {
        setAnswerTimeLeft((prev) => {
          if (prev === null || prev <= 1) {
            clearAnswerTimerInterval();
            return null; // Remet à null à la fin pour réafficher le timer principal
          }
          return prev - 1;
        });
      }, 1000);
    });

    newSocket.on("room-full", () => {
      alert("Ce salon est complet (12 joueurs maximum)");
      window.location.href = "/home";
    });

    newSocket.on("new-question", (data: Question) => {
      setQuestion(data);
      setAnswer("");
      setFeedback(null);
      setBuzzerState("free");
      setBuzzerOwner(null);
      clearAnswerTimerInterval();
      setAnswerTimeLeft(null);
    });

    newSocket.on("buzz-granted", () => {
      setBuzzerState("mine");
    });

    newSocket.on("buzz-denied", () => {});

    newSocket.on("buzzer-taken", ({ pseudo: owner, id }: { pseudo: string; id: string }) => {
      setBuzzerOwner(owner);
      if (newSocket.id !== id) {
        setBuzzerState((prev) => (prev === "blocked" ? "blocked" : "taken"));
      }
    });

    newSocket.on("buzzer-released", () => {
      clearAnswerTimerInterval();
      setAnswerTimeLeft(null);
      setBuzzerOwner(null);
      setBuzzerState((prev) => (prev === "blocked" ? "blocked" : "free"));
    });

    newSocket.on("answer-result", (data: AnswerResult) => {
      clearAnswerTimerInterval();
      setAnswerTimeLeft(null);

      if (data.correct) {
        clearTimerInterval();
        setTimeLeft(null);
        setFeedback({
          type: "correct",
          message: `${data.pseudo} a trouvé ! La réponse était : ${data.answer} +10 points`,
        });
        setBuzzerState("free");
        setBuzzerOwner(null);
      } else {
        setFeedback({
          type: "wrong",
          message: `${data.pseudo} s'est trompé ! (-5 points)`, // Mise à jour du texte pour les -5 points
        });
        setBuzzerOwner(null);
        setBuzzerState((prev) => {
          if (prev === "mine") return "blocked";
          if (prev === "taken") return "free";
          return prev;
        });
      }
    });

    newSocket.on("answer-result-reveal", ({ answer: correctAnswer }: { answer: string }) => {
      clearTimerInterval();
      setTimeLeft(null);
      clearAnswerTimerInterval();
      setAnswerTimeLeft(null);
      setFeedback({
        type: "reveal",
        message: `La réponse était : ${correctAnswer}`,
      });
    });

    newSocket.on("game-over", (data: GameOverData) => {
      clearTimerInterval();
      setTimeLeft(null);
      clearAnswerTimerInterval();
      setAnswerTimeLeft(null);
      setGameOver(data);
    });

    newSocket.on("start-denied", (message: string) => {
      alert(message);
    });

    return () => {
      clearTimerInterval();
      clearAnswerTimerInterval();
      newSocket.disconnect();
    };
  }, [room, pseudo, userId]);

  function startGame() {
    if (!socket) return;
    socket.emit("start-game", room);
  }

  function handleBuzz() {
    if (!socket || buzzerState !== "free") return;
    socket.emit("buzz", { room });
  }

  function handleSubmit() {
    if (!socket || !answer.trim() || buzzerState !== "mine") return;
    socket.emit("submit-answer", { room, answer });
    setAnswer("");
  }

  function handleRestart() {
    socket?.emit("restart-game", room);
  }

  // NOUVELLE FONCTION POUR LE BOUTON SKIP
  function handleSkip() {
    if (!socket || buzzerState === "blocked") return;

    socket.emit("pass-question", { room });

    setBuzzerState("blocked");
  }

  if (gameOver) {
    return (
        <div className="game-over">
          <h1>Partie terminée !</h1>
          <h2>Vainqueur : {gameOver.winner}</h2>
          <ul>
            {gameOver.scores
                .sort((a, b) => b.score - a.score)
                .map((s) => (
                    <li key={s.pseudo}>
                      {s.pseudo} — {s.score} pts
                    </li>
                ))}
          </ul>
          {isHost && (
              <button onClick={handleRestart}>Rejouer</button>
          )}
        </div>
    );
  }

  if (!gameStarted) {
    return (
        <div className="lobby">
          <h1>Salon : {room}</h1>
          <h2>Joueurs :</h2>
          {players.map((p) => (
              <p key={p.id}>{p.pseudo}</p>
          ))}
          {isHost && (
              <button onClick={startGame}>Lancer la partie</button>
          )}
        </div>
    );
  }

  if (!question) return <p>Chargement...</p>;

  return (
      <div className="game-container">
        <div className="scoreboard">
          {scores
              .sort((a, b) => b.score - a.score)
              .map((s) => (
                  <div key={s.pseudo} className="score-row">
                    <span className="score-pseudo">{s.pseudo}</span>
                    <span className="score-value">{s.score} pts</span>
                  </div>
              ))}
        </div>

        <div className="question-area">
          {answerTimeLeft !== null ? (
              <div className="timer timer--urgent">
                ⏱ {answerTimeLeft}s pour répondre
              </div>
          ) : timeLeft !== null ? (
              <div className={`timer ${timeLeft <= 10 ? "timer--urgent" : ""}`}>
                ⏱ {timeLeft}s
              </div>
          ) : null}

          <QuestionCard
              question={{
                ...question,
                imageUrl: (question.imageUrl ?? "").replace("3000uploads", "3000/uploads"),
              }}
          />

          {buzzerState !== "blocked" && feedback?.type !== "reveal" && (
              <button
                  onClick={handleSkip}
                  style={{
                    marginTop: "15px",
                    backgroundColor: "#757575",
                    color: "white",
                    padding: "10px",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontWeight: "bold"
                  }}
              >
                Skip
              </button>
          )}
        </div>

        {feedback && (
            <div className={`feedback feedback--${feedback.type}`}>
              {feedback.message}
            </div>
        )}

        {feedback?.type !== "reveal" && (
            <div className="buzzer-area">
              {buzzerOwner && buzzerState !== "mine" && (
                  <p className="buzzer-owner-info">{buzzerOwner} répond…</p>
              )}
              {buzzerState === "free" && <Buzzer onBuzz={handleBuzz} />}
              {buzzerState === "blocked" && (
                  <p className="blocked-info">Tu es bloqué sur cette question</p>
              )}
            </div>
        )}

        {buzzerState === "mine" && (
            <div className="answer-area">
              <input
                  autoFocus
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  placeholder="Ta réponse…"
              />
              <button onClick={handleSubmit}>Envoyer</button>
            </div>
        )}
      </div>
  );
}