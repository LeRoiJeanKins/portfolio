const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// 📦 DB
const db = new sqlite3.Database("scores.db");

// 🧱 table
db.run(`
CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    score INTEGER NOT NULL
)
`);

// ➕ save score
app.post("/score", function (req, res) {
    const { name, score } = req.body;

    db.run(
        "INSERT INTO scores (name, score) VALUES (?, ?)",
        [name, score],
        function (err) {
            if (err) return res.status(500).send(err);
            res.send("ok");
        }
    );
});

// 🏆 top 10
app.get("/scores", function (req, res) {
    db.all(
        "SELECT name, score FROM scores ORDER BY score DESC LIMIT 10",
        [],
        function (err, rows) {
            if (err) return res.status(500).send(err);
            res.json(rows);
        }
    );
});

app.listen(3000, function () {
    console.log("🚀 Server running on http://localhost:3000");
});