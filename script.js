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


let teamNumber = "";
let roundNumber = "";
let alliance = "";
let pinLocation = null;
const mapData = {
  actions: [],
};

function renderPage1() {
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

function renderPage2() {
  loadPage("map.html", () => {
    const map = document.getElementById("map");
    if (!map) return console.error("Map element not found!");

    map.addEventListener("click", (e) => {
      const rect = map.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      pinLocation = { x, y };

      // Create a pin marker
      const pin = document.createElement("div");
      pin.style.position = "absolute";
      pin.style.left = `${x}px`;
      pin.style.top = `${y}px`;
      pin.style.width = "10px";
      pin.style.height = "10px";
      pin.style.background = "red";
      pin.style.borderRadius = "50%";
      map.appendChild(pin);
    });

    const startButton = document.getElementById("startButton");
    if (!startButton) return console.error("startButton not found!");

    startButton.addEventListener("click", () => {
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

      const jsonData = JSON.stringify(mapData, null, 2);
      console.log(jsonData);
      alert("Data saved to console as JSON");
    });
  });
}

renderPage1();
