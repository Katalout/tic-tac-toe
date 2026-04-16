"use strict"

console.log("hello this is the _not_ stolen version, here we go");

function Gameboard() {
    const rows = 3;
    const columns = 3;
    const board = [];

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
            return true;
        }
        else {
            console.log("Invalid move, try again");
            return false;
        }
    }
    const resetBoard = function () {
        board.forEach((row) => row.forEach((cell) => cell.addToken("_")))
    };

    return { getBoard, printBoard, placeToken, resetBoard }

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
        console.log(`It is ${getActivePlayer().name}'s turn.`)
    }

    function resetGame() {
        console.log("Resetting game..");
        board.resetBoard();
        activePlayer = players[0];
        announceTurn();
    }

    function playRound(row, column) {
        if (board.placeToken(row, column, activePlayer.token)) {
            console.log(`Placing ${getActivePlayer().name}'s token:${getActivePlayer().token} to cell ${row}/${column}.`);

            function checkWin() {
                //3 in a row?
                let threeX = false;
                let threeO = false;
                let tie = false;

                const boardWithCellValues = function () { return board.getBoard().map((row) => row.map((cell) => cell.getValue())); };

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

                const switched = transpose(boardWithCellValues());
                const boardRowsColumns = switched.concat(boardWithCellValues(), atlok());
                //akkor most ezt add hozzá i guess? hogy sporoljunk?

                const boardToStrings = boardRowsColumns
                    .map((row) => row.join(""));

                if (boardToStrings.filter((string) => string.includes("_")).length === 0) tie = true;

                if (boardToStrings.filter((string) => string.includes("XXX")).length > 0) threeX = true;

                if (boardToStrings.filter((string) => string.includes("OOO")).length > 0) threeO = true;

                if (threeX) {
                    console.log(`Game over! Winner is ${players[0].name}!`);
                    return true;
                }
                else if (threeO) {
                    console.log(`Game over! Winner is ${players[1].name}!`);
                    return true;
                }
                else if (tie) {
                    console.log("Game over! It's a tie!");
                    return true;
                }
                else return false;
            }
            if (!checkWin()) {
                switchPlayer();
                announceTurn();
            }

        }
    }

    announceTurn();
    return { playRound, getActivePlayer, resetGame }
}
const game = GameController("Emez", "Amaz");
