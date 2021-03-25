// Variables declaration to select the html elements  
var mainDiv = document.getElementById("dogImages");
var dispalyTries = document.getElementById("triesCount");
var timer = document.getElementById("timer");
var next = document.getElementById("next");
var previous = document.getElementById("previous");
var breedsDiv = document.getElementById("breeds");
var displylist = document.getElementById("breedslist");

// Variables declaration 
var selectedBreeds;
var pageNo = 1;
var gameNo = 1;
var breedList = []; // to store the id of selected breeds by user
var breedsNames = []; // to store the checked breeds by user 
var scoredlist = []; // when user will finish one game, data will be stored in this list

//fuction will call the dog API, create list of randomise dogs object.
// calls the disply dog function to disply the dog images
// call onclick image fuction to do the calcuation of matching images
function getDogImagesAPI() {
    var breedList = getAllSelectedBreeds();
    // console.log(breedList);
    var breedListLength = breedList.length;
    var difficultyLevel = getDifficultyLevel();
    var duplicateJsonObj;

    //if condition to check whater user has selected any breeds or not, 
    // when condition is true it will fetch random number of images based on difficulty level selected by the user
    if (breedListLength == 0) {
        alert("Game will started with ramdonly selected breeds");
        fetch("https://api.thedogapi.com/v1/images/search?mime_types=jpg&limit=" + difficultyLevel)
            .then(dogJson => dogJson.json())
            .then(dogJson => {
                // console.log(dogJson);
                duplicateJsonObj = dogJson.concat(dogJson);
                // console.log(duplicateJsonObj);
                // shuffle the duplicated dogobject
                duplicateJsonObj.sort(() => 0.5 - Math.random());
                // console.log(duplicateJsonObj);
                displayImages(duplicateJsonObj);
                onClickImge(duplicateJsonObj);
            })
            .catch(err => {
                // console.log("Erro");
                alert("Error: try again");
            })
    }
    //when condition is false it will fetch the all images of all selected breeds 
    else {
        Promise.all(breedList.map(breedList =>
                fetch("https://api.thedogapi.com/v1/images/search?mime_types=jpg&limit=100&breed_id=" + breedList)
                .then(dogJson => dogJson.json())))
            .then(dogJson => {
                // to combine the dogobjects into one single object
                var combinedDogArray = dogJson.flat();
                // console.log(combinedDogArray);
                var lengthDogArray = combinedDogArray.length;

                if (lengthDogArray >= difficultyLevel) {
                    var indexList = [];
                    var dogJsonObj = [];
                    var index;
                    var count = 0;
                    // get the difficultyLevel number of random indexs and 
                    // get data from combined dog object of those indexs and store them into list of objects
                    while (indexList.length != difficultyLevel && count != 50) {
                        index = Math.ceil(Math.random() * lengthDogArray) - 1;
                        if (!indexList.includes(index)) {
                            indexList.push(index);
                            var obj = combinedDogArray[index];
                            var dogObj = {};
                            dogObj["breedID"] = obj.breeds[0].id;
                            dogObj["url"] = obj.url;
                            dogJsonObj.push(dogObj);
                        }
                    }
                    // console.log(indexList);
                    //if condition to make sure while loop does not go infinite 
                    if (indexList.length != difficultyLevel) {
                        console.log("Try again");
                    }

                    // console.log(dogJsonObj);
                    // concatinging final dogobject(of selected breeeds) to itself to get the each object twice in the list
                    duplicateJsonObj = dogJsonObj.concat(dogJsonObj);
                    // shuffle the concatenated final dogobject
                    duplicateJsonObj.sort(() => .5 - Math.random());
                    // console.log(duplicateJsonObj);
                    //Calling fuctiction to display the imsges
                    displayImages(duplicateJsonObj);

                    //calling a fuction to get the actual image of dog and do calculation of matching images
                    onClickImge(duplicateJsonObj);

                } else {
                    alert("Sorry, Not enough images of selected breeds,\n Please, select more breeds to continue..")
                }

            })
            .catch(err => {
                alert("Error: try again");
            })
    }
}

