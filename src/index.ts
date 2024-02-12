import * as ws from "ws";
import { CONFIG } from "./config/config";
import { Player } from "./player/player";

let interval: any;
const users = new Map<string, ws.WebSocket>();
// CREATE WS
const server = new ws.WebSocketServer({ port: CONFIG.PORT }, () => {
  console.log(`Server started on port ${CONFIG.PORT}`);
  waitingRound();
});
let state = "";
let currentMultiplier = 1;
server.on("connection", function (userSocket, _incomingMessage) {
  // SETTING BALANCE FOR THE PLAYER

  const userId = String(Math.random()); // 3.
  users.set(userId, userSocket); // 4.
  Player.setBalance(1000, userId);
  var data = { balance: 1000 };
  userSocket.send(JSON.stringify(data));

  // SENDING STATE JUST TO BE ABLE TO RESTORE THE GAME ON THE CURRENT STATE
  let sendstate = {};
  sendstate = { state: state };
  userSocket.send(JSON.stringify(sendstate));

  userSocket.on("message", function (rawMessage) {
    const message = rawMessage.toString();
    if (message === "BET") {
      //MANAGE BET ACTION
      Player.updateBalance(50, userId, "bet");
      data = { balance: Player.getBalance(userId).balance };
      console.log(data.balance);
      userSocket.send(JSON.stringify(data));
    }
    if (message === "TAKE") {
      // MANAGE TAKE ACTION
      Player.updateBalance(50 * currentMultiplier, userId, "add");
      Player.getBalance(userId);
      data = { balance: Player.getBalance(userId).balance };
      console.log(data);
      userSocket.send(JSON.stringify(data));
    }
  });
// IF USER DISCONNECT DELETE IT FROM THE USER LIST
  userSocket.on("close", function (code, _reason) {
    users.delete(userId);
  });
});
// START NEW ROUND
function startRound() {
  state = "running";
  users.forEach((user) => {
    var data = { round: "START" };
    user.send(JSON.stringify(data));
  });
  getRandom;
  clearInterval(interval);
  multiplier();
}
// SEND MESSAGE TO THE PLAYER ON MULT UPDATE
async function multiplier() {
  for (let index = 0; index <= getRandom(); index++) {
    currentMultiplier = index;
    users.forEach((user) => {
      var data = { multiplier: index };
      user.send(JSON.stringify(data));
    });
    await sleep(100);
  }
  endRound();
}
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
// SEND END ROUND MESSAGE
function endRound() {
  state = "end";
  users.forEach((user) => {
    var data = { round: "END" };
    user.send(JSON.stringify(data));
  });
  interval = setInterval(waitingRound, 10000);
}
// RNG :)
function getRandom() {
  return Math.floor(Math.random() * 100) + 1;
}
// SEND WAITING STATE TO THE PLAYERS
function waitingRound() {
  clearInterval(interval);
  state = "waiting";
  users.forEach((user) => {
    var data = { round: "WAITING" };
    user.send(JSON.stringify(data));
  });
  interval = setInterval(startRound, CONFIG.DELAY_ROUND_START);
}
