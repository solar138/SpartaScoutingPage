const mapData = { actions: [] };

document.addEventListener("DOMContentLoaded", () => {
    const startButton = document.getElementById("startButton");
    if (!startButton) return console.error("Start button not found!");

    startButton.addEventListener("click", () => {
      const checkbox1 = document.getElementById("checkbox1").checked;
      const checkbox2 = document.getElementById("checkbox2").checked;
      const checkbox3 = document.getElementById("checkbox3").checked;

      mapData.actions.push({ checkbox1, checkbox2, checkbox3 });

      const jsonData1 = JSON.stringify(mapData, null, 2);
      console.log(jsonData1);
      alert("Data saved to console as JSON");

    console.log("Navigated to Scouting Page");
    window.location.assign('scouting.html');
    });
});