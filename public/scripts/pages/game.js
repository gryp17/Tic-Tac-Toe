function game() {
	var myId = parseInt($("#user-id").val());
	
	var playerTurnTimeout = 15; //seconds
	var playerTurnCounterInterval;

	var socket = io("/game");

	//update game handler
	socket.on("updateGame", function (game) {
		
		//clear any counter/countdowns
		clearInterval(playerTurnCounterInterval);

		$("#game-map").empty();

		//generate the game map
		game.gameMap.forEach(function (row, rowIndex) {
			var tr = $("<tr>");

			row.forEach(function (value, colIndex) {
				var td = $("<td>", {
					class: rowIndex + "-" + colIndex,
					click: makeMove
				});

				var img = mapCellValue(value);

				td.append(img);
				tr.append(td);
			});

			$("#game-map").append(tr);
		});


		$(".player-wrapper > .player").empty();
		$(".player-wrapper > .player").removeClass("tada");
		$(".player-wrapper > .counter").remove();

		//generate the players elements
		$(".player-wrapper > .player").each(function (index) {
			var playerData;

			//in the first player wrapper always put the current user
			if (index === 0) {
				playerData = _.find(game.players, {id: myId});

				//if it's his turn - show the "tada" animation
				if (game.playerTurn === myId) {
					$(this).addClass("tada");
				}
			} else {
				playerData = _.find(game.players, function (player) {
					return player.id !== myId;
				});
			}
			
			//check if we should display the player turn counter
			var addCounter = playerData.id === myId && game.playerTurn === myId;
			
			//generate the DOM elements for the player data
			generatePlayerData($(this), playerData, addCounter);
			
			//start the player turn countdown
			if(addCounter){
				startTurnCountdown();
			}
			
		});

	});

	/**
	 * Maps the gameMap value to the correct image
	 * @param {Number} value
	 * @returns {Object}
	 */
	function mapCellValue(value) {
		var icon;

		if (value === myId) {
			icon = "icon-x.png";
		} else if (value === 0) {
			icon = "icon-transparent.png";
		} else {
			icon = "icon-o.png";
		}

		return $("<img>", {
			class: "img-responsive",
			src: "/img/" + icon
		});
	}

	/**
	 * Generates the player-wrapper DOM elements and appends them to the wrapper
	 * @param {Object} wrapper
	 * @param {Object} data
	 * @param {Boolean} addCounter
	 */
	function generatePlayerData(wrapper, data, addCounter) {
		var avatar = $("<img>", {
			class: "avatar img-responsive img-circle",
			src: "/upload/avatars/" + data.avatar
		});

		var profileLink = $("<a>", {
			href: "/user/" + data.id,
			target: "_blank",
			title: "View user info"
		});

		var username = $("<div>", {
			class: "username",
			text: data.username
		});
		
		if (addCounter) {
			var counter = $("<div>", {
				class: "counter",
				text: playerTurnTimeout
			});

			wrapper.parent().append(counter);
		}

		profileLink.append(avatar);
		profileLink.append(username);
		wrapper.append(profileLink);
	}
	
	/**
	 * Starts the player turn countdown
	 */
	function startTurnCountdown() {
		var counter = playerTurnTimeout;
		
		playerTurnCounterInterval = setInterval(function () {
			counter--;

			//if the time is over stop the interval and cancel the challenge
			if (counter === 0) {
				clearInterval(playerTurnCounterInterval);
				//TODO: terminate the game and mark it as lost by the player
				console.log("TIME OVER");
			}

			$(".player-wrapper > .counter").html(counter);
		}, 1000);
	}

	/**
	 * Sends the makeMove event passing the coordinates of the selected cell
	 */
	function makeMove() {
		var cell = $(this).attr("class");
		socket.emit("makeMove", cell);
	}

}