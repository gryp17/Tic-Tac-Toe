function game(){
	var socket = io("/game");
	
	//start game handler
	socket.on("startGame", function (playerId) {
		console.log("the game has started!");
		console.log("it's "+playerId+" turn");
	});
	
}