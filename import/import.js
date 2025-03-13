var apiKey = localStorage.apiKey ?? prompt("Please enter your TBA API key.");
localStorage.apiKey = apiKey;
const summaryKeys = {
    "Coral Intaken": "c",
    "Processor Scored": "p",
    "Barge by Human": "h",
    "Barge by Robot": "r",
    "L1 Coral Scored": "1",
    "L2 Coral Scored": "2",
    "L3 Coral Scored": "3",
    "L4 Coral Scored": "4",
    "Algae Removed": "g",
    "": "",
    "Auto Disabled": "da",
    "Robot Disabled": "dr",
    "Cage Climb": "cage",
    "Coral Intake": "ciD",
    "Coral Direction": "ciR",
};
const stateButtons = [
    {
        "states": [
            "No Attempt",
            "Shallow Climb",
            "Deep Climb"
        ],
        "name": "Cage Climb"
    },
    {
        "states": [
            "None",
            "Ground",
            "Feed",
            "Both"
        ],
        "name": "Coral Intake"
    },
    {
        "states": [
            "Horizontal",
            "Vertical"
        ],
        "name": "Coral Direction"
    }
];

var stateButtonMap = {};

for (var stateButton of stateButtons) {
    stateButtonMap[stateButton.name] = stateButton;
}

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
document.addEventListener("DOMContentLoaded", () => {
    loadPage(1);
    if (localStorage.importCurrentPage) {
        //loadPage(+localStorage.importCurrentPage)
    } else {
    }
});

var data = JSONparse(localStorage.CollectedData || "{}");

function saveData() {
    localStorage.CollectedData = JSON.stringify(data);
}

function mergeData() {
    if (!data[summary.teamNumber]) data[summary.teamNumber] = {};
    data[summary.teamNumber][summary.roundNumber] = summary;

    saveData();
}

function validateData() {
    return summary.teamNumber && summary.alliance && summary.roundNumber && summary.scouterName;
}

var summary = {};

async function getRounds(event) {
    return await (await fetch(`https://www.thebluealliance.com/api/v3/event/${event}/matches?X-TBA-Auth-Key=${apiKey}`)).json();
}

async function getYear() {
    return (await (await fetch(`https://www.thebluealliance.com/api/v3/status?X-TBA-Auth-Key=${apiKey}`)).json()).current_season;
}

async function getTeams() {
    var teams = [];
    var newTeams = [];
    var i = 0;
    do {
        newTeams = await (await fetch(`https://www.thebluealliance.com/api/v3/teams/${i}?X-TBA-Auth-Key=${apiKey}`)).json();
        teams = teams.concat(newTeams);
        i++;
    } while (newTeams.length > 0)
    return teams;
}
async function getEvent(event) {
    return await (await fetch(`https://www.thebluealliance.com/api/v3/event/${event}?X-TBA-Auth-Key=${apiKey}`)).json();
}

var teams = JSONparse(localStorage.teams);

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
        });
});

function exportData() {
    summarize();
    qrcode.innerHTML = "";
    var url = "https://sparta-scouting-page.vercel.app/import/?" + JSON.stringify(summary);
    try {
        new QRCode("qrcode", url);
    } catch {
        alert("QRCode could not be generated. Data saved to localStorage.");
    }
}

importData();

function importData() {
    try {
        shortData = JSON.parse(decodeURIComponent(location.search).slice(1));
    } catch {
        alert("Failed to import: Malformed JSON");
        return;
    }
    summary = {};
    display = {};

    for (var key in summaryKeys) {
        if (key == "") {
            display[key] = "&nbsp;";
            summary[key] = 0;
        } else if (key == "Auto Disabled" || key == "Robot Disabled") {
            display[key] = (shortData[summaryKeys[key]] ?? 0);
            summary[key] = +((shortData[summaryKeys[key]] ?? 0).replaceAll(" s", ""));
        } else {
            display[key] = (shortData[summaryKeys[key]] ?? 0) + " / " + (shortData["a" + summaryKeys[key]] ?? 0);
            summary[key] = (shortData[summaryKeys[key]] ?? 0);
            summary["(Auto) " + key] = (shortData["a" + summaryKeys[key]] ?? 0);
        }
    }

    for (var input of stateButtons) {
        summary[input.name] = summary[input.name][0] ?? 0;
        display[input.name] = input.states[display[input.name][0]];
    }

    //summaryBox.innerHTML = `<li>Scouter: ${shortData.m}</li><li>Team: ${shortData.t} (${shortData.a})</li><li>Round: ${shortData.o}</li>`;
/*
    for (var event in summary) {
        var li = document.createElement("li");
        li.id = `summary${event}`;
        var span = document.createElement("span");
        span.innerText = `${event}: ${summary[event] ?? summary[event]}`;
        li.appendChild(span);
        summaryBox.insertBefore(li, summaryBox.firstChild);
    }*/
    summaryTable.innerHTML = `
                <tr>
                    <td></td>
                    <td>Total / Auto Only</td>
                </tr>`;
    createTable(display, summaryTable);

    var info = { "Scouter": shortData.m, "Team": shortData.t, "": getTeamName(shortData.t), "Alliance": shortData.a, "Round": shortData.o };
    summaryTable.innerHTML += "<tr><td>&nbsp;</td></tr>"
    createTable(info, summaryTable);
    summary.scouterName = shortData.m;
    summary.teamNumber = shortData.t;
    summary.alliance = shortData.a;
    summary.roundNumber = shortData.o;

    notes.innerText = shortData.n;
}

function getTeamName(team) {
    if (teams[team]) {
        return teams[team].nickname;
    } else {
        return "No Data";
    }
}

function createTable(data, table) {

    for (var entry in data) {
        var tr = document.createElement("tr");
        var tdKey = document.createElement("td");
        tdKey.innerHTML = entry.length > 0 ? entry + " : " : entry;
        var tdValue = document.createElement("td");
        tdValue.innerHTML = data[entry];
        tr.appendChild(tdKey);
        tr.appendChild(tdValue);
        table.appendChild(tr);
    }
}

var currentPage = 0;

function loadPage(page) {
    document.getElementById("page-" + currentPage).hidden = true;
    document.getElementById("page-" + page).hidden = false;
    currentPage = page;

    localStorage.importCurrentPage = page;

    switch (page) {
        case 2: loadScoutingData();
    }
}
function JSONparse(str, error) {
  try {
    return JSON.parse(str);
  } catch {
    return error;
  }
}

function loadScoutingData() {
    for (var team in data) {
        var li = document.createElement("li");
        li.id = `team${team}`;
        var n = 0;
        for (var rounds in data[team]) {
            n++;
        }
        var span = document.createElement("span");
        span.innerText = `${team}: ${n} Round${n == 1 ? "" : "s"}`;
        li.appendChild(span);
        dataTable.insertBefore(li, dataTable.firstChild);
    }
}

function exportToCSV() {
    var sums = {};
    for (var team in data) {
        var sum = {};
        for (var round in data[team]) {
            for (var field in data[team][round]) {
                if (stateButtonMap[field]) {

                }
            }
        }
    }
}