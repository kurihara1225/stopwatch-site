const mainTime = document.querySelector("#time-main");
const fractionTime = document.querySelector("#time-fraction");
const status = document.querySelector("#status");
const toggleButton = document.querySelector("#toggle");
const resetButton = document.querySelector("#reset");
const lapButton = document.querySelector("#lap");
const lapCount = document.querySelector("#lap-count");
const lapList = document.querySelector("#lap-list");
const empty = document.querySelector("#empty");

let elapsed = 0;
let accumulated = 0;
let startedAt = 0;
let running = false;
let timer;
let laps = [];

function formatTime(milliseconds) {
  const total = Math.floor(milliseconds / 10);
  const minutes = Math.floor(total / 6000);
  const seconds = Math.floor((total % 6000) / 100);
  const centiseconds = total % 100;
  return {
    main: `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`,
    fraction: String(centiseconds).padStart(2, "0"),
  };
}

function renderTime() {
  const formatted = formatTime(elapsed);
  mainTime.textContent = formatted.main;
  fractionTime.textContent = `.${formatted.fraction}`;
}

function tick() {
  elapsed = accumulated + performance.now() - startedAt;
  renderTime();
}

function renderControls() {
  status.textContent = running ? "計測中" : "待機中";
  status.classList.toggle("is-running", running);
  toggleButton.classList.toggle("stop", running);
  toggleButton.innerHTML = `<span aria-hidden="true">${running ? "■" : "▶"}</span>${running ? "ストップ" : "スタート"}`;
  resetButton.disabled = elapsed === 0 && laps.length === 0;
  lapButton.disabled = !running;
}

function renderLaps() {
  lapCount.textContent = String(laps.length).padStart(2, "0");
  empty.hidden = laps.length > 0;
  lapList.replaceChildren(...laps.map((lap, index) => {
    const item = document.createElement("li");
    const label = document.createElement("span");
    const value = document.createElement("strong");
    const formatted = formatTime(lap);
    label.textContent = `LAP ${String(laps.length - index).padStart(2, "0")}`;
    value.textContent = `${formatted.main}.${formatted.fraction}`;
    item.append(label, value);
    return item;
  }));
}

toggleButton.addEventListener("click", () => {
  if (running) {
    accumulated = elapsed;
    clearInterval(timer);
  } else {
    startedAt = performance.now();
    timer = setInterval(tick, 10);
  }
  running = !running;
  renderControls();
});

resetButton.addEventListener("click", () => {
  clearInterval(timer);
  elapsed = 0;
  accumulated = 0;
  running = false;
  laps = [];
  renderTime();
  renderLaps();
  renderControls();
});

lapButton.addEventListener("click", () => {
  if (!running) return;
  laps.unshift(elapsed);
  renderLaps();
  renderControls();
});

renderTime();
renderLaps();
renderControls();
