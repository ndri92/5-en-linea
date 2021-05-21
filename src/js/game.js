var timer;

class Game {
  constructor(room) {
    this.room = room;
    this.board = [];
    this.moves = 0;
  }

  createGameBoard() {
    function clickHandler(e) {
      let row, col;

      row = game.getRow(e.target.id);
      col = game.getCol(e.target.id);

      if (!player.getTurn() || !game) {
        return;
      }

      $(".table").removeAttr("style");

      game.playTurn(e.target);
      game.updateBoard(player.getColor(), row, col, e.target.id);
      game.checkWinner();

      player.setTurn(false);
    }
    game.createTiles(clickHandler);
    if (player.getColor() != "white" && this.moves == 0) {
      game.setTimer();
    } else {
      $(".table").prop("disabled", true);
    }
  }

  createTiles(clickHandler) {
    for (let i = 0; i < 15; i++) {
      for (let j = 0; j < 14; j++) {
        $(".table").append(`<button class="tile" id="${i}_${j}"></button>`);
      }
      $(".table").append(
        `<button class="tile" id="${i}_14" style="float:none;"/>`
      );
    }

    for (let i = 0; i < 15; i++) {
      this.board.push([""]);
      for (let j = 0; j < 15; j++) {
        $(`#${i}_${j}`).on("click", clickHandler);
      }
    }
  }

  setTimer() {
    timer = setInterval(() => {
      var time = player.getTime();

      if (time == 7 || time == 5 || time <= 3) {
        $(".table")
          .css("background-color", "#d33473")
          .css("box-shadow", "0px 0px 30px 5px rgb(211 52 115 / 75%)");
      } else {
        $(".table").removeAttr("style");
      }

      --player.time;

      if (player.getTime() == 0) {
        let message;

        message = player.getColor() == "white" ? "black" : "white";

        socket.emit("end", {
          room: game.getRoom(),
          message: message,
        });

        game.endGameMessage(message);
        clearInterval(timer);
      }
    }, 1000);
  }

  displayBoard(message) {
    $(".room").css("display", "none");
    $("header").addClass("order");
    $("#return").css("display", "block");
    $("#logo").css("display", "none");
    $(".game").css("display", "block");
    $("#roomID").html(message);
    this.createGameBoard();
  }

  updateBoard(color, row, col, tile) {
    clearInterval(timer);
    $(".table").prop("disabled", true);
    if (!player.getTurn()) {
      game.setTimer();
      $(".table").prop("disabled", false);
    }
    $(`#${tile}`)
      .css("backgroundImage", `url(../image/${color}.png)`)
      .prop("disabled", true);
    this.board[row][col] = color[0];
    this.moves++;
  }

  getRow(id) {
    let row = id.split("_")[0];
    return row;
  }

  getCol(id) {
    let col = id.split("_")[1];
    return col;
  }

  getRoom() {
    return this.room;
  }

  playTurn(tile) {
    const clickedTile = $(tile).attr("id");

    socket.emit("turn", {
      tile: clickedTile,
      room: this.getRoom(),
    });
  }

  endGameMessage(message) {
    clearInterval(timer);
    $(".tile").attr("disabled", true);

    if (message == player.color) {
      message = "ganaste";
      printMessage();
    } else if (message.includes("desconectado")) {
      $("#turn").text(message);
    } else if (message.includes("Empate")) {
      message = "empate";
      printMessage();
    } else {
      message = "perdiste";
      printMessage();
    }

    function printMessage() {
      const value = message.split("");
      $("#turn").css("opacity", 0);

      value.forEach((e) => {
        $("#result").append(`<h1>${e}</h1>`);
      });
      $("#result").css("display", "flex");
    }
  }

  horizontal(color) {
    let value;
    for (let row = 0; row < 15; row++) {
      value = 0;
      for (let col = 0; col < 15; col++) {
        if (game.board[row][col] != color) {
          value = 0;
        } else {
          value++;
        }
        if (value == 5) {
          this.winner();
          return;
        }
      }
    }
  }

  vertical(color) {
    let value;
    for (let col = 0; col < 15; col++) {
      value = 0;
      for (let row = 0; row < 15; row++) {
        if (game.board[row][col] != color) {
          value = 0;
        } else {
          value++;
        }
        if (value == 5) {
          this.winner();
          return;
        }
      }
    }
  }

  diagonal(color) {
    for (let col = 0; col < 15; col++) {
      if (col > 4) {
        for (let row = 0; row < 10; row++) {
          let match = true;
          for (let i = 0; i < 5; i++) {
            if (color != game.board[row + i][col - i]) match = false;
          }

          if (match) {
            this.winner();
            return;
          }
        }
      }
    }
  }

  diagonalReverse(color) {
    for (let col = 0; col < 10; col++) {
      for (let row = 0; row < 10; row++) {
        let match = true;
        for (let i = 0; i < 5; i++) {
          if (color != game.board[row + i][col + i]) match = false;
        }
        if (match) {
          this.winner();
          return;
        }
      }
    }
  }

  checkWinner() {
    let color = player.getColor()[0];

    this.horizontal(color);
    this.vertical(color);
    this.diagonal(color);
    this.diagonalReverse(color);

    if (this.checkDraw()) {
      const message = "¡Empate!";

      socket.emit("end", {
        room: this.getRoom(),
        message: message,
      });
      this.endGameMessage(message);
    }
  }

  checkDraw() {
    return this.moves >= 15 * 15;
  }

  disconnected() {
    const message = "Jugador desconectado";

    socket.emit("end", {
      room: this.getRoom(),
      message: message,
    });
    this.endGameMessage(message);
  }

  winner() {
    const message = player.getColor();

    socket.emit("end", {
      room: this.getRoom(),
      message: message,
    });
    this.endGameMessage(message);
  }
}
