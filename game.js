// ======================================================
// MOUNTAIN RUSH - IMPOSSIBLE HILLS
// Version 1
// ======================================================


// ------------------------------------------------------
// CANVAS
// ------------------------------------------------------

const canvas = document.getElementById("gameCanvas");

const ctx = canvas.getContext("2d");

canvas.width = 1200;
canvas.height = 650;


// ------------------------------------------------------
// UI
// ------------------------------------------------------

const distanceText =
    document.getElementById("distance");

const coinsText =
    document.getElementById("coins");

const fuelText =
    document.getElementById("fuel");

const startScreen =
    document.getElementById("startScreen");

const gameOverScreen =
    document.getElementById("gameOverScreen");

const startButton =
    document.getElementById("startButton");

const restartButton =
    document.getElementById("restartButton");

const finalDistance =
    document.getElementById("finalDistance");

const finalCoins =
    document.getElementById("finalCoins");

const finalScore =
    document.getElementById("finalScore");


// ------------------------------------------------------
// GAME VARIABLES
// ------------------------------------------------------

let gameRunning = false;

let gameOver = false;

let distance = 0;

let coins = 0;

let fuel = 100;

let score = 0;

let cameraX = 0;

let lastTime = 0;


// ------------------------------------------------------
// KEYBOARD
// ------------------------------------------------------

const keys = {};


window.addEventListener("keydown", function (event) {

    keys[event.key.toLowerCase()] = true;

});


window.addEventListener("keyup", function (event) {

    keys[event.key.toLowerCase()] = false;

});


// ------------------------------------------------------
// WORLD
// ------------------------------------------------------

const WORLD_WIDTH = 100000;


// ------------------------------------------------------
// TERRAIN
// ------------------------------------------------------

function terrainHeight(x) {

    let base = 470;

    let wave1 =
        Math.sin(x * 0.006) * 65;

    let wave2 =
        Math.sin(x * 0.013) * 25;

    let wave3 =
        Math.sin(x * 0.002) * 70;

    let small =
        Math.sin(x * 0.035) * 10;

    return base -
        wave1 -
        wave2 -
        wave3 -
        small;
}


// ------------------------------------------------------
// TERRAIN SLOPE
// ------------------------------------------------------

function terrainSlope(x) {

    const smallDistance = 2;

    return (
        terrainHeight(x + smallDistance) -
        terrainHeight(x - smallDistance)
    ) / (smallDistance * 2);
}


// ------------------------------------------------------
// CAR
// ------------------------------------------------------

const car = {

    x: 200,

    y: 350,

    width: 90,

    height: 42,

    velocityX: 0,

    velocityY: 0,

    rotation: 0,

    rotationSpeed: 0,

    wheelRadius: 16,

    grounded: false

};


// ------------------------------------------------------
// WHEELS
// ------------------------------------------------------

const frontWheel = {

    offsetX: 30,

    offsetY: 22

};


const backWheel = {

    offsetX: -30,

    offsetY: 22

};


// ------------------------------------------------------
// COINS
// ------------------------------------------------------

let coinList = [];


function createCoins() {

    coinList = [];

    for (
        let x = 500;
        x < WORLD_WIDTH;
        x += 300
    ) {

        let height =
            terrainHeight(x);

        coinList.push({

            x: x,

            y: height - 70,

            radius: 13,

            collected: false

        });

    }

}


// ------------------------------------------------------
// FUEL CANS
// ------------------------------------------------------

let fuelList = [];


function createFuel() {

    fuelList = [];

    for (
        let x = 1000;
        x < WORLD_WIDTH;
        x += 1800
    ) {

        let height =
            terrainHeight(x);

        fuelList.push({

            x: x,

            y: height - 65,

            width: 25,

            height: 35,

            collected: false

        });

    }

}


// ------------------------------------------------------
// RESET GAME
// ------------------------------------------------------

function resetGame() {

    distance = 0;

    coins = 0;

    fuel = 100;

    score = 0;

    cameraX = 0;


    car.x = 200;

    car.y =
        terrainHeight(car.x) - 70;

    car.velocityX = 0;

    car.velocityY = 0;

    car.rotation = 0;

    car.rotationSpeed = 0;

    gameOver = false;


    createCoins();

    createFuel();


    updateUI();

}


