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
let currentData = data[data.length - 1] ?? new ScoutingData(null, null, "unknown", null);

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

document.addEventListener("DOMContentLoaded", () => {

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

  const form = document.getElementById("setupForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {    
    e.preventDefault();
    saveData();

    window.location.assign('map.html');
  });
});

function saveData() {
  localStorage.ScoutingData = JSON.stringify(data);

  document.getElementById("submit").disabled = !validateData();
}

function validateData() {
  return currentData.teamNumber && currentData.alliance && currentData.roundNumber && currentData.scouterName;
}