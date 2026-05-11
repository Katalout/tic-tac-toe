"use strict"

function Gameboard() {
    const rows = 3;
    const columns = 3;
    const board = [];
    let logger = " ";

    for (let i = 0; i < rows; i++) {
        let row = [];
        for (let j = 0; j < columns; j++) {
            row.push(Cell());
        }
        board.push(row);
    }

    const getBoard = () => board;

    const printBoard = () => {
        let boardDisplay = board.map((row) => row.map((cell) => cell.getValue()));
        console.log(boardDisplay);
    }

    const placeToken = function (row, column, token) {
        const targetCell = board[row][column];
        if (targetCell.getValue() === "_") {
            targetCell.addToken(token);
            logger = " ";
            return true;
        }
        else {
            console.log("Invalid move, try again");
            logger = "// I should have clarified..<br />Click an <em>empty</em> square.";
            return false;
        }
    }
    const resetBoard = function () {
        board.forEach((row) => row.forEach((cell) => {
            cell.addToken("_");
            cell.setWinner(false);
        }
        ))
    };
    const getLogger = () => logger;
    const setLogger = (text) => logger = text;

    return { getBoard, printBoard, placeToken, resetBoard, getLogger, setLogger }

}

function Cell() {
    let value = "_";
    const getValue = () => value;
    const addToken = function (token) {
        value = token;
    };
    let winner = false;
    const setWinner = (text) => winner = text;
    const getWinner = () => winner;
    return { getValue, addToken, getWinner, setWinner }
}

function GameController(
    player1 = "Player1",
    player2 = "Player2") {

    const board = Gameboard();

    const players = [{
        name: player1,
        token: "X"
    }, {
        name: player2,
        token: "O"
    }];

    let gameEnd = false;

    let activePlayer = players[0];

    function switchPlayer() {
        activePlayer = activePlayer === players[0] ? players[1] : players[0];
    }
    const getActivePlayer = () => activePlayer;

    function announceTurn() {
        board.printBoard();
        console.log(`${getActivePlayer().name}'s turn. (${getActivePlayer().token})`)
    }

    function resetGame() {
        console.log("Resetting game..");
        board.resetBoard();
        activePlayer = players[0];
        gameEnd = false;
        board.setLogger(" ");
        console.log(board.getLogger());
        announceTurn();
    }

    const getGameEnd = () => gameEnd;
    function playRound(row, column) {
        if (board.placeToken(row, column, activePlayer.token)) {
            let logger;
            let playedCell = board.getBoard()[row][column];

            function checkWin() {
                const boardWithCellValues = function () {
                    return board.getBoard().map((row) => row.map((cell) => cell.getValue()));
                };
                const boardToStrings = boardWithCellValues().map((row) => row.join(""));

                let end = false;

                function getThoseThrees() {
                    let table = board.getBoard();
                    let currentRow = table[row];
                    let currentColumn = table.map((row) => row[column]);
                    let diagonals = [[table[0][0], table[1][1], table[2][2]], [table[0][2], table[1][1], table[2][0]]];
                    let thoseThrees = [];
                    thoseThrees.push(currentRow, currentColumn);
                    thoseThrees = thoseThrees.concat(diagonals);
                    return thoseThrees;
                }

                let winningProof = getThoseThrees().find((array) => {
                    let values = array.map((cell) => cell.getValue());
                    let string = values.join("");
                    let x = playedCell.getValue();
                    return string == (x + x + x);
                });

                function gameOver(winner) {
                    if (winner === "tie") { logger = "// It's a tie!" }
                    else { logger = `Winner is ${winner.name}!`; };
                    /* logger += " Press 'reset game' to start a new game." */
                    console.log(logger);
                    board.setLogger(logger);
                    return true;
                };

                function checkForTie() {
                    let emptyCells = boardToStrings.filter((string) => string.includes("_"));
                    return emptyCells.length == 0;
                };

                if (checkForTie()) end = "tie";
                if (winningProof) {
                    winningProof.forEach((cell) => cell.setWinner(true));
                    end = activePlayer;
                };
                if (end) return gameOver(end);
                else return false;
            }

            if (!checkWin()) {
                switchPlayer();
                announceTurn();
            }
            else gameEnd = true;
        }
    }

    announceTurn();
    return { playRound, getActivePlayer, resetGame, getBoard: board.getBoard, getLogger: board.getLogger, setLogger: board.setLogger, getGameEnd }
}

