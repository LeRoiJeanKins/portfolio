
export type Player = {
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

export type RoomState = {
  players: Player[];
  questions: any[];
  currentIndex: number;
  buzzer: string | null;
  timer: ReturnType<typeof setTimeout> | null;
  answerTimer: ReturnType<typeof setTimeout> | null;
  questionStartTime: number | null;
};

export function levenshtein(a: string, b: string): number {
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

export function isCloseEnough(guess: string, answer: string): boolean {
  const g = guess.trim().toLowerCase();
  const a = answer.trim().toLowerCase();
  const dist = levenshtein(g, a);
  if (a.length <= 4) return dist === 0;
  if (a.length <= 7) return dist <= 1;
  return dist <= 2;
}



export function allBlocked(state: RoomState): boolean {
  return state.players.every((p) => p.blocked);
}

export function shuffleQuestions(questions: any[]): any[] {
  const q = [...questions];
  for (let i = q.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [q[i], q[j]] = [q[j], q[i]];
  }
  return q;
}

