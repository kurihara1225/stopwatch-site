"use client";

import { useEffect, useRef, useState } from "react";

function formatTime(milliseconds: number) {
  const totalCentiseconds = Math.floor(milliseconds / 10);
  const minutes = Math.floor(totalCentiseconds / 6000);
  const seconds = Math.floor((totalCentiseconds % 6000) / 100);
  const centiseconds = totalCentiseconds % 100;

  return {
    main: `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`,
    fraction: String(centiseconds).padStart(2, "0"),
  };
}

export default function Home() {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const startedAt = useRef(0);
  const accumulated = useRef(0);

  useEffect(() => {
    if (!running) return;

    const tick = () => setElapsed(accumulated.current + performance.now() - startedAt.current);
    const timer = window.setInterval(tick, 10);
    return () => window.clearInterval(timer);
  }, [running]);

  const toggle = () => {
    if (running) {
      accumulated.current = elapsed;
      setRunning(false);
    } else {
      startedAt.current = performance.now();
      setRunning(true);
    }
  };

  const reset = () => {
    setRunning(false);
    setElapsed(0);
    setLaps([]);
    accumulated.current = 0;
  };

  const recordLap = () => {
    if (running) setLaps((current) => [elapsed, ...current]);
  };

  const time = formatTime(elapsed);

  return (
    <main className="page-shell">
      <section className="stopwatch" aria-label="ストップウォッチ">
        <header className="brand-row">
          <span className="brand-mark" aria-hidden="true" />
          <p>MINUTE / MOMENT</p>
          <span className={`status ${running ? "is-running" : ""}`}>
            {running ? "計測中" : "待機中"}
          </span>
        </header>

        <div className="dial" aria-live="polite" aria-atomic="true">
          <p className="eyebrow">STOPWATCH</p>
          <div className="time">
            <span>{time.main}</span>
            <small>.{time.fraction}</small>
          </div>
          <p className="unit">MIN&nbsp;&nbsp;&nbsp;&nbsp;SEC</p>
        </div>

        <div className="controls">
          <button className="secondary" onClick={reset} disabled={elapsed === 0 && laps.length === 0}>
            リセット
          </button>
          <button className={`primary ${running ? "stop" : ""}`} onClick={toggle}>
            <span aria-hidden="true">{running ? "■" : "▶"}</span>
            {running ? "ストップ" : "スタート"}
          </button>
          <button className="secondary" onClick={recordLap} disabled={!running}>
            ラップ
          </button>
        </div>

        <section className="laps" aria-label="ラップタイム">
          <div className="laps-heading">
            <h2>ラップタイム</h2>
            <span>{String(laps.length).padStart(2, "0")}</span>
          </div>
          {laps.length === 0 ? (
            <p className="empty">計測中に「ラップ」を押すと記録されます。</p>
          ) : (
            <ol>
              {laps.map((lap, index) => {
                const formatted = formatTime(lap);
                return (
                  <li key={`${lap}-${laps.length - index}`}>
                    <span>LAP {String(laps.length - index).padStart(2, "0")}</span>
                    <strong>{formatted.main}.{formatted.fraction}</strong>
                  </li>
                );
              })}
            </ol>
          )}
        </section>
      </section>
      <p className="footer-note">FOCUS ON THIS MOMENT.</p>
    </main>
  );
}
