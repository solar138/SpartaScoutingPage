const apikey = "tYekUbMgHsDcEblf230XxA7WmLMbxFxqALAleZIGZatgAeKCKh7RuaJ1EKGsURCf";
const summaryKeys = {"Auto Disabled": "da", "Robot Disabled": "dr"};
const stateButtons = [];
const eventButtons = [];
const statesUSA = {
  "Alabama": "AL",
  "Alaska": "AK",
  "Arizona": "AZ",
  "Arkansas": "AR",
  "California": "CA",
  "Colorado": "CO",
  "Connecticut": "CT",
  "Delaware": "DE",
  "Florida": "FL",
  "Georgia": "GA",
  "Hawaii": "HI",
  "Idaho": "ID",
  "Illinois": "IL",
  "Indiana": "IN",
  "Iowa": "IA",
  "Kansas": "KS",
  "Kentucky": "KY",
  "Louisiana": "LA",
  "Maine": "ME",
  "Maryland": "MD",
  "Massachusetts": "MA",
  "Michigan": "MI",
  "Minnesota": "MN",
  "Mississippi": "MS",
  "Missouri": "MO",
  "Montana": "MT",
  "Nebraska": "NE",
  "Nevada": "NV",
  "New Hampshire": "NH",
  "New Jersey": "NJ",
  "New Mexico": "NM",
  "New York": "NY",
  "North Carolina": "NC",
  "North Dakota": "ND",
  "Ohio": "OH",
  "Oklahoma": "OK",
  "Oregon": "OR",
  "Pennsylvania": "PA",
  "Rhode Island": "RI",
  "South Carolina": "SC",
  "South Dakota": "SD",
  "Tennessee": "TN",
  "Texas": "TX",
  "Utah": "UT",
  "Vermont": "VT",
  "Virginia": "VA",
  "Washington": "WA",
  "West Virginia": "WV",
  "Wisconsin": "WI",
  "Wyoming": "WY"
};


var year = 2025;
var eventKey = "2024wasam";


if (!localStorage) {
  alert("No localStorage available, data may be lost.");
}

class ScoutingData {
  constructor(roundNumber, teamNumber, scouterName, alliance) {
    this.roundNumber = roundNumber;
    this.teamNumber = teamNumber;
    this.alliance = alliance;
    this.scouterName = scouterName;
    this.events = [];
  }
}

