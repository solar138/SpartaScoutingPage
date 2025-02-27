if (!localStorage) {
  alert("No localStorage available, data may be lost.");
} 

class ScoutingData {
  constructor(roundNumber, teamNumber, scouterName, alliance) {
    this.roundNumber = roundNumber;
    this.teamNumber = teamNumber;
    this.alliance = alliance;
    this.scouterName = scouterName;
  }
}

try {
  data = JSON.parse(localStorage.ScoutingData ?? "[]");
} catch {
  alert("Data error: JSON parsing error.");
  data = [];
  localStorage.Error = localStorage.ScoutingData;
  localStorage.ScoutingData = "[]";
}
let currentData = data[data.length - 1] ?? new ScoutingData(null, null, "", null);

if (data.length == 0) {
  data[0] = currentData;
}

const allianceToggle = document.getElementById("allianceToggle");

teamNumber.value = currentData.teamNumber;
roundNumber.value = currentData.roundNumber;
scouterName.value = currentData.scouterName;

if (currentData.alliance == "blue") {
  allianceToggle.innerText = "Blue";
  allianceToggle.className = "input-inline blue";
} else if (currentData.alliance = "red") {
  allianceToggle.innerText = "Red";
  allianceToggle.className = "input-inline red";
}

document.getElementById("submit").disabled = !validateData();

var bargeStates = ["No Attempt", "Robot Shoot", "Human Throw"];

document.addEventListener("DOMContentLoaded", () => {

  if (localStorage.currentPage) {
    loadPage(localStorage.currentPage);
  }

  bargeToggle.addEventListener("click", e => {
    var bargeIndex = (bargeStates.indexOf(currentData.bargeState ?? bargeStates[0]) + 1) % bargeStates.length;

    bargeToggle.innerHTML = "Barge Net:<br>" + bargeStates[bargeIndex];
    currentData.bargeState = bargeStates[bargeIndex];
    saveData();
  });

  allianceToggle.addEventListener("click", e => {
    if (currentData.alliance == "red") {
      currentData.alliance = "blue";
      allianceToggle.innerText = "Blue";
      allianceToggle.className = "input-inline blue";
    } else {
      currentData.alliance = "red";
      allianceToggle.innerText = "Red";
      allianceToggle.className = "input-inline red";
    }
    saveData();
  });

  startButton.addEventListener("click", e => {
    gameStartTime = Date.now();

    gameFrameUpdate();

    startButton.hidden = true;

    saveData();
  });

  const form = document.getElementById("setupForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {    
    e.preventDefault();
    saveData();

    loadPage(2);
  });
});

function saveData() {
  localStorage.ScoutingData = JSON.stringify(data);

  document.getElementById("submit").disabled = !validateData();
}

function validateData() {
  return currentData.teamNumber && currentData.alliance && currentData.roundNumber && currentData.scouterName;
}

function gameFrameUpdate() {
  if (gameStartTime) {
    var gameTime = Date.now() - gameStartTime;
    const time = Math.floor(gameTime / 60000) + ":" + Math.floor(gameTime % 60000 / 1000).toString().padStart(2, "0") + ":" + Math.floor(gameTime % 1000 / 10).toString().padStart(2, "0");
    timer.textContent = time;
    gameStatus.textContent = gameTime < autoLength * 1000 ? "Auto" : "TeleOp";

    if (gameTime > gameLength * 1000) {
      gameStartTime = null;
      gameStatus.textContent = "Game Over!";
      startButton.hidden = false;
      return;
    }

    requestAnimationFrame(gameFrameUpdate);
  }
}

var gameLength = 2*60 + 30;
var autoLength = 15;
// Shortened times for testing:
// var gameLength = 6;
// var autoLength = 3;
var currentPage = 1;
var gameStartTime = null;

function loadPage(page) {
  document.getElementById("page-" + currentPage).hidden = true;
  document.getElementById("page-" + page).hidden = false;
  currentPage = page;

  localStorage.currentPage = page;
}