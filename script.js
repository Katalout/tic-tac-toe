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
    return { getValue, addToken }
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
        announceTurn();
    }

    function playRound(row, column) {
        if (board.placeToken(row, column, activePlayer.token)) {
            let logger = `Placed ${getActivePlayer().name}'s token:${getActivePlayer().token} to cell ${row}/${column}.`;
            console.log(logger);
            board.setLogger(logger);

            function checkWin() {
                let tie;

                const boardWithCellValues = function () {
                    return board.getBoard().map((row) => row.map((cell) => cell.getValue()));
                };

                const transpose = function (grid) {
                    return grid[0].map(
                        (_, c) => grid.map(
                            row => row[c]
                        )
                    )
                };

                const atlok = function () {
                    let arrayofatlok = [];
                    let board = boardWithCellValues();
                    arrayofatlok.push([board[0][0], board[1][1], board[2][2]], [board[0][2], board[1][1], board[2][0]]);
                    return arrayofatlok;
                };
                function gameOver(winner) {
                    if (winner === "tie") { logger = "Game over! It's a tie!" };
                    if (winner === players[0] || winner === players[1]) { logger = `Game over! Winner is ${winner.name}, (${winner.token})!`; };
                    console.log(logger);
                    board.setLogger(logger);
                    return true;
                };

                const switched = transpose(boardWithCellValues());
                const boardRowsColumns = switched.concat(boardWithCellValues(), atlok());
                //akkor most ezt add hozzá i guess? hogy sporoljunk?

                const boardToStrings = boardRowsColumns
                    .map((row) => row.join(""));
                let end = false;
                function stringCheck(condition) {
                    let filtered = boardToStrings.filter((string) => string.includes(condition));
                    return filtered.length;
                };
                //na mit csinaljon ez a funkcio??
                //nezze meg hogy a boardtostringsben van-e xxx, ha nincs akk nezze meg h van e ooo, ha nincs nezze meg h van e _
                //nem biztos hogy le tudom röviditeni, nem biztos h kell.
                if (!stringCheck("_")) end = "tie";
                if (stringCheck("XXX")) end = players[0];
                if (stringCheck("OOO")) end = players[1];

                /* if (boardToStrings.filter((string) => string.includes("_")).length === 0) end = "tie";

                if (boardToStrings.filter((string) => string.includes("XXX")).length > 0) end = players[0];

                if (boardToStrings.filter((string) => string.includes("OOO")).length > 0) end = players[1]; */

                if (end) return gameOver(end);
                else return false;
            }

            if (!checkWin()) {
                switchPlayer();
                announceTurn();
            }

        }
    }

    announceTurn();
    return { playRound, getActivePlayer, resetGame, getBoard: board.getBoard, getLogger: board.getLogger }
}

function UIcontroller() {
    const game = GameController("Emez", "Amaz");
    const texth1 = document.querySelector(".text");
    const loggerp = document.querySelector(".logger");
    const boardDiv = document.querySelector(".board");

    const updateText = (text) => texth1.textContent = text;

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
            button.textContent = cell.getValue();
            boardDiv.appendChild(button);
        }))

    }
    function clicker(event) {
        event.stopPropagation();
        let button = event.target;
        if (!button.dataset.row) return;
        game.playRound(button.dataset.row, button.dataset.column);
        updateScreen();
    }
    boardDiv.addEventListener("click", clicker);
    updateScreen();
    return { updateText }
}
UIcontroller();