// ------------------------------------------------------
// START GAME
// ------------------------------------------------------

function startGame() {

    resetGame();

    gameRunning = true;

    startScreen.classList.add("hidden");

    gameOverScreen.classList.add("hidden");

    lastTime = performance.now();

    requestAnimationFrame(gameLoop);

}


// ------------------------------------------------------
// GAME OVER
// ------------------------------------------------------

function endGame() {

    gameRunning = false;

    gameOver = true;


    finalDistance.textContent =
        Math.floor(distance);

    finalCoins.textContent =
        coins;

    finalScore.textContent =
        Math.floor(score);


    gameOverScreen.classList.remove("hidden");

}


// ------------------------------------------------------
// UI UPDATE
// ------------------------------------------------------

function updateUI() {

    distanceText.textContent =
        Math.floor(distance);

    coinsText.textContent =
        coins;

    fuelText.textContent =
        Math.max(0, Math.floor(fuel));

}


// ------------------------------------------------------
// UPDATE CAR
// ------------------------------------------------------

function updateCar(delta) {

    const acceleration = 550;

    const braking = 650;

    const gravity = 1000;


    // --------------------------------------------------
    // ACCELERATE
    // --------------------------------------------------

    if (
        keys["arrowright"] ||
        keys["d"]
    ) {

        car.velocityX +=
            acceleration * delta;

        fuel -=
            4 * delta;

    }


    // --------------------------------------------------
    // BRAKE / REVERSE
    // --------------------------------------------------

    if (
        keys["arrowleft"] ||
        keys["a"]
    ) {

        car.velocityX -=
            braking * delta;

        fuel -=
            1.5 * delta;

    }


    // --------------------------------------------------
    // AIR ROTATION
    // --------------------------------------------------

    if (
        keys["arrowup"] ||
        keys["w"]
    ) {

        car.rotationSpeed -=
            4 * delta;

    }


    if (
        keys["arrowdown"] ||
        keys["s"]
    ) {

        car.rotationSpeed +=
            4 * delta;

    }


    // --------------------------------------------------
    // LIMIT SPEED
    // --------------------------------------------------

    if (car.velocityX > 800) {

        car.velocityX = 800;

    }


    if (car.velocityX < -300) {

        car.velocityX = -300;

    }


    // --------------------------------------------------
    // GRAVITY
    // --------------------------------------------------

    car.velocityY +=
        gravity * delta;


    // --------------------------------------------------
    // POSITION
    // --------------------------------------------------

    car.x +=
        car.velocityX * delta;

    car.y +=
        car.velocityY * delta;


    // --------------------------------------------------
    // GROUND
    // --------------------------------------------------

    const groundY =
        terrainHeight(car.x);


    const wheelGround =
        car.y + 35;


    if (wheelGround >= groundY) {

        car.y =
            groundY - 35;

        car.velocityY = 0;

        car.grounded = true;


        // Terrain angle

        const slope =
            terrainSlope(car.x);

        const terrainAngle =
            Math.atan(slope);


        // Slowly rotate car to terrain

        car.rotation +=
            (terrainAngle - car.rotation)
            * 8
            * delta;


        // Ground friction

        car.velocityX *=
            Math.pow(0.97, delta * 60);

        car.rotationSpeed *=
            0.8;

    }

    else {

        car.grounded = false;

        car.rotation +=
            car.rotationSpeed * delta;

    }


    // --------------------------------------------------
    // LIMIT ROTATION
    // --------------------------------------------------

    if (car.rotation > Math.PI * 2) {

        car.rotation -=
            Math.PI * 2;

    }


    if (car.rotation < -Math.PI * 2) {

        car.rotation +=
            Math.PI * 2;

    }


    // --------------------------------------------------
    // CAMERA
    // --------------------------------------------------

    cameraX =
        car.x - 300;


    if (cameraX < 0) {

        cameraX = 0;

    }


    // --------------------------------------------------
    // DISTANCE
    // --------------------------------------------------

    distance =
        Math.max(
            distance,
            (car.x - 200) / 10
        );


    // --------------------------------------------------
    // SCORE
    // --------------------------------------------------

    score =
        distance * 2 +
        coins * 100;


    // --------------------------------------------------
    // FUEL
    // --------------------------------------------------

    fuel -=
        0.25 * delta;


    if (fuel <= 0) {

        fuel = 0;

        endGame();

    }


    // --------------------------------------------------
    // CRASH CHECK
    // --------------------------------------------------

    const normalizedRotation =
        Math.abs(
            ((car.rotation + Math.PI)
            % (Math.PI * 2))
            - Math.PI
        );


    if (
        !car.grounded &&
        normalizedRotation > 2.4
    ) {

        endGame();

    }


    // Fell into world

    if (car.y > 800) {

        endGame();

    }


    // World end

    if (car.x >= WORLD_WIDTH) {

        endGame();

    }

}


