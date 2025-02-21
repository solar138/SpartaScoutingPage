const mapData = { actions: [] };

document.addEventListener("DOMContentLoaded", () => {
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
        });

        const jsonData2 = JSON.stringify(mapData, null, 2);
        console.log(jsonData2);
        alert("Data saved to console as JSON");
    });
});