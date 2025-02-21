const app = document.getElementById("app");

const loadPage = (filename, callback) => {
  fetch(filename)
    .then(response => response.text())
    .then(html => {
      app.innerHTML = ""; // Clears previous content before loading new page
      app.innerHTML = html;
      requestAnimationFrame(() => {
        if (callback) callback(); // Execute callback AFTER the DOM updates
      });
    })
    .catch(error => console.error("Error loading HTML:", error));
};

document.getElementById("mapButton").addEventListener("click", () => {
  renderPage1(); // This will dynamically load the map page
});

let teamNumber = "";
let roundNumber = "";
let alliance = "";
let pinLocation = null;
const mapData = {
  actions: [],
};

document.getElementById("mapButton").addEventListener("click", () => {
  loadPage("setup.html", () => {
    const form = document.getElementById("setupForm");
    if (!form) return console.error("setupForm not found!");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      teamNumber = document.getElementById("teamNumber").value;
      roundNumber = document.getElementById("roundNumber").value;
      alliance = document.getElementById("alliance").value;
      renderPage2();
    });
  });
}
)

function renderPage2() {
  loadPage("map.html", () => {
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
      renderPage3();
    });
  });
}

function renderPage3() {
  loadPage("scouting.html", () => {
    const counter1Value = document.getElementById("counter1-value");
    let counter1 = 0;

    const plusButton = document.getElementById("counter1-plus");
    const minusButton = document.getElementById("counter1-minus");
    const saveButton = document.getElementById("saveData");

    if (!plusButton || !minusButton || !saveButton) {
      return console.error("One or more counter buttons not found!");
    }

    plusButton.addEventListener("click", () => {
      counter1++;
      counter1Value.textContent = counter1;
    });

    minusButton.addEventListener("click", () => {
      if (counter1 > 0) counter1--;
      counter1Value.textContent = counter1;
    });

    saveButton.addEventListener("click", () => {
      const checkbox1 = document.getElementById("checkbox1")?.checked || false;

      mapData.actions.push({
        checkbox1,
        counter1,
        pinLocation,
      });

      const jsonData2 = JSON.stringify(mapData, null, 2);
      console.log(jsonData2);
      alert("Data saved to console as JSON");
    });
  });
}