// ------------------------------------------------------
// COIN COLLISION
// ------------------------------------------------------

function checkCoins() {

    for (const coin of coinList) {

        if (coin.collected) {

            continue;

        }


        const dx =
            car.x - coin.x;

        const dy =
            car.y - coin.y;


        const distanceBetween =
            Math.sqrt(
                dx * dx +
                dy * dy
            );


        if (distanceBetween < 65) {

            coin.collected = true;

            coins++;

            score += 100;

        }

    }

}


// ------------------------------------------------------
// FUEL COLLISION
// ------------------------------------------------------

function checkFuel() {

    for (const fuelCan of fuelList) {

        if (fuelCan.collected) {

            continue;

        }


        const dx =
            car.x - fuelCan.x;

        const dy =
            car.y - fuelCan.y;


        const distanceBetween =
            Math.sqrt(
                dx * dx +
                dy * dy
            );


        if (distanceBetween < 70) {

            fuelCan.collected = true;

            fuel += 30;


            if (fuel > 100) {

                fuel = 100;

            }

        }

    }

}


// ------------------------------------------------------
// DRAW SKY
// ------------------------------------------------------

function drawSky() {

    const gradient =
        ctx.createLinearGradient(
            0,
            0,
            0,
            canvas.height
        );


    gradient.addColorStop(
        0,
        "#58b9ed"
    );


    gradient.addColorStop(
        1,
        "#d9f3ff"
    );


    ctx.fillStyle =
        gradient;

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // Sun

    ctx.beginPath();

    ctx.arc(
        1000,
        100,
        55,
        0,
        Math.PI * 2
    );

    ctx.fillStyle =
        "#ffd54a";

    ctx.fill();


    // Clouds

    drawCloud(
        200 - cameraX * 0.1,
        100
    );

    drawCloud(
        650 - cameraX * 0.1,
        150
    );

    drawCloud(
        1050 - cameraX * 0.1,
        80
    );

}


// ------------------------------------------------------
// CLOUD
// ------------------------------------------------------

function drawCloud(x, y) {

    ctx.fillStyle =
        "rgba(255,255,255,0.75)";


    ctx.beginPath();

    ctx.arc(
        x,
        y,
        25,
        0,
        Math.PI * 2
    );

    ctx.arc(
        x + 30,
        y - 10,
        35,
        0,
        Math.PI * 2
    );

    ctx.arc(
        x + 65,
        y,
        25,
        0,
        Math.PI * 2
    );

    ctx.fill();

}


// ------------------------------------------------------
// DRAW MOUNTAINS
// ------------------------------------------------------

function drawBackgroundMountains() {

    ctx.fillStyle =
        "#7aa6a8";


    ctx.beginPath();

    ctx.moveTo(
        0,
        450
    );


    for (
        let x = 0;
        x <= canvas.width;
        x += 20
    ) {

        const worldX =
            x + cameraX * 0.25;

        const y =
            350 +
            Math.sin(worldX * 0.004)
            * 70;

        ctx.lineTo(
            x,
            y
        );

    }


    ctx.lineTo(
        canvas.width,
        canvas.height
    );

    ctx.lineTo(
        0,
        canvas.height
    );

    ctx.closePath();

    ctx.fill();

}


