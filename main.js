if (!localStorage) {
  alert("No localStorage available, data may be lost.");
} 

const cageStates = ["No Attempt", "Shallow Climb", "Deep Climb"];

class ScoutingData {
  constructor(roundNumber, teamNumber, scouterName, alliance) {
    this.roundNumber = roundNumber;
    this.teamNumber = teamNumber;
    this.alliance = alliance;
    this.scouterName = scouterName;
    this.cage = cageStates[0];
    this.events = [];
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

function stateButton(states, button, key, prefix) {

  button.addEventListener("click", e => {
    var index = (states.indexOf(currentData[key] ?? states[0]) + 1) % states.length;

    button.innerHTML = prefix + ":<br>" + states[index];
    currentData[key] = states[index];
    saveData();
  });
  
  button.innerHTML = prefix + ":<br>" + currentData[key] ?? states[0];
}

function eventButton(button, name) {

  button.addEventListener("click", e => {
    var event = {
      name: name,
      time: Date.now() - gameStartTime,
    };

    if (!currentData.events) {
      currentData.events = [];
    }
    currentData.events.push(event);
    createLogEntry(event.time, name, () => {
      currentData.events.splice(currentData.events.indexOf(event), 1);
    });
    saveData();
  });
}

var index = 0;

function createLogEntry(time, name, undo) {
  var li = document.createElement("li");
  li.id = `logEntry${index}`;
  var button = document.createElement("button");
  button.id = `logEntry${index++}Undo`;
  button.innerText = "UNDO";
  button.addEventListener("click", e => {
    log.removeChild(li);
    undo();
    saveData();
  })
  li.appendChild(button);
  var span = document.createElement("span");
  span.innerText = ` ${name} @ ${parseTime(time)}`;
  li.appendChild(span);
  log.insertBefore(li, log.firstChild);
}

document.addEventListener("DOMContentLoaded", () => {

  if (localStorage.currentPage) {
    loadPage(localStorage.currentPage);
  }

  for (var event of currentData.events) {
    const e = event;
    createLogEntry(e.time, e.name, () => {
      currentData.events.splice(currentData.events.indexOf(e), 1);
      saveData();
    });
  }

  eventButton(coralIntakeButton, "Coral Intaken");
  eventButton(processorScoreButton, "Processor Scored");
  eventButton(bargeHumanButton, "Barge by Human");
  eventButton(bargeRobotButton, "Barge by Robot");
  eventButton(L1ScoreButton, "L1 Coral Scored");
  eventButton(L2ScoreButton, "L2 Coral Scored");
  eventButton(L3ScoreButton, "L3 Coral Scored");
  eventButton(L4ScoreButton, "L4 Coral Scored");
  eventButton(AlgaeRemovedButton, "Algae Removed");

  endEarlyButton.addEventListener("click", e => {
    gameStartTime = Date.now() - gameLength * 1000;
  });

  stateButton(cageStates, cageToggle, "cage", "Cage Climb");

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

    if (confirmRestart) {
      if (!confirm("Are you sure you want to restart the game?")) {
        return;
      }
    }
    gameStartTime = Date.now();

    gameFrameUpdate();

    startButton.hidden = true;
    nextButton.hidden = true;

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

function parseTime(gameTime) {
  return Math.floor(gameTime / 60000) + ":" + Math.floor(gameTime % 60000 / 1000).toString().padStart(2, "0") + "." + Math.floor(gameTime % 1000 / 10).toString().padStart(2, "0");
}

var confirmRestart = false;

function gameFrameUpdate() {
  if (gameStartTime) {
    var gameTime = Date.now() - gameStartTime;
    const time = parseTime(gameTime);
    timer.textContent = time;
    gameStatus.textContent = gameTime < autoLength * 1000 ? "Auto" : "TeleOp";

    if (gameTime > gameLength * 1000) {
      gameStartTime = null;
      gameStatus.textContent = "Game Over!";
      startButton.hidden = false;
      startButton.innerText = "Restart";
      confirmRestart = true;
      nextButton.hidden = false;
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