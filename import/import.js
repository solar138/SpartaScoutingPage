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
const eventKey = "2024wasam"; // TODO: Change this to 2025wabon before competition. Add some way to automatically get event info.

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
    return currentData.teamNumber && currentData.alliance && currentData.roundNumber && currentData.scouterName;
}

var summary = {};

async function getRounds(event) {
    return await (await fetch(`https://www.thebluealliance.com/api/v3/event/${event}/matches?X-TBA-Auth-Key=${apikey}`)).json();
}
async function getTeams(district) {
    return await (await fetch(`https://www.thebluealliance.com/api/v3/district/${district}/teams?X-TBA-Auth-Key=${apikey}`)).json();
}
async function getEvent(event) {
    return await (await fetch(`https://www.thebluealliance.com/api/v3/event/${event}?X-TBA-Auth-Key=${apikey}`)).json();
}

var rounds;
try {
    rounds = JSON.parse(localStorage.rounds);
} catch {
    rounds = {};
}
getRounds(eventKey).then(value => {
    localStorage.rounds = JSON.stringify(value);
    rounds = value;
});

var district = localStorage.district;
var teams;
try {
    teams = JSON.parse(localStorage.teams);
} catch {
    teams = {};
}
getEvent(eventKey).then(value => {
    localStorage.district = value.district.key;
    district = value.district.key;
    getTeams(district).then(value => {
        teams = {};
        for (var team of value) {
            teams[team.team_number] = team;
        }
        localStorage.teams = JSON.stringify(teams);
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

function importData() {
    var shortData = JSON.parse(decodeURI(location.search).slice(1));
    summary = { scouterName: shortData.m, teamNumber: shortData.t, alliance: shortData.a }

    for (var key in summaryKeys) {
        summary[key] = shortData[summaryKeys[key]] ?? 0;
    }

    for (var input of stateButtons) {
        summary[input.name] = input.states[summary[input.name]];
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