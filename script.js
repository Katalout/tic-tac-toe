"use strict"

console.log("hello");

/*
 ** The Gameboard represents the state of the board
 ** Each equare holds a Cell (defined later)
 ** and we expose a drawToken method to be able to add Cells to squares
 */

function Gameboard() {
    const rows = 3;
    const columns = 3;
    const board = [];

    // Create a 2d array that will represent the state of the game board
    // For this 2d array, row 0 will represent the top row and
    // column 0 will represent the left-most column.
    // This nested-loop technique is a simple and common way to create a 2d array.
    for (let i = 0; i < rows; i++) {
        board[i] = [];
        for (let j = 0; j < columns; j++) {
            board[i].push(Cell());
        }
    }

    // This will be the method of getting the entire board that our
    // UI will eventually need to render it.
    const getBoard = () => board;


    const drawToken = (row, column, playertoken) => {
        if (board[row][column].getValue() === "_") {
            board[row][column].addToken(playertoken);
            return true;
        } else {
            console.log("--not valid cell, try again--");
            return false;
        }
    };

    // This method will be used to print our board to the console.
    // It is helpful to see what the board looks like after each turn as we play,
    // but we won't need it after we build our UI
    const printBoard = () => {
        const boardWithCellValues = board.map((row) =>
            row.map((cell) => cell.getValue())
        );
        console.log(boardWithCellValues);
    };

    // Here, we provide an interface for the rest of our
    // application to interact with the board
    return { getBoard, drawToken, printBoard };
}

/*
 ** A Cell represents one "square" on the board and can have one of
 ** 0: no token is in the square,
 ** 1: Player One's token,
 ** 2: Player 2's token
 */

function Cell() {
    let value = "_";

    // Accept a player's token to change the value of the cell
    const addToken = (player) => {
        value = player;
    };

    // How we will retrieve the current value of this cell through closure
    const getValue = () => value;

    return {
        addToken,
        getValue,
    };
}

/*
 ** The GameController will be responsible for controlling the
 ** flow and state of the game's turns, as well as whether
 ** anybody has won the game
 */
function GameController(
    playerOneName = "Player One",
    playerTwoName = "Player Two"
) {
    const board = Gameboard();

    const players = [
        {
            name: playerOneName,
            token: "X",
        },
        {
            name: playerTwoName,
            token: "O",
        },
    ];

    let activePlayer = players[0];

    const switchPlayerTurn = () => {
        activePlayer = activePlayer === players[0] ? players[1] : players[0];
    };
    const getActivePlayer = () => activePlayer;

    const printNewRound = () => {
        board.printBoard();
        console.log(`${getActivePlayer().name}'s turn.`);
    };

    const playRound = (row, column) => {
        if (board.drawToken(row, column, getActivePlayer().token) === true) {
            // Drop a token for the current player
            console.log(
                `Drawing ${getActivePlayer().name}'s ${getActivePlayer().token} into:\nrow: ${row}\ncolumn: ${column}`
            );

            /*  This is where we would check for a winner and handle that logic,
                  such as a win message. */
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
                    console.log("Game over! Winner is Player One!");
                    return true;
                }
                else if (threeO) {
                    console.log("Game over! Winner is Player Two!");
                    return true;
                }
                else if (tie) {
                    console.log("Game over! It's a tie!");
                    return true;
                }
                else return false;
            };

            if (!checkWin()) {
                switchPlayerTurn();
                printNewRound()
            }
        }
        else console.log(`${getActivePlayer().name}'s turn.`);
    };

    // Initial play game message
    printNewRound();

    // For the console version, we will only use playRound, but we will need
    // getActivePlayer for the UI version, so I'm revealing it now
    return {
        playRound,
        getActivePlayer,
    };
}

const game = GameController();
