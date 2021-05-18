const PORT = process.env.PORT || 3977;
const socket = io.connect(`https://xubio.herokuapp.com:${PORT}`);
var player, game;

init = () => {
  const p1Color = "white";
  const p2Color = "black";

  $("#new").on("click", () => {
    player = new Player(p1Color);
    socket.emit("create");
  });

  $("#join").on("click", () => {
    const room = $("#room").val();

    if (!room) {
      alert("Ingresa el ID de la partida");
      return;
    }
    player = new Player(p2Color);
    socket.emit("join", { room: room });
  });

  $("#return").on("click", () => {
    var text = $("#roomID").text();
    var room = text.slice(12, 16);

    socket.emit("remove", { room: room });
    location.reload();
  });

  socket.on("newGame", (data) => {
    const message = "Partida ID: " + data.room;

    game = new Game(data.room);
    game.displayBoard(message);
  });

  socket.on("playerOne", () => {
    player.setTurn(false);
  });

  socket.on("playerTwo", (data) => {
    const message = "Partida ID: " + data.room;

    game = new Game(data.room);
    game.displayBoard(message);
    player.setTurn(true);
  });

  socket.on("turnPlayed", (data) => {
    let row = game.getRow(data.tile);
    let col = game.getCol(data.tile);

    const opponentColor = player.getColor() === p1Color ? p2Color : p1Color;
    game.updateBoard(opponentColor, row, col, data.tile);
    player.setTurn(true);
  });

  socket.on("endGame", (data) => {
    game.endGameMessage(data.message);
  });

  socket.on("err", (data) => {
    alert(data.message);
    location.reload();
  });

  socket.on("userDisconnect", () => {
    game.disconnected();
  });
};

init();
