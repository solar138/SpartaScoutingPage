let teamNumber = "";
let roundNumber = "";
let alliance = "";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("setupForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {    
    e.preventDefault();
    teamNumber = document.getElementById("teamNumber").value;
    roundNumber = document.getElementById("roundNumber").value;
    alliance = document.getElementById("alliance").value;
    
    window.location.assign('map.html');
    });
  });