function onClickImge(json) {
    var list = []; // to keep trace of users clicks and make sure user only have 2 clicks at the time 
    var win = 0;
    var tries = 0;
    var timelimit = setTime();
    var btns = document.getElementById("dogImages").querySelectorAll('button');
    var message = document.getElementById("message");

    //to start the timer and clear it when game is over and dispaly the times to user
    var interval = setInterval(function() {
            if (timelimit != 0) {
                timelimit--;
                timer.innerHTML = timelimit;
            } else {
                gameoverBox(0, "Time Out");
                clearInterval(interval); // to clear the interval
                timelimit == 0;
            }
        },
        1500);

    // for loop to go through the dog images and set event listener for a click event and do maching insta calculation
    for (each of btns) {
        each.addEventListener("click", function() {
            // store the id of click image to list
            list.push(this.id);
            // get the original image from dogjson object with same id and replace the image 
            this.querySelector(".img").src = json[this.id].url;
            //do matching urls(of 2 images at a time) calcualation 
            if (list.length == 2) {
                setTimeout(
                    function() {
                        // condtion is true, urls are matched and change the text of message div
                        if (json[list[0]].url == json[list[1]].url) {
                            // console.log("Images matched");
                            message.innerHTML = "Images Matched! :)";
                            message.classList.add("alert-success");
                            message.classList.remove("alert-danger");
                            win++;
                            //to check if user won the game of not, if condition is true it will display the alret win message box
                            if (win == (json.length / 2)) {
                                setTimeout(function() {
                                    gameoverBox(tries, "Won");
                                    clearInterval(interval);
                                    timelimit == 0;
                                }, 400);
                            }
                        }
                        // when condition is false it will change the dog images to default image
                        else {
                            // console.log("Images Not matched");
                            message.innerHTML = "Images NOT Matched! :(";
                            message.classList.add("alert-danger");
                            message.classList.remove("alert-success");
                            btns[list[0]].firstElementChild.src = "dogthinking.jpg";
                            btns[list[1]].firstElementChild.src = "dogthinking.jpg";
                        }
                        // console.log(list);
                        list = [];
                        //increase the number of tries after doing the calculation of matching urls one time
                        tries++;
                        dispalyTries.innerHTML = tries;
                    }, 1500);
            }
        });
    }
}

// the function is place the default dog image when user starts the game
// the other attributes such as id, classname will get add to elements
function displayImages(jsonObj) {
    mainDiv.innerHTML = '';
    var flipedImageurl = "dogthinking.jpg";
    var counter = 0;
    for (let x of jsonObj) {
        var img = document.createElement("img");
        var btn = document.createElement("button");
        img.src = flipedImageurl;
        img.className += "img";
        btn.id = counter;
        btn.append(img);
        mainDiv.append(btn);
        counter++;
    }
}

// fuction to get the level of difficulty selected by the user before starting the game 
function getDifficultyLevel() {
    var selectLevel = document.getElementById("levelSelection").value;
    var n = 6;
    switch (selectLevel) {
        case "Easy":
            n = 4;
            break;
        case "Normal":
            n = 6;
            break;
        case "Hard":
            n = 9;
            break;
        case "Super Hard":
            n = 12;
            break;
    }
    return n;
}



//when game is over eithe by winning the game or timeout, this function will get executed
function gameoverBox(tries, result) {
    var difficultyLevelValue = document.getElementById("levelSelection").value;
    var result;
    score = {};
    score["gameNo"] = gameNo;
    score["tries"] = tries;
    score["level"] = difficultyLevelValue;
    score["result"] = result;
    scoredlist.push(score); //  to store the finished game scores and other details into array
    // console.log(scoredlist);
    if (result == "Won") {
        alert("Game Over, You won! \nYou have found all matching pairs in " + tries + " goes.");
    } else {
        alert("Game Over, TIME OUT! \n Play again");
    }
    gameNo++; // increase the game number after one play of a game
    reset();

}

// to reset the elemeents of screen for next game
function reset() {
    mainDiv.innerHTML = "";
    dispalyTries.innerHTML = 0;
    message.classList.remove("alert-success");
    message.classList.remove("alert-danger");
    message.innerHTML = "Start game again!";
    timer.innerHTML = 0;
    displylist.innerHTML = '';
    var inputs = document.getElementById("breeds").querySelectorAll("input[type='checkbox']");
    for (each of inputs) {
        each.checked = false; // to unchcecked the all breeds which had been selected for a game
    }
}

//fuction to get the time limit for a game based on difficulty level selected by user
function setTime() {
    var setTimer = document.getElementById("levelSelection").value;
    var seconds = 40;
    switch (setTimer) {
        case "Easy":
            seconds = 20;
            break;
        case "Normal":
            seconds = 40;
            break;
        case "Hard":
            seconds = 120;
            break;
        case "Super Hard":
            seconds = 360;
            break;
    }
    return seconds;
}


