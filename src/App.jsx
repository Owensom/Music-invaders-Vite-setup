import React, { useState } from "react";

export default function App() {
  const [started, setStarted] = useState(false);

  if (!started) {
    return (
      <div style={{
        color: "white",
        background: "#020617",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column"
      }}>
        <h1>Music Invaders 🚀</h1>
        <p>Press start to play</p>
        <button onClick={() => setStarted(true)} style={{padding: "10px 20px"}}>
          Start Game
        </button>
      </div>
    );
  }

  return (
    <div style={{ color: "white", padding: 20 }}>
      <h2>Game Running 🎮</h2>
      <p>Your full game will go here</p>
    </div>
  );
}
