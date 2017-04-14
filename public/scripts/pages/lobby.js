function lobby(){
	var socket = io("/lobby");
	
	/**
	 * Sends the lobby chat message
	 */
	function sendChatMessage(){
		var message = $("#chat input[type=text]").val();
		message = message.trim();
		
		$("#chat input[type=text]").val("");
		
		if(message.length > 0){
			socket.emit("chatMessage", message);
		}
	}
	
	//send button handler
	$("#chat button").click(function (){
		sendChatMessage();
	});
	
	//text input handler
	$("#chat input[type=text]").keypress(function (e){
		if(e.which === 13) {
			sendChatMessage();
		}
	});
	
	//users click handler
	$("#users-list").on("click", "> *", function (){
		var userId = $(this).attr("id");
		console.log("clicked "+userId);
	});
	
	//chat message handler
	//it builds the necessary DOM elements and adds them to the chat container
	socket.on("chatMessage", function (data){
				
		//parse the date using momentjs
		var date = moment(data.date);
		
		//build the message element
		var message = $("<div>", {
			class: "message "+data.type //add the message type as class
		});
		
		//build the timestamp object
		var timestamp = $("<span>", {
			class: "timestamp",
			title: date.format("YYYY-MM-DD HH:mm:ss"),
			text: "["+date.format("HH:mm:ss")+"]"
		});
		
		message.append(timestamp);
		
		//add the author only for user messages
		if(data.type === "user"){
			//build the author object
			var author = $("<span>", {
				class: "author",
				text: data.author.username+":"
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
	socket.on("updateUsersList", function (users){
		console.log("received users: ");
		console.log(users);
				
		//empty the users list and generate it again with the new users data
		$("#users-list").empty();
		users.forEach(function (user){
			
			var item = $("<div>", {
				id: user.id,
				class: "alert alert-success",
				text: user.username
			});
			
			$("#users-list").append(item);
		});
		
	});
}
