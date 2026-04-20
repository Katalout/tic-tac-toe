"use strict"

console.log("hello this is the _not_ stolen version, here we go");

function Gameboard() {
    const rows = 3;
    const columns = 3;
    const board = [];
    let logger = "";

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
            logger = "";
            return true;
        }
        else {
            console.log("Invalid move, try again");
            logger = "Invalid move, try again";
            return false;
        }
    }
    const resetBoard = function () {
        board.forEach((row) => row.forEach((cell) => cell.addToken("_")))
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
    const setwinner = () => winner = !winner;
    const getwinner = () => winner;
    return { getValue, addToken, getwinner, setwinner }
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
        console.log(`It is ${getActivePlayer().name}'s turn. (${getActivePlayer().token})`)
    }

    function resetGame() {
        console.log("Resetting game..");
        board.resetBoard();
        activePlayer = players[0];
        gameEnd = false;
        board.setLogger("");
        console.log(board.getLogger());
        announceTurn();
    }

    const getGameEnd = () => gameEnd;
    function playRound(row, column) {
        if (board.placeToken(row, column, activePlayer.token)) {
            let logger = `Placed ${getActivePlayer().name}'s token:${getActivePlayer().token} to cell ${row}/${column}.`;
            console.log(logger);
            board.setLogger(logger);
            let playedCell = board.getBoard()[row][column];
            console.log(playedCell);

            function checkWin() {
                const boardWithCellValues = function () {
                    return board.getBoard().map((row) => row.map((cell) => cell.getValue()));
                };
                const boardToStrings = boardWithCellValues().map((row) => row.join(""));

                let end = false;

                //tehat kell egy array of arrays: [[sor],[oszlop],[atlo],[atlo]]. Ezt findolja a transformok utan hmm.

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

                // megvan a winner sor, akor hogy kene kiemelnii
                if (winningProof) {
                    winningProof.forEach((cell) => cell.setwinner());
                    end = activePlayer;
                };
                // nah sikerült kiemelni a nyertest, akkor most egyszerüsiteni kene a nyerest erre.

                function gameOver(winner) {
                    if (winner === "tie") { logger = "Game over! It's a tie!" }
                    else { logger = `Game over! Winner is ${winner.name} (${winner.token})!`; };
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
    const texth1 = document.querySelector(".text");
    const loggerp = document.querySelector(".logger");
    const boardDiv = document.querySelector(".board");
    const resetButton = document.querySelector(".reset");
    let resetted = false;

    function updateScreen() {
        boardDiv.innerHTML = "";
        const board = game.getBoard();
        let activePlayer = game.getActivePlayer();
        texth1.innerHTML = `It is ${activePlayer.name}'s turn.<br />Please click a square to place your (${activePlayer.token}).`;
        loggerp.textContent = game.getLogger();
        board.forEach((row, rowindex) => row.forEach((cell, columnindex) => {
            let button = document.createElement("button");
            button.classList.add("cell");
            button.dataset.column = columnindex;
            button.dataset.row = rowindex;
            button.textContent = (cell.getValue() === "_") ? "" : cell.getValue();
            if (cell.getwinner()) button.classList.add("winner");
            boardDiv.appendChild(button);
        }))

    }
    function clickCell(event) {
        event.stopPropagation();
        if (game.getGameEnd()) {
            showDialogGO();
            return
        }; // ide lehetne pakolni meg funkciokat h mi törtenjen ha vege.
        let button = event.target;
        if (!button.dataset.row) return;
        game.playRound(button.dataset.row, button.dataset.column);
        if (game.getGameEnd()) {
            showDialogGO();
        };
        updateScreen();
    }

    function showDialogGO() {
        const dialogGO = document.getElementById("gameover");
        const h2 = dialogGO.querySelector("h2");
        const cancel = document.getElementById("cancel");
        const reset = document.getElementById("reset");
        cancel.addEventListener("click", () => {
            dialogGO.close()
        });
        reset.addEventListener("click", () => {
            clickReset();
            dialogGO.close();
        });
        h2.textContent = game.getLogger();
        console.log(game.getLogger());
        dialogGO.showModal();
    };

    function showDialogStart() {
        if (resetted) console.log("clicked bitch");
        resetted = false;
        const startDialog = document.getElementById("start");
        const player1 = document.getElementById("player1");
        const player2 = document.getElementById("player2");
        const buttons = startDialog.querySelectorAll(".submit,.cancel");
        console.log(buttons);
        buttons.forEach((button) => button.addEventListener("click", (event) => {
            event.stopPropagation();
            event.stopImmediatePropagation();
            console.log(event);
            console.log(event.target);
            if (event.target.className == "submit") {
                game = GameController(player1.value, player2.value)
            }
            else { game = GameController("Emez", "Amaz") }
            startDialog.close();
            updateScreen();
        }));
        // check if fields are filled? meh
        // hmmm almost same dialog to pop up in the beginning, then upon clicking reset?
        //begin w if check: if clicked, then this. if just popped, then that hmm. 

        // winning conditions rework: i dont need to check the whole table for xxx/ooo, just the rows/atlos of the latest move. this way the winning 3 cells could be highlighteddd hmmm
        startDialog.showModal();
    };

    function clickReset() {
        if (!game) return;
        else {
            game.resetGame();
            updateScreen();
            resetted = true;
        }
    };
    boardDiv.addEventListener("click", clickCell);

    resetButton.addEventListener("click", () => {
        clickReset();
        showDialogStart();
    });
    showDialogStart();
    /* updateScreen(); */
}
UIcontroller();

//mit kéne még?
// input names dialog
// dialogs softclose
//ne ugy nezzen ki mint a hanyas