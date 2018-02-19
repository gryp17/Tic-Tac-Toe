function LobbyController(globals) {
	var myUser = globals.myUser;
		
	var challengeTimeout = 20; //seconds
	var challengeCounterInterval;
	
	//initialize the AudioService
	var notifications = new AudioService(myUser);

	var statusMap = {
		"available": "alert alert-success",
		"busy": "alert alert-warning"
	};

	//set the transports only to "websocket"
	//this fixes a bug with socket.io that leaves inactive connections when you refresh the page many times
	var socket = io("/lobby", {transports: ["websocket"], upgrade: false});

	//set the sound status
	if(myUser.sound === 1){
		$(".toggle-sound-btn").addClass("on");
	}

	//redirect the avatar-preview click to the actual file input
	$(".avatar-preview-wrapper").click(function () {
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
	
	//toggle sound status
	$(".toggle-sound-btn").click(function (){
		var self = $(this);
		
		if($(this).hasClass("on")){
			myUser.sound = 0;
		}else{
			myUser.sound = 1;
		}
		
		$.ajax({
			url: "/user/toggleSound",
			type: "POST",
			data: {
				sound: myUser.sound
			}
		}).done(function (result) {
			if (result.user) {
				self.toggleClass("on");
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
		
		//play the chat message notification sound
		notifications.play("message");
		
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
				class: "user-info user-profile-modal-link",
				"data-id": user.id,
				href: "#",
				title: "View user info"
			});

			profileButton.append(profileIcon);
			item.append(profileButton);

			$("#users-list").append(item);
		});

	});
	
	/**
	 * Handler function that is called when a user is clicked
	 * It sends a challenge to the selected user.
	 * @param {Object} e
	 */
	function challengeUser(e) {
		
		if ($(e.target).is(".user-info, .user-info *")) {
			return;
		}
		
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
		
		//play the challenge notification sound
		notifications.play("challenge");

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
				title: game.players[0].username+" vs "+game.players[1].username
			});
			
			var vs = $("<span>", {
				class: "vs",
				text: "vs"
			});
			
			game.players.forEach(function (player, index){
				var avatar = $("<img>", {
					class: "avatar",
					src: "/upload/avatars/" + player.avatar
				});
				
				var playerLink = $("<a>", {
					class: "user-profile-modal-link",
					"data-id": player.id,
					href: "#",
					text: player.username,
					title: "View user info"
				});
				
				item.append(avatar);
				item.append(playerLink);
				
				if(index === 0){
					item.append(vs);
				}
			});
			
			$("#games-list").append(item);
		});

	});
	
	//start game event
	socket.on("startGame", function (){		
		window.open("/game", "_self");
	});
	
	//kick user event
	socket.on("kickUser", function (userId){
		if(userId === myUser.id){
			window.open("/", "_self");
		}
	});

}
