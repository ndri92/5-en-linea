class Player {
  constructor(color) {
    this.color = color;
    this.turn = false;
    this.time = 15;
  }

  setTurn(turn) {
    this.currentTurn = turn;
    this.time = 15;
    const message = turn ? "Es tu turno" : "Espera a tu oponente";
    $("#turn").text(message);
  }

  getColor() {
    return this.color;
  }

  getTime() {
    return this.time;
  }

  getTurn() {
    return this.currentTurn;
  }
}