//function to get the list of dog breed list limit of 10 on each page
// the page paramater to implement the pagination 
// function will call the dispay breeds fuction to display the name of breeds
function getDogBreedsAPI(page) {
    fetch("https://api.thedogapi.com/v1/breeds?limit=10&page=" + page)
        .then(dogBreedsJson => dogBreedsJson.json())
        .then(dogBreedsJson => {
            // console.log("https://api.thedogapi.com/v1/breeds?limit=10&page=" + page)
            displyBreeds(dogBreedsJson);
        })
        .catch(err => {
            alert("Error: Try Again");
        })
}

//when load the page, to display the first 10 breeds list on page
function pagination() {
    getDogBreedsAPI(0);
}

//on click of next button, it will update page number by 1 and call the dog Breeds API
next.onclick = function() {
    getAllSelectedBreeds();
    getDogBreedsAPI(pageNo++);
    breedsDiv.innerHTML = "";
}

//on click on previous page, it will update the page number by -1 and call the dog breeds API
previous.onclick = function() {
    getAllSelectedBreeds();
    getDogBreedsAPI(pageNo - 2);
    pageNo--;
    breedsDiv.innerHTML = "";
}

// to display the name of checked breeds on change of list of checkboxs(checkbox of breeds list)
document.getElementById("breeds").onchange = function() {
    var inputs = document.getElementById("breeds").querySelectorAll("input[type='checkbox']");
    for (each of inputs) {
        if (each.checked == true) {
            if (!breedsNames.includes(each.name)) {
                breedsNames.push(each.name);
                displylist.innerHTML += each.name + ", ";
            }
        }
    }
}

// this fuction will store all selected breeds of different pages to list to start the game
function getAllSelectedBreeds() {
    var checkedBreeds = document.getElementById("breeds").querySelectorAll("input[type='checkbox']:checked");
    for (let eachBreed of checkedBreeds) {
        breedList.push(eachBreed.value);
    }
    return breedList;
}



// the function to dispaly the breeds list 
// fuction also add attributes to elements for labels and checkboxs
function displyBreeds(dogBreedsJson) {
    for (let x of dogBreedsJson) {
        var input = document.createElement("input");
        var label = document.createElement("label");
        var div = document.createElement("div");
        input.type = "checkbox";
        input.value = x.id;
        input.id = x.id;
        input.name = x.name;
        div.className = "col-6";
        label.appendChild(document.createTextNode(x.name + " "));
        label.setAttribute("for", x.id);
        div.appendChild(input);
        div.appendChild(label);
        breedsDiv.appendChild(div);
    }
}

//function to return the best scores(the minimum number of tries)
function getMinScore() {
    var minScore = scoredlist[0].tries;
    for (var i = 0; i < scoredlist.length; i++) {
        if (scoredlist[i].tries < minScore && scoredlist[i].result == "Won") {
            minScore = scoredlist[i].tries;
        }
    }
    // console.log("Min score: " + minScore);
    return minScore;
}

//function to craete and display the score board to view all played games scores so far by the user 
//function also add the attributes to the elements
function getAllScores() {
    var scoreBoard = document.getElementById("scoreList");
    scoreBoard.innerHTML = '';

    if (scoredlist.length != 0) {
        var min = getMinScore();

        for (var i = 0; i < scoredlist.length; i++) {
            var div = document.createElement("div");
            div.className = "row alert alert-secondary";

            if (scoredlist[i].result == "Won") {
                if (scoredlist[i].tries == min) {
                    div.className = "row alert alert-danger";
                    div.innerHTML += "<b>Highest Score</b>";
                } else {
                    div.className = "row alert alert-secondary";
                }
            }
            div.innerHTML += "Game number: " + scoredlist[i].gameNo + "<br>";
            div.innerHTML += "Difficulty level: " + scoredlist[i].level + "<br>";
            if (scoredlist[i].result == "Won") {
                div.innerHTML += "Status: " + "You Won" + "<br>";
            } else {
                div.innerHTML += "Status: " + "You lose, Timeout" + "<br>";
            }
            div.innerHTML += "Score: " + scoredlist[i].tries + "<br>";
            scoreBoard.append(div);
        }
    } else {
        scoreBoard.innerHTML = "You do not have any scores yet!";
    }
}

// to refresh the page when user clicks on reset the game button
function reload() {
    if (confirm("Warning: The page will reload, it will clear all selection and score borad ! ")) {
        window.location.reload();
    }
}

//to call the appropriate function on click of different buttons
document.getElementById("startGame").onclick = getDogImagesAPI;
document.getElementById("scoreBoard").onclick = getAllScores;
document.getElementById("reset").onclick = reload;

//call pagination fuction to display the first 10 breeds list on load of window
window.onload = pagination();