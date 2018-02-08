function LobbyController(globals) {
	var myUser = globals.myUser;
	
	var challengeTimeout = 20; //seconds
	var challengeCounterInterval;

	var statusMap = {
		"available": "alert alert-success",
		"busy": "alert alert-warning"
	};

	var socket = io("/lobby");

	//redirect the avatar-preview click to the actual file input
	$(".avatar-preview").click(function () {
		$("#update-avatar-form .avatar").click();
	});

	//on avatar change submit the form data
	$("#update-avatar-form .avatar").change(function () {

		var formData = new FormData(document.getElementById("update-avatar-form"));

		$.ajax({
			url: "/user/updateAvatar",
			type: "POST",
			enctype: "multipart/form-data",
			processData: false,
			contentType: false,
			data: formData
		}).done(function (result) {
			//if the avatar has been uploaded successfully
			if (result.avatar) {
				//update the avatar-preview image with the new image
				var src = $(".avatar-preview").attr("src");
				src = src.replace(/[^\/]+?$/, result.avatar);
				$(".avatar-preview").attr("src", src);
			} else {
				toastr.error(result);
			}

		});
	});


	/**
	 * Sends the lobby chat message
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

	//update the users list
	socket.on("updateUsersList", function (users) {

		//empty the users list and generate it again with the new users data
		$("#users-list").empty();
		users.forEach(function (user) {

			var item = $("<div>", {
				id: user.id,
				class: statusMap[user.status],
				text: user.username,
				title: "Invite " + user.username + " for a game",
				click: challengeUser
			});

			var avatar = $("<img>", {
				class: "avatar",
				src: "/upload/avatars/" + user.avatar
			});

			item.prepend(avatar);

			var profileIcon = $("<span>", {
				class: "glyphicon glyphicon-info-sign"
			});

			var profileButton = $("<a>", {
				class: "user-info",
				href: "/user/" + user.id,
				target: "_blank",
				title: "View user info",
				click: function (e){
					//prevent the parent click handler from firing also
					e.stopPropagation();
				}
			});

			profileButton.append(profileIcon);
			item.append(profileButton);

			$("#users-list").append(item);
		});

	});
	
	/**
	 * Handler function that is called when a user is clicked
	 * It sends a challenge to the selected user.
	 */
	function challengeUser() {
		var userId = parseInt($(this).attr("id"));

		//can't challenge your self and can't challenge users that aren't available
		if (userId !== myUser.id && $(this).hasClass(statusMap.available)) {

			$("#challenge-pending-modal .counter").html(challengeTimeout);

			//show the challenge pending modal
			$("#challenge-pending-modal").modal("show");
			
			//start the countdown
			var counter = challengeTimeout;
			challengeCounterInterval = setInterval(function () {
				counter--;

				//if the time is over stop the interval and cancel the challenge
				if (counter < 0) {
					clearInterval(challengeCounterInterval);
					socket.emit("cancelChallenge");
				}

				$("#challenge-pending-modal .counter").html(counter);
			}, 1000);

			socket.emit("challengeUser", userId);
		}
	}

	//challenge handler
	socket.on("challenge", function (challenger) {

		$("#challenge-modal .counter").html(challengeTimeout);

		$("#challenge-modal .challenger").html(challenger.username);
		$("#challenge-modal .challenger").attr("href", "/user/" + challenger.id);

		//show the challenge modal		
		$("#challenge-modal").modal("show");

		//start the countdown
		var counter = challengeTimeout - 1;
		challengeCounterInterval = setInterval(function () {

			//if the time is over stop the interval and cancel the challenge
			if (counter < 0) {
				clearInterval(challengeCounterInterval);
				socket.emit("cancelChallenge");
			}

			$("#challenge-modal .counter").html(counter);
			counter--;
		}, 1000);

	});

	//challenge canceled handler
	socket.on("cancelChallenge", function () {
		//stop the countdown
		clearInterval(challengeCounterInterval);

		$("#challenge-modal").modal("hide");
		$("#challenge-pending-modal").modal("hide");
	});

	//challenge accepted
	$("#challenge-modal .btn-success").click(function () {
		socket.emit("acceptChallenge");
	});

	//challenge declined
	$("#challenge-modal .btn-danger").click(function () {
		socket.emit("cancelChallenge");
	});

	//challenge canceled by the challenger
	$("#challenge-pending-modal .btn-danger").click(function () {
		socket.emit("cancelChallenge");
	});

	//update the games list
	socket.on("updateGamesList", function (games) {
		
		//empty the games list and generate it again with the new games data
		$("#games-list").empty();
		games.forEach(function (game) {

			var item = $("<div>", {
				class: "alert alert-info",
				text: " vs ",
				title: game.players[0].username+" VS "+game.players[1].username
			});
			
			var challenger = $("<a>", {
				href: "/user/" + game.players[0].id,
				text: game.players[0].username,
				target: "_blank",
				title: "View user info"
			});
			
			var challenged = $("<a>", {
				href: "/user/" + game.players[1].id,
				text: game.players[1].username,
				target: "_blank",
				title: "View user info"
			});

			item.prepend(challenger);
			item.append(challenged);

			$("#games-list").append(item);
		});

	});
	
	//start game event
	socket.on("startGame", function (){		
		window.open("/game", "_self");
	});

}
