var timer;

class Game {
  constructor(room) {
    this.room = room;
    this.board = [];
    this.moves = 0;
  }

  createGameBoard() {
    function clickHandler() {
      let row, col;

      row = game.getRow(this.id);
      col = game.getCol(this.id);

      if (!player.getTurn() || !game) {
        alert("Espera tu turno");
        return;
      }

      game.playTurn(this);
      game.updateBoard(player.getColor(), row, col, this.id);

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
        $(".table").append(
          `<button class="tile" id="button_${i}_${j}"></button>`
        );
      }
      $(".table").append(
        `<button class="tile" id="button_${i}_14" style="float:none;"/>`
      );
    }

    for (let i = 0; i < 15; i++) {
      this.board.push([""]);
      for (let j = 0; j < 15; j++) {
        $(`#button_${i}_${j}`).on("click", clickHandler);
      }
    }
  }

  setTimer() {
    $("#timer").text("Tiempo restante: " + player.getTime());

    timer = setInterval(() => {
      player.time--;
      $("#timer").text("Tiempo restante: " + player.getTime());
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
    $(".game").css("display", "block");
    $("#roomID").html(message);
    this.createGameBoard();
  }

  updateBoard(color, row, col, tile) {
    clearInterval(timer);
    $("#timer").text("Espera tu turno");
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
    let row;
    if (id.split("_")[1][1] != undefined) {
      row = id.split("_")[1][0] + id.split("_")[1][1];
    } else {
      row = id.split("_")[1][0];
    }
    return row;
  }

  getCol(id) {
    let col;
    if (id.split("_")[2][1] != undefined) {
      col = id.split("_")[2][0] + id.split("_")[2][1];
    } else {
      col = id.split("_")[2][0];
    }
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
      $("#timer").text("¡Ganaste!");
    } else if (message.includes("desconectado")) {
      $("#timer").text(message);
    } else if (message.includes("Empate")) {
      $("#timer").text(message);
    } else {
      $("#timer").text("¡Perdiste!");
    }
  }

  horizontal(color) {
    for (let row = 0; row < 15; row++) {
      let value = 0;
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
    for (let col = 0; col < 15; col++) {
      let value = 0;
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
    this.horizontal(player.getColor()[0]);
    this.vertical(player.getColor()[0]);
    this.diagonal(player.getColor()[0]);
    this.diagonalReverse(player.getColor()[0]);

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
