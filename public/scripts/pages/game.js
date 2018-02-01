function game(){
	var myId = parseInt($("#user-id").val());
	
	var socket = io("/game");
	
	//update game handler
	socket.on("updateGame", function (game) {
		console.log("it's player "+game.playerTurn+" turn");
		
		console.log(game);
		
		$("#game-map").empty();
		
		//generate the game map
		game.gameMap.forEach(function (row, rowIndex){
			var tr = $("<tr>");
			
			row.forEach(function (value, colIndex){
				tr.append($("<td>", {
					class: rowIndex+"-"+colIndex,
					text: mapCellValue(value),
					click: makeMove
				}));
			});
			
			$("#game-map").append(tr);
		});
	});
	
	/**
	 * Maps the gameMap value to the correct symbol or image
	 * @param {Number} value
	 * @returns {String}
	 */
	function mapCellValue(value){
		if(value === myId){
			return "X";
		}else if(value === 0){
			return "";
		}else{
			return "O";
		}
	}
	
	/**
	 * Sends the makeMove event passing the coordinates of the selected cell
	 */
	function makeMove(){
		var cell = $(this).attr("class");
		socket.emit("makeMove", cell);
	}
	
}