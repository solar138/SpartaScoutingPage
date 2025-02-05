const scoutingContainer = document.querySelector(".notes-container");
const makeButton = document.querySelector(".button");
let notes = document.querySelectorAll(".input-box");

//Shows saved notes
function showScoutFactoids() {
    scoutingContainer.innerHTML = localStorage.getItem("notes");
}
showScoutFactoids();

//Updates local memory when changes are made
function updateMem() {
    localStorage.setItem("notes", scoutingContainer.innerHTML);
}



//Creates a blog
makeButton.addEventListener("click", ()=>{
    let inputBox = document.createElement("p");
    let img = document.createElement("img");
    inputBox.className = "input-box";
    inputBox.setAttribute("contenteditable", "true");
    img.src = "images/TrashCan.png";
    scoutingContainer.appendChild(inputBox).appendChild(img);
})



//Deletes a blog
scoutingContainer.addEventListener("click", function(e){
    if(e.target.tagName === "IMG"){
        e.target.parentElement.remove();
        updateMem();
    }
    else if(e.target.tagName === "P") {
        notes = document.querySelectorAll(".input-box");
        notes.forEach(nt => {
            nt.onkeyup = function() {
                updateMem();
            }
        })
    }
})