function UIcontroller() {
    let game;
    const texth2 = document.querySelector(".text");
    const loggerp = document.querySelector(".logger");
    const boardDiv = document.querySelector(".board");
    const resetButton = document.querySelector(".reset");
    let latest;

    function updateScreen() {
        boardDiv.innerHTML = "";
        const board = game.getBoard();
        let activePlayer = game.getActivePlayer();
        function updateText() {
            texth2.innerHTML = (game.getGameEnd()) ? "GAME OVER BEACHES" : `${activePlayer.name}'s turn.<br />Click a square to place an ${activePlayer.token}.`;
            loggerp.innerHTML = game.getLogger();
            if (game.getGameEnd()) {
                texth2.classList.add("fancy");
                loggerp.classList.add("fancy");
            } else {
                texth2.classList.remove("fancy");
                loggerp.classList.remove("fancy");
            }
        };

        board.forEach((row, rowindex) => row.forEach((cell, columnindex) => {
            let button = document.createElement("button");
            button.classList.add("cell");
            button.dataset.row = rowindex;
            button.dataset.column = columnindex;
            button.dataset.index = rowindex * 3 + columnindex;
            /* button.textContent = (cell.getValue() === "_") ? "" : cell.getValue(); */
            // button.innerHtml-> svg i guess?
            if (cell.getValue() === "_") button.innerHTML = "";
            if (cell.getValue() === "X") button.innerHTML = `<svg class="x" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink"
      xmlns:svgjs="http://svgjs.dev/svgjs" viewBox="330 140 140 120" width="50">
      <path class="first"
        d="M237.2197265625,101.34529113769531C237.2197265625,101.34529113769531,258.744384765625,121.07623291015625,258.744384765625,121.07623291015625C258.744384765625,121.07623291015625,282.95965576171875,139.91030883789062,282.95965576171875,139.91030883789062C282.95965576171875,139.91030883789062,304.48431396484375,161.4349822998047,304.48431396484375,161.4349822998047C304.48431396484375,161.4349822998047,320.6278076171875,177.57847595214844,320.6278076171875,177.57847595214844C320.6278076171875,177.57847595214844,334.0807189941406,191.03138732910156,334.0807189941406,191.03138732910156C334.0807189941406,191.03138732910156,350.2242126464844,204.4842987060547,350.2242126464844,204.4842987060547"
        fill="none" stroke-width="9" stroke="black" stroke-linecap="round" stroke-dasharray="0 0"
        transform="matrix(1,0,0,1,106.27803039550781,47.085205078125)"></path>
      <path class="second"
        d="M453.36322021484375,130.0448455810547C446.41255249023436,136.71748962402344,446.2331842041016,138.2242109680176,430.94171142578125,151.5695037841797C415.6502386474609,164.9147966003418,419.0493472290039,160.02691284179687,404.035888671875,173.09417724609375C389.0224301147461,186.16144165039063,395.5784643554687,179.5426010131836,382.5111999511719,193.7219696044922C369.443935546875,207.90133819580078,374.95068725585935,207.15694412231446,361.8834228515625,218.83407592773438C348.81615844726565,230.5112077331543,347.03138763427734,227.49775787353516,340.3587341308594,231.39013671875"
        fill="none" stroke-width="9" stroke="black" stroke-linecap="round"
        transform="matrix(1,0,0,1,3.1390228271484375,19.282508850097656)"></path>
    </svg>`;
            if (cell.getValue() === "O") button.innerHTML = `<svg class="o" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink"
      xmlns:svgjs="http://svgjs.dev/svgjs" viewBox="170 170 200 190" width="50">
      <path
        d="M299.6073303222656,182.19895935058594C289.3979085286458,178.66492716471353,282.32984924316406,176.30889638264975,268.97906494140625,179.84292602539062C255.62828063964844,183.3769556681315,232.85341135660806,191.23036193847656,219.50262451171875,203.40313720703125C206.15183766682944,215.57591247558594,192.8010457356771,236.78010050455728,188.8743438720703,252.87957763671875C184.94764200846353,268.9790547688802,190.05236053466797,286.38743591308594,195.94241333007812,300C201.83246612548828,313.61256408691406,212.43455505371094,326.3088887532552,224.21466064453125,334.5549621582031C235.99476623535156,342.80103556315106,250.9162394205729,348.952875773112,266.623046875,349.4764404296875C282.32985432942706,350.000005086263,304.71205139160156,344.76441446940106,318.45550537109375,337.69635009765625C332.19895935058594,330.62828572591144,342.93194071451825,323.1675338745117,349.0837707519531,307.06805419921875C355.235600789388,290.9685745239258,358.5078481038411,258.7696278889974,355.3664855957031,241.09947204589844C352.2251230875651,223.42931620279947,339.52878824869794,210.8638712565104,330.235595703125,201.047119140625C320.94240315755206,191.2303670247396,309.81675211588544,185.73299153645834,299.6073303222656,182.19895935058594C289.3979085286458,178.66492716471353,282.32984924316406,176.30889638264975,268.97906494140625,179.84292602539062"
        fill="none" stroke-width="11" stroke="black"></path>
    </svg>`;
            button.classList.add(cell.getValue());
            if (cell.getWinner()) button.classList.add("winner");
            boardDiv.appendChild(button);
        }));
        if (latest) {
            boardDiv.querySelector("[data-index='" + latest + "']").classList.add("latest");
            setTimeout(updateText, 600);
        }
        else updateText();
    }

    function clickCell(event) {
        event.stopPropagation();
        if (game.getGameEnd()) return;
        let button = event.target;
        if (!button.dataset.row) {
            button = event.target.closest("button");
            latest = false
        } else latest = button.dataset.index;
        game.playRound(button.dataset.row, button.dataset.column);
        updateScreen();
    }

    function showDialogStart() {
        const startDialog = document.getElementById("start");
        const player1 = document.getElementById("player1");
        const player2 = document.getElementById("player2");
        const button = startDialog.querySelector(".submit");
        button.addEventListener("click", (event) => {
            event.stopPropagation();
            event.stopImmediatePropagation();
            game = GameController(player1.value, player2.value);
            startDialog.close();
            updateScreen();
        });
        startDialog.showModal();
    };

    function clickReset() {
        if (!game) return;
        else {
            game.resetGame();
            latest = false;
            updateScreen();
        }
    };
    boardDiv.addEventListener("click", clickCell);

    resetButton.addEventListener("click", () => {
        clickReset();
        showDialogStart();
    });
    game = GameController();
    updateScreen();
    /* showDialogStart(); */
}
UIcontroller();

//animalni a nyereshirdetest
//kiirni h akarsz-e ujra jatcani
//animalni a lepesekett

// szinvalaszto?