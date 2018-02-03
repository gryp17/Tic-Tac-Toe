function game() {
	var myId = parseInt($("#user-id").val());
	
	var playerTurnTimeout = 15; //seconds
	var playerTurnCounterInterval;
	var gameOverRedirectDelay = 5; //seconds

	var socket = io("/game");

	/**
	 * Sends the game chat message
	 */
	function sendChatMessage() {
		var message = $("#chat input[type=text]").val();
		message = message.trim();

		$("#chat input[type=text]").val("");

		if (message.length > 0) {
			socket.emit("chatMessage", message);
		}
	}

	//send button handler
	$("#chat button").click(function () {
		sendChatMessage();
	});

	//text input handler
	$("#chat input[type=text]").keypress(function (e) {
		if (e.which === 13) {
			sendChatMessage();
		}
	});

	//chat message handler
	//it builds the necessary DOM elements and adds them to the chat container
	socket.on("chatMessage", function (data) {

		//parse the date using momentjs
		var date = moment(data.date);

		//build the message element
		var message = $("<div>", {
			class: "message " + data.type //add the message type as class
		});

		//build the timestamp object
		var timestamp = $("<span>", {
			class: "timestamp",
			title: date.format("YYYY-MM-DD HH:mm:ss"),
			text: "[" + date.format("HH:mm:ss") + "]"
		});

		message.append(timestamp);

		//add the author only for user messages
		if (data.type === "user") {
			//build the author object
			var author = $("<span>", {
				class: "author",
				text: data.author.username + ":"
			});

			message.append(author);
		}

		//build the content object
		var content = $("<span>", {
			class: "content",
			text: data.message
		});

		message.append(content);

		//append the entire message element to the DOM
		$("#chat .chat-body").append(message);

		//scroll to the bottom of the chat-body (in case there is a scroll)
		var height = $("#chat .chat-body")[0].scrollHeight;
		$("#chat .chat-body").scrollTop(height);

	});
	
	//game over handler
	socket.on("gameOver", function (winner) {
		$("#game-over-modal .game-over-text").removeClass("win lose");
		
		//set the correct class in order to show the lose, win or tie message
		var textClass;
		
		if(winner === null){
			textClass = "tie";
		}else if(winner === myId){
			textClass = "win";
		}else{
			textClass = "lose";
		}
		
		$("#game-over-modal .game-over-text").addClass(textClass);
		
		//start set the countdown
		var countdown = gameOverRedirectDelay;
		$("#game-over-modal .counter").html(countdown);
		
		setInterval(function (){
			countdown--;
			$("#game-over-modal .counter").html(countdown);
			
			//when the countdown is over redirect to the lobby
			if(countdown === 0){
				window.location = "/lobby";
			}
			
		}, 1000);
		
		//show the modal
		$("#game-over-modal").modal("show");
		
	});

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
				//terminate the game and mark it as lost by the player
				socket.emit("playerTurnTimeout");
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