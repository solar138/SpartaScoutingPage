const apikey = "tYekUbMgHsDcEblf230XxA7WmLMbxFxqALAleZIGZatgAeKCKh7RuaJ1EKGsURCf";
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
    "Cage Climb": "cage",
    "Coral Intake": "ciD",
    "Coral Direction": "ciR"
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
    if (localStorage.importCurrentPage) {
        loadPage(+localStorage.importCurrentPage)
    } else {
        loadPage(1);
    }
});

function saveData() {
    localStorage.ScoutingData = JSON.stringify(data);

    document.getElementById("submit").disabled = !validateData();
}

function validateData() {
    return summary.teamNumber && summary.alliance && summary.roundNumber && summary.scouterName;
}

var summary = {};

async function getRounds(event) {
    return await (await fetch(`https://www.thebluealliance.com/api/v3/event/${event}/matches?X-TBA-Auth-Key=${apikey}`)).json();
}

async function getYear() {
    return (await (await fetch(`https://www.thebluealliance.com/api/v3/status?X-TBA-Auth-Key=${apikey}`)).json()).current_season;
}

async function getTeams() {
    var teams = [];
    var newTeams = [];
    var i = 0;
    do {
        newTeams = await (await fetch(`https://www.thebluealliance.com/api/v3/teams/${i}?X-TBA-Auth-Key=${apikey}`)).json();
        teams = teams.concat(newTeams);
        i++;
    } while (newTeams.length > 0)
    return teams;
}
async function getEvent(event) {
    return await (await fetch(`https://www.thebluealliance.com/api/v3/event/${event}?X-TBA-Auth-Key=${apikey}`)).json();
}

var teams = JSON.parse(localStorage.teams);

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
        shortData = JSON.parse(decodeURI(location.search).slice(1));
    } catch {
        alert("Failed to import: Malformed JSON");
        return;
    }
    summary = {};

    for (var key in summaryKeys) {
        summary[key] = shortData[summaryKeys[key]] ?? 0;
    }

    for (var input of stateButtons) {
        summary[input.name] = input.states[summary[input.name]];
    }

    summaryBox.innerHTML = `<br><li>Scouter: ${shortData.m}</li><li>Team: ${shortData.t} (${shortData.a})</li><li>Round: ${shortData.r}</li>`;

    for (var event in summary) {
        var li = document.createElement("li");
        li.id = `summary${event}`;
        var span = document.createElement("span");
        span.innerText = `${event}: ${summary[event] ?? summary[event]}`;
        li.appendChild(span);
        summaryBox.insertBefore(li, summaryBox.firstChild);
    }
    summary.scouterName = shortData.m;
    summary.teamNumber = shortData.t;
    summary.alliance = shortData.a;
    summary.roundNumber = shortData.r;

    notes.innerText = shortData.n;

    var s = summary;
    for (var event in s) {
        summary[summaryKeys[event]] = s[event];
    }
    return summary;
}

var currentPage = 0;

function loadPage(page) {
    document.getElementById("page-" + currentPage).hidden = true;
    document.getElementById("page-" + page).hidden = false;
    currentPage = page;

    localStorage.importCurrentPage = page;

    switch (page) {
        case 3: endGame();
        case 4: exportData();
    }
}