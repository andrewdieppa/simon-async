"use strict";

import snd_wrong from "url:./sounds/wrong.wav";
import snd_green from "url:./sounds/beep1.wav";
import snd_red from "url:./sounds/beep2.wav";
import snd_yellow from "url:./sounds/beep3.wav";
import snd_blue from "url:./sounds/beep4.wav";

const sndWrong = new Audio(snd_wrong);
sndWrong.volume = 0.5;

const sndGreen = {
  channels: [],
  currChan: 0,
};
const sndRed = {
  channels: [],
  currChan: 0,
};
const sndYellow = {
  channels: [],
  currChan: 0,
};
const sndBlue = {
  channels: [],
  currChan: 0,
};

for (let i = 0; i < 4; i++) {
  // Fill channels (used for overlapping sounds)
  sndGreen.channels.push(new Audio(snd_green));
  sndRed.channels.push(new Audio(snd_red));
  sndYellow.channels.push(new Audio(snd_yellow));
  sndBlue.channels.push(new Audio(snd_blue));

  // Adjust volume of each audio object as it is added
  sndGreen.channels[i].volume = 0.7;
  sndRed.channels[i].volume = 0.5;
  sndYellow.channels[i].volume = 0.7;
  sndBlue.channels[i].volume = 0.3;
}

const simon = document.querySelector(".simon");
const btnStart = document.querySelector(".btn-start");
const btns = document.querySelectorAll(".btn");
const speedBtnContainer = document.querySelector(".speed-btn-container");
const speedBtns = document.querySelectorAll(".btn-speed");
const infoText = document.querySelector(".info-text");
const scoreText = document.querySelector(".score");

const btn = {
  green: {
    memID: "green",
    color: "rgb(0, 128, 0)",
    lightColor: "rgb(0, 244, 0)",
    element: document.querySelector(".btn-green"),
    sound: sndGreen,
  },
  red: {
    memID: "red",
    color: "rgb(128, 0, 0)",
    lightColor: "rgb(255, 0, 0)",
    element: document.querySelector(".btn-red"),
    sound: sndRed,
  },
  yellow: {
    memID: "yellow",
    color: "rgb(128, 128, 0)",
    lightColor: "rgb(255, 255, 0)",
    element: document.querySelector(".btn-yellow"),
    sound: sndYellow,
  },
  blue: {
    memID: "blue",
    color: "rgb(0, 0, 128)",
    lightColor: "rgb(0, 0, 255)",
    element: document.querySelector(".btn-blue"),
    sound: sndBlue,
  },
};

const colorMap = new Map();
colorMap.set(1, "green").set(2, "red").set(3, "yellow").set(4, "blue");

// speed in ms (less is faster)
const turnSpeed = 1000;
let gameSpeed = 500;
const textSpeed = 300;

const normalSpeed = 500;
const fastSpeed = 250;
const insaneSpeed = 100;

let gameMemory;
let gameCount;
let playerPicks;
let playerPickCount;
let score;

btns.forEach(btn => (btn.disabled = true));

const animateTimer = ms => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

const playSound = snd => {
  snd.channels[snd.currChan].play();
  snd.currChan === snd.channels.length - 1
    ? (snd.currChan = 0)
    : snd.currChan++;
};

const animatePick = async btn => {
  playSound(btn.sound);
  btn.element.style.borderRadius = "30px";
  btn.element.style.transform = "scale(0.95)";
  btn.element.style.backgroundColor = btn.lightColor;
  await animateTimer(gameSpeed);
  btn.element.style.transform = "scale(1)";
  btn.element.style.borderRadius = "25px";
  btn.element.style.backgroundColor = btn.color;
  await animateTimer(gameSpeed);
};

const animateInfoText = async text => {
  infoText.style.letterSpacing = "-1rem";
  infoText.style.color = "#fff";
  await animateTimer(textSpeed);
  infoText.textContent = text;
  infoText.style.letterSpacing = "0.1rem";
  infoText.style.color = "#333";
};

const animateScore = async () => {
  scoreText.style.transform = "translate(-50%, -50%) scale(1, 0)";
  await animateTimer(textSpeed);
  scoreText.textContent = score;
  scoreText.style.transform = "translate(-50%, -50%) scale(1)";
};

const cpuPick = async () => {
  animateInfoText("CPU thinking");

  if (gameMemory.length !== 0) {
    for (const pick of gameMemory) {
      await animateTimer(gameSpeed);
      animatePick(btn[pick]);
      await animateTimer(gameSpeed);
    }
  }

  const pick = Math.floor(Math.random() * 4 + 1);
  gameMemory.push(colorMap.get(pick));
  gameCount++;

  await animateTimer(gameSpeed);
  animatePick(btn[colorMap.get(pick)]);
  await animateTimer(turnSpeed);

  btns.forEach(btn => (btn.disabled = false));
  animateInfoText("Your turn");
};

const initGame = async () => {
  speedBtns.forEach(btn => (btn.disabled = true));
  speedBtnContainer.style.transform = "scale(1, 0)";

  gameMemory = [];
  gameCount = 0;
  playerPicks = [];
  playerPickCount = 0;
  score = 0;
  animateScore();

  await animateTimer(gameSpeed);
  cpuPick();
};

const playerPick = btn => {
  btns.forEach(btn => (btn.disabled = true));
  playerPicks.push(btn.memID);
  playerPickCount++;

  animatePick(btn);

  checkPicks();
};

const checkPicks = async () => {
  const isWrong = !playerPicks.every((pick, i) => {
    return pick === gameMemory[i];
  });

  if (isWrong) {
    gameOver();
  } else if (playerPickCount === gameCount) {
    playerPicks = [];
    playerPickCount = 0;

    score++;
    animateScore();

    await animateTimer(turnSpeed);
    cpuPick();
  } else {
    btns.forEach(btn => (btn.disabled = false));
  }
};

const gameOver = () => {
  sndWrong.play();
  speedBtns.forEach(btn => (btn.disabled = false));
  speedBtnContainer.style.transform = "scale(1)";
  btnStart.disabled = false;
  btnStart.style.backgroundColor = "#fff";
  animateInfoText("GAME OVER");
};

simon.addEventListener("click", function (e) {
  if (
    !e.target.classList.contains("btn") &&
    !e.target.classList.contains("btn-start")
  )
    return;

  if (e.target.classList.contains("btn-start")) {
    btnStart.disabled = true;
    btnStart.style.backgroundColor = "#444";
    initGame();
  } else {
    playerPick(btn[e.target.dataset.color]);
  }
});

speedBtnContainer.addEventListener("click", function (e) {
  if (!e.target.classList.contains("btn-speed")) return;

  const buttons = [...this.children];

  buttons.forEach(button => button.classList.remove("btn-speed--selected"));
  e.target.classList.add("btn-speed--selected");

  switch (e.target.textContent) {
    case "NORMAL":
      gameSpeed = normalSpeed;
      break;

    case "FAST":
      gameSpeed = fastSpeed;
      break;

    case "INSANE":
      gameSpeed = insaneSpeed;
      break;

    default:
      break;
  }
});