try {
  data = JSONparse(localStorage.ScoutingData ?? "[]");
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
scouterName.value = currentData.scouterName || localStorage.scouterName || "";
eventKeyInput.value = localStorage.eventKey || "2025wasam";
notes.textContent = currentData.notes;

if (currentData.alliance == "blue") {
  allianceToggle.innerText = "Blue";
  allianceToggle.className = "input-inline blue";
} else if (currentData.alliance = "red") {
  allianceToggle.innerText = "Red";
  allianceToggle.className = "input-inline red";
}

document.getElementById("submit").disabled = !validateData();

function textField(input, name, key, onchange) {
  input.addEventListener("onChange", e => {
    currentData[name] = input.value || input.innerHTML;
    if (onchange) onchange();

    saveData();
  });
  if (input.tagName == "TEXTAREA") {
    input.textContent = currentData[name];
  } else {
    input.value = currentData[name];
  }
  summaryKeys[name] = key;

  stateButtons.push({ input, name });
}

function stateButton(states, button, name, key, onclick) {

  button.addEventListener("click", e => {
    var index = (Number.isInteger(currentData[name]) ? currentData[name] + 1 : 0) % states.length;

    button.innerHTML = name + ":<br>" + states[index];
    currentData[name] = index;

    if (onclick) onclick();
    saveData();
  });

  summaryKeys[name] = key;

  if (!currentData[name]) {
    currentData[name] = 0;
    saveData();
  }
  
  button.innerHTML = name + ":<br>" + states[currentData[name]] ?? states[0];
  if (onclick) onclick();

  stateButtons.push({states, name, button});
}

function eventButton(button, name, key) {

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

  eventButtons.push({key, name, button});
  summaryKeys[name] = key;
}

var index = 0;

function createLogEntry(time, name, undo) {
  try {
    name = name();
  } catch {}
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

  if (!Array.isArray(currentData.events)){ 
    currentData.events = [];
  }

  for (var event of currentData.events) {
    const e = event;
    createLogEntry(e.time, e.name, () => {
      currentData.events.splice(currentData.events.indexOf(e), 1);
      saveData();
    });
  }

  eventButton(coralIntakeButton, "Coral Intaken", "c");
  eventButton(processorScoreButton, "Processor Scored", "p");
  eventButton(bargeHumanButton, "Barge by Human", "h");
  eventButton(bargeRobotButton, "Barge by Robot", "r");
  eventButton(L1ScoreButton, "L1 Coral Scored", "1");
  eventButton(L2ScoreButton, "L2 Coral Scored", "2");
  eventButton(L3ScoreButton, "L3 Coral Scored", "3");
  eventButton(L4ScoreButton, "L4 Coral Scored", "4");
  eventButton(AlgaeRemovedButton, "Algae Removed", "g");

  endEarlyButton.addEventListener("click", e => {
    const oldStartTime = gameStartTime;
    const time = Date.now();
    createLogEntry(Date.now() - gameStartTime, () => (time - gameStartTime) < autoLength * 1e3 ? "Auto Disabled" : "Robot Disabled", () => {

      if (time - gameStartTime < autoLength * 1e3) {
        for (var button of eventButtons.concat(stateButtons)) {
          button.button.hidden = false;
        }
        endEarlyButton.hidden = false;
      } else {
        gameStartTime = oldStartTime;
        startButton.innerText = "Start";
        confirmRestart = false;

        gameFrameUpdate();

        startButton.hidden = true;
        nextButton.hidden = true;
      }
    });
    for (var button of eventButtons.concat(stateButtons)) {
      button.button.hidden = true;
    }
    endEarlyButton.hidden = true;
    var event = {
      name: (Date.now() - gameStartTime) < autoLength * 1e3 ? "Auto Disabled" : "Robot Disabled",
      time: Date.now() - gameStartTime,
    };

    if (!currentData.events) {
      currentData.events = [];
    }
    currentData.events.push(event);
    saveData();

    if (Date.now() - gameStartTime > autoLength * 1e3)
      endGame();
  });

  newGame.addEventListener("click", e => {
    currentData = new ScoutingData(currentData.roundNumber + 1, null, currentData.scouterName, null);
    teamNumber.value = "";
    roundNumber.value = currentData.roundNumber;
    startButton.innerText = "Start";
    nextButton.hidden = true;
    confirmRestart = false;
    data.push(currentData);
    log.innerHTML = "";
    saveData();
    loadPage(1);
  });

  stateButton(["No Attempt", "Shallow Climb", "Deep Climb"], cageToggle, "Cage Climb", "cage");
  stateButton(["None", "Ground", "Feed", "Both"], coralIntakeDesign, "Coral Intake", "ciD", () => {
    coralIntakeDirection.hidden = currentData["Coral Intake"] == "None";
  });
  stateButton(["Horizontal", "Vertical"], coralIntakeDirection, "Coral Direction", "ciR");

  allianceToggle.addEventListener("click", e => {
    updateAlliance();
    saveData();
  });

  startButton.addEventListener("click", e => {

    if (confirmRestart) {
      if (!confirm("Are you sure you want to restart the game? This will clear your collected data!")) {
        return;
      }
    }
    currentData.events = [];
    log.innerHTML = "";

    for (var button of eventButtons.concat(stateButtons)) {
      button.button.hidden = false;
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

  updateTeam();
  updateRound();

  if (localStorage.currentPage) {
    loadPage(+localStorage.currentPage)
  } else {
    loadPage(1);
  }

  for (var button of eventButtons.concat(stateButtons)) {
    button.button.hidden = true;
  }
});

function saveData() {
  localStorage.ScoutingData = JSON.stringify(data);

  document.getElementById("submit").disabled = !validateData();
}

function validateData() {
  return currentData.teamNumber && currentData.alliance && currentData.roundNumber && currentData.scouterName && (!teams || teams[currentData.teamNumber]);
}

function parseTime(gameTime) {
  return Math.floor(gameTime / 60000) + ":" + Math.floor(gameTime % 60000 / 1000).toString().padStart(2, "0") + "." + Math.floor(gameTime % 1000 / 10).toString().padStart(2, "0");
}

var confirmRestart = false;
var summary = {};

function summarize() {
  summary = { "Robot Disabled": "Never" };
  autoOnly = {};
  for (var event of currentData.events) {
    if (event.name == "Robot Disabled" || event.name == "Auto Disabled") {
      summary[event.name] = event.time / 1000 + " s";
    } else {
      summary[event.name] = (summary[event.name] ?? 0) + 1;
    }

    if (event.time < 15000)
      autoOnly[event.name] = (autoOnly[event.name] ?? 0) + 1;
  }

  for (var input of stateButtons) {
    summary[input.name] = currentData[input.name];
  }

  summaryBox.innerHTML = `<br><li>Scouter: ${currentData.scouterName}</li><li>Team: ${currentData.teamNumber} (${currentData.alliance})</li><li>Round: ${currentData.roundNumber}</li>`;

  for (var event in summary) {
    var li = document.createElement("li");
    li.id = `summary${event}`;
    var span = document.createElement("span");
    span.innerText = `${event}: ${summary[event] ?? currentData[event]}`;
    li.appendChild(span);
    summaryBox.insertBefore(li, summaryBox.firstChild);
  }

  var s = summary;
  summary = { m: currentData.scouterName, t: currentData.teamNumber, a: currentData.alliance, o: currentData.roundNumber };
  for (var event in s) {
    summary[summaryKeys[event]] = s[event];
  }
  for (var event in autoOnly) {
    summary["a" + summaryKeys[event]] = autoOnly[event];
  }
}

function endGame() {
  gameStartTime = null;
  gameStatus.textContent = "Game Over!";
  startButton.hidden = false;
  startButton.innerText = "Restart";
  confirmRestart = true;
  nextButton.hidden = false;

  for (var button of eventButtons.concat(stateButtons)) {
    button.button.hidden = true;
  }

  summarize();

  exportData();
}

async function getRounds(event) {
  apisCalled++;
  updateProgress();
  try {
    result = await (await fetch(`https://www.thebluealliance.com/api/v3/event/${event}/matches?X-TBA-Auth-Key=${apikey}`)).json();

    for (var i = 0; i < result.length; i++) {
      if (result[i].comp_level == "qm") {
        roundOffset = i - 1;
        break;
      }
    }
  } catch {
    result = [];
    apisCalled--;
    apisReturned--;
  }
  apisReturned++; 
  updateProgress();
  return result;
}

async function getYear() {
  apisCalled++;
  updateProgress();
  try {
    result = (await (await fetch(`https://www.thebluealliance.com/api/v3/status?X-TBA-Auth-Key=${apikey}`)).json()).current_season;
  } catch {
    result = {};
    apisCalled--;
    apisReturned--;
  }
  apisReturned++; 
  updateProgress();
  return result;
}

function updateProgress() {
  progress.textContent = apisReturned + " / " + apisCalled;

  downloading.style.color = apisReturned == apisCalled ? "transparent" : "unset";
}

var estTeamPages = 22;
var apisCalled = 0;
var apisReturned = 0;
var roundOffset = 0;

async function getTeams() {
  var teams = [];
  var newTeams = [];
  apisCalled += estTeamPages;
  updateProgress();
  var i = 0;
  do {
    newTeams = await (await fetch(`https://www.thebluealliance.com/api/v3/teams/${i}?X-TBA-Auth-Key=${apikey}`)).json();
    teams = teams.concat(newTeams);
    i++;
    apisReturned++;
    if (i > estTeamPages)
      apisCalled++;
    updateProgress();
  } while (newTeams.length > 0)
  return teams;
}
async function getEvent(event) {
  apisCalled++;
  updateProgress();
  try {
    result = await (await fetch(`https://www.thebluealliance.com/api/v3/event/${event}?X-TBA-Auth-Key=${apikey}`)).json();
  } catch {
    result = [];
    apisCalled--;
    apisReturned--;
  }
  apisReturned++;
  updateProgress();
  return result;
}

var rounds = localStorage.rounds;
var district = localStorage.district;
var teams = JSONparse(localStorage.teams, []);

getYear().then(value => {
  year = value;
  if (+localStorage.teamsYear != year)
    getTeams().then(value => {
      teams = {};
      for (var team of value) {
        teams[team.team_number] = team;
      }
      localStorage.teams = JSON.stringify(teams);
      localStorage.teamsYear = year;
      updateRound();
    });

  getAPIData();
});

function getAPIData() {
  try {
    rounds = JSONparse(localStorage.rounds);
  } catch {
    rounds = {};
  }
  getRounds(eventKey).then(value => {
    localStorage.rounds = JSON.stringify(value);
    rounds = value;
    updateRound();
  });

  try {
    teams = JSONparse(localStorage.teams);
  } catch {
    teams = {};
  }
  getEvent(eventKey).then(value => {
    if (!value.Error) {
      if (value.district) {
        localStorage.district = value.district.key;
        district = value.district.key;
      }
      eventKeyInput.className = "input-inline";
    } else {
      eventKeyInput.className = "input-inline error";
      return;
    } 
  });
}

var alerted = false;
function exportData() {
  summarize();
  qrcode.innerHTML = "";
  summary.n = notes.textContent;
  var url = "https://sparta-scouting-page.vercel.app/import/?" + encodeURIComponent(JSON.stringify(summary));
  while (url.length >= 192 && url.length <= 217) {
    url += " ";
    // Bugfix with qrcodejs library, see https://github.com/davidshimjs/qrcodejs/issues/309
  }
  try {
    new QRCode("qrcode", url);
  } catch (error) {
    if (!alerted) {
      alert("QRCode could not be generated. Data saved to localStorage.");
      alerted = true;
    }
    console.log(error);
  }
  importerURL.href = "import/index.html?" + JSON.stringify(summary);
}

function importData() {
  var shortData = JSONparse(decodeURI(location.search).slice(1));
  summary = {scouterName: shortData.m, teamNumber: shortData.t, alliance: shortData.a}

  for (var key in summaryKeys) {
    summary[key] = shortData[summaryKeys[key]] ?? 0;
  }

  for (var input of stateButtons) {
    summary[input.name] = input.states[summary[input.name]];
  }
  return summary;
}

function gameFrameUpdate() {
  if (gameStartTime) {
    var gameTime = Date.now() - gameStartTime;
    const time = parseTime(gameTime);
    timer.textContent = time;
    var oldStatus = gameStatus.textContent;
    gameStatus.textContent = gameTime < autoLength * 1000 ? "Auto" : "TeleOp";
    endEarlyButton.textContent = gameTime < autoLength * 1000 ? "Auto Disabled" : "Robot Disabled";

    if (oldStatus == "Auto" && gameStatus.textContent == "TeleOp") {
      currentData.autoEvents = JSONparse(JSON.stringify(currentData.events));
      endEarlyButton.hidden = false;

      for (var button of eventButtons.concat(stateButtons)) {
        button.button.hidden = false;
      }
    }

    if (gameTime > gameLength * 1000) {
      endGame();
      return;
    }

    requestAnimationFrame(gameFrameUpdate);
  }
}

const gameLength = 2*60 + 30;
const autoLength = 15;
var currentPage = 0;
var gameStartTime = null;

function loadPage(page) {
  document.getElementById("page-" + currentPage).hidden = true;
  document.getElementById("page-" + page).hidden = false;
  currentPage = page;

  localStorage.currentPage = page;

  switch (page) {
    case 3: endGame();
    case 4: exportData();
  }
}

function updateAlliance() {
  if (currentData.alliance == "red") {
    currentData.alliance = "blue";
    allianceToggle.innerText = "Blue";
    allianceToggle.className = "input-inline blue";
  } else {
    currentData.alliance = "red";
    allianceToggle.innerText = "Red";
    allianceToggle.className = "input-inline red";
  }
}

function updateRound() {
  var round = (rounds == undefined) ? null : rounds[(+currentData.roundNumber) + roundOffset];

  if (currentData.roundNumber > 0 && round && round.alliances) {
    teamSelector.hidden = false;

    team1r.innerText = round.alliances.red.team_keys[0].slice(3);
    team2r.innerText = round.alliances.red.team_keys[1].slice(3);
    team3r.innerText = round.alliances.red.team_keys[2].slice(3);
    team1b.innerText = round.alliances.blue.team_keys[0].slice(3);
    team2b.innerText = round.alliances.blue.team_keys[1].slice(3);
    team3b.innerText = round.alliances.blue.team_keys[2].slice(3);
  } else {
    teamSelector.hidden = true;
  }
}
function updateTeam() {
  var team = teams[currentData.teamNumber];

  teamName.value = team ? team.nickname : "Unknown";
  teamOrigin.value = team && team.city ? team.city + ", " + (statesUSA[team.state_prov] ?? team.state_prov) : "Unknown";

  teamNumber.className = team ? "input-inline number" : "input-inline number error";
}

function selectTeamR(num) {
  currentData.teamNumber = window["team" + num + "r"].innerText;

  teamNumber.value = currentData.teamNumber;
  currentData.alliance = "blue";

  updateAlliance();
  updateTeam();

  saveData();
}
function selectTeamB(num) {
  currentData.teamNumber = window["team" + num + "b"].innerText;

  teamNumber.value = currentData.teamNumber;
  currentData.alliance = "red";

  updateTeam();
  updateAlliance();

  saveData();
}

function JSONparse(str, error) {
  try {
    return JSON.parse(str);
  } catch {
    return error;
  }
}