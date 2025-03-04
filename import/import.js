const apikey = "tYekUbMgHsDcEblf230XxA7WmLMbxFxqALAleZIGZatgAeKCKh7RuaJ1EKGsURCf";
const summaryKeys = {};
const stateButtons = [];
const eventKey = "2024wasam";
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