// ------------------------------------------------------
// DRAW TERRAIN
// ------------------------------------------------------

function drawTerrain() {

    ctx.beginPath();

    ctx.moveTo(
        0,
        canvas.height
    );


    for (
        let screenX = 0;
        screenX <= canvas.width;
        screenX += 5
    ) {

        const worldX =
            screenX + cameraX;

        const y =
            terrainHeight(worldX);

        ctx.lineTo(
            screenX,
            y
        );

    }


    ctx.lineTo(
        canvas.width,
        canvas.height
    );


    ctx.closePath();


    // Dirt

    ctx.fillStyle =
        "#9b642f";

    ctx.fill();


    // Grass line

    ctx.beginPath();


    for (
        let screenX = 0;
        screenX <= canvas.width;
        screenX += 5
    ) {

        const worldX =
            screenX + cameraX;

        const y =
            terrainHeight(worldX);

        if (screenX === 0) {

            ctx.moveTo(
                screenX,
                y
            );

        }

        else {

            ctx.lineTo(
                screenX,
                y
            );

        }

    }


    ctx.strokeStyle =
        "#3d8b42";

    ctx.lineWidth = 12;

    ctx.stroke();


    // Grass details

    ctx.strokeStyle =
        "#72b947";

    ctx.lineWidth = 3;


    for (
        let screenX = 0;
        screenX < canvas.width;
        screenX += 35
    ) {

        const worldX =
            screenX + cameraX;

        const y =
            terrainHeight(worldX);


        ctx.beginPath();

        ctx.moveTo(
            screenX,
            y
        );

        ctx.lineTo(
            screenX + 4,
            y - 10
        );

        ctx.stroke();

    }

}


// ------------------------------------------------------
// DRAW COINS
// ------------------------------------------------------

function drawCoins() {

    for (const coin of coinList) {

        if (coin.collected) {

            continue;

        }


        const screenX =
            coin.x - cameraX;


        if (
            screenX < -50 ||
            screenX > canvas.width + 50
        ) {

            continue;

        }


        ctx.beginPath();

        ctx.arc(
            screenX,
            coin.y,
            coin.radius,
            0,
            Math.PI * 2
        );


        ctx.fillStyle =
            "#ffd700";

        ctx.fill();


        ctx.strokeStyle =
            "#b8860b";

        ctx.lineWidth = 3;

        ctx.stroke();


        ctx.fillStyle =
            "#8b6508";

        ctx.font =
            "bold 16px Arial";

        ctx.textAlign =
            "center";

        ctx.textBaseline =
            "middle";

        ctx.fillText(
            "$",
            screenX,
            coin.y
        );

    }

}


// ------------------------------------------------------
// DRAW FUEL
// ------------------------------------------------------

function drawFuel() {

    for (const fuelCan of fuelList) {

        if (fuelCan.collected) {

            continue;

        }


        const screenX =
            fuelCan.x - cameraX;


        if (
            screenX < -50 ||
            screenX > canvas.width + 50
        ) {

            continue;

        }


        ctx.fillStyle =
            "#e53935";


        ctx.fillRect(
            screenX - 12,
            fuelCan.y - 17,
            24,
            34
        );


        ctx.fillStyle =
            "#ffffff";


        ctx.font =
            "bold 18px Arial";

        ctx.textAlign =
            "center";

        ctx.textBaseline =
            "middle";


        ctx.fillText(
            "F",
            screenX,
            fuelCan.y
        );


        ctx.fillStyle =
            "#555";


        ctx.fillRect(
            screenX - 7,
            fuelCan.y - 25,
            14,
            8
        );

    }

}


// ------------------------------------------------------
// DRAW CAR
// ------------------------------------------------------

function drawCar() {

    const screenX =
        car.x - cameraX;


    ctx.save();


    ctx.translate(
        screenX,
        car.y
    );


    ctx.rotate(
        car.rotation
    );


    // Car shadow

    ctx.fillStyle =
        "rgba(0,0,0,0.2)";


    ctx.fillRect(
        -42,
        22,
        84,
        8
    );


    // Main car body

    ctx.fillStyle =
        "#e53935";


    ctx.beginPath();

    ctx.roundRect(
        -45,
        -20,
        90,
        35,
        8
    );

    ctx.fill();


    // Hood

    ctx.fillStyle =
        "#c62828";


    ctx.fillRect(
        20,
        -15,
        28,
        20
    );


    // Cabin

    ctx.fillStyle =
        "#ef5350";


    ctx.beginPath();

    ctx.moveTo(
        -25,
        -20
    );

    ctx.lineTo(
        -10,
        -43
    );

    ctx.lineTo(
        20,
        -43
    );

    ctx.lineTo(
        35,
        -20
    );

    ctx.closePath();

    ctx.fill();


    // Windows

    ctx.fillStyle =
        "#b3e5fc";


    ctx.beginPath();

    ctx.moveTo(
        -8,
        -37
    );

    ctx.lineTo(
        4,
        -37
    );

    ctx.lineTo(
        4,
        -23
    );

    ctx.lineTo(
        -18,
        -23
    );

    ctx.closePath();

    ctx.fill();


    ctx.beginPath();

    ctx.moveTo(
        8,
        -37
    );

    ctx.lineTo(
        18,
        -37
    );

    ctx.lineTo(
        28,
        -23
    );

    ctx.lineTo(
        8,
        -23
    );

    ctx.closePath();

    ctx.fill();


    // Wheels

    drawWheel(
        backWheel.offsetX,
        backWheel.offsetY
    );


    drawWheel(
        frontWheel.offsetX,
        frontWheel.offsetY
    );


    ctx.restore();

}


// ------------------------------------------------------
// DRAW WHEEL
// ------------------------------------------------------

function drawWheel(x, y) {

    ctx.beginPath();

    ctx.arc(
        x,
        y,
        car.wheelRadius,
        0,
        Math.PI * 2
    );


    ctx.fillStyle =
        "#202020";

    ctx.fill();


    ctx.beginPath();

    ctx.arc(
        x,
        y,
        7,
        0,
        Math.PI * 2
    );


    ctx.fillStyle =
        "#aaaaaa";

    ctx.fill();

}


// ------------------------------------------------------
// DRAW DISTANCE MARKERS
// ------------------------------------------------------

function drawDistanceMarkers() {

    const start =
        Math.floor(cameraX / 500) * 500;


    for (
        let x = start;
        x < cameraX + canvas.width;
        x += 500
    ) {

        if (x < 0) {

            continue;

        }


        const screenX =
            x - cameraX;


        const ground =
            terrainHeight(x);


        ctx.fillStyle =
            "#ffffff";


        ctx.font =
            "bold 14px Arial";


        ctx.textAlign =
            "center";


        ctx.fillText(
            Math.floor((x - 200) / 10)
            + "m",
            screenX,
            ground - 15
        );

    }

}


// ------------------------------------------------------
// DRAW EVERYTHING
// ------------------------------------------------------

function draw() {

    drawSky();

    drawBackgroundMountains();

    drawDistanceMarkers();

    drawTerrain();

    drawCoins();

    drawFuel();

    drawCar();

}


// ------------------------------------------------------
// GAME LOOP
// ------------------------------------------------------

function gameLoop(timestamp) {

    if (!gameRunning) {

        draw();

        return;

    }


    let delta =
        (timestamp - lastTime) / 1000;


    lastTime = timestamp;


    // Prevent giant time jumps

    if (delta > 0.05) {

        delta = 0.05;

    }


    updateCar(delta);

    checkCoins();

    checkFuel();

    updateUI();

    draw();


    if (gameRunning) {

        requestAnimationFrame(
            gameLoop
        );

    }

}


// ------------------------------------------------------
// BUTTONS
// ------------------------------------------------------

startButton.addEventListener(
    "click",
    startGame
);


restartButton.addEventListener(
    "click",
    startGame
);


// ------------------------------------------------------
// INITIAL DRAW
// ------------------------------------------------------

resetGame();

draw();
