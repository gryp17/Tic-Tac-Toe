function UserProfileModalController(globals) {
	var myUser = globals.myUser;
	var modal;
		
	//list of tabs that will be displayed in the modal
	var tabs = [
		{
			type: "public",
			text: "Game History",
			classes: ["tab-button"],
			target: "game-history"
		},
		{
			type: "private",
			text: "Profile Settings",
			classes: ["tab-button"],
			target: "profile-settings"
		}
	];
	
	//load the component template and append it to the body
	$.ajax({
		url: "/template/user-profile-modal",
		type: "GET"
	}).done(function (template) {
		$("body").append(template);
		
		modal = $("#user-profile-modal");
		
		//change password click handler
		modal.on("click", "#profile-settings-form button", function (){
			changePassword();
		});

		//password input enter handler
		modal.on("keypress", "#profile-settings-form input[type=password]", function (e){
			if (e.which === 13) {
				changePassword();
			}
		});
		
		//profile link click handler
		$("body").on("click", ".user-profile-modal-link", showUserProfileModal);
	});
	
	/**
	 * Gets the user info and shows the user profile modal
	 * @param {Object} e
	 */
	function showUserProfileModal(e) {
		e.preventDefault();

		var userId = parseInt($(this).attr("data-id"));

		//get the user info
		$.ajax({
			url: "/user/" + userId,
			type: "GET"
		}).done(function (result) {
			if (!result.userData) {
				toastr.error(result);
				return;
			}

			generateTabsButtons(userId);
			generateWTL(result.gameHistory);

			//generate the game history
			generateGameHistory(userId, result.gameHistory);

			//clear the password fields
			clearProfileSettings();

			modal.modal("show");
		});
	}
	
	/**
	 * Resets all the password inputs in the profile settings
	 */
	function clearProfileSettings(){
		modal.find("#profile-settings-form input[type=password]").val("");
	}
		
	/**
	 * Changes the current user password
	 */
	function changePassword(){
		$.ajax({
			url: "/user/changePassword",
			type: "POST",
			data: $("#profile-settings-form").serialize()
		}).done(function (result) {
			if (result.user) {
				modal.modal("hide");
			} else {
				toastr.error(result);
			}
		});
	}
	
	/**
	 * Generates the tabs buttons depending on the opened user id
	 * @param {Number} userId
	 */
	function generateTabsButtons(userId){
		var tabsWrapper = modal.find(".tabs-wrapper");
		var visibleTabs = [];
		
		//remove the active class from all tab contents
		modal.find(".tab-content").removeClass("active");
		
		//show only the public tabs for the rest of the users
		if(userId !== myUser.id){
			visibleTabs = _.filter(tabs, {type: "public"});
		}else{
			visibleTabs = tabs;
		}
		
		tabsWrapper.empty();
		visibleTabs.forEach(function (data, index){
			//clone the object before modifying it
			data = _.cloneDeep(data);

			//add the correct bootstrap column size
			data.classes.push("col-xs-"+(12 / visibleTabs.length));

			//add the "active" class to the first tab and to the first tab content
			if(index === 0){
				data.classes.push("active");
				modal.find(".tab-content").first().addClass("active");
			}
		    			
			var tab = $("<div>", {
				class: data.classes.join(" "),
				text: data.text,
				"data-target": data.target
			});
			
			tabsWrapper.append(tab);
		});
	}
	
	/**
	 * Generates the game history list
	 * @param {Number} userId
	 * @param {Array} gameHistory
	 */
	function generateGameHistory(userId, gameHistory) {
		var gamesList = modal.find(".games-list");
		
		gamesList.empty();
		gameHistory.forEach(function (data){
			var panelClass;
			var panelTitle;
			
			//get the correct panel class and title depending on the game winner
			if(!data.winner){
				panelClass = "panel-info";
				panelTitle = "Tie";
			}else if(data.winner === userId){
				panelClass = "panel-success";
				panelTitle = "Win";
			}else {
				panelClass = "panel-danger";
				panelTitle = "Loss";
			}
			
			//add the "AFK" label if the entire map is empty
			if(mapIsEmpty(data.map)){
				panelTitle = panelTitle + " (AFK)";
			}
			
			var panel = $("<div>", {
				class: "panel "+panelClass
			});
			
			var header = $("<div>", {
				class: "panel-heading",
				text: panelTitle
			});
			
			var date = $("<span>", {
				class: "date",
				text: moment(data.finished).format("YYYY-MM-DD HH:mm:ss")
			});
			
			//get the panel body
			var body = generatePanelBody(userId, data);
			
			header.append(date);
			panel.append(header);
			panel.append(body);
			
			gamesList.append(panel);
		});
		
	}
	
	/**
	 * Checks if the entire map is empty (contains only 0s)
	 * @param {Array} map
	 * @returns {Boolean}
	 */
	function mapIsEmpty(map){
		var empty = true;
		
		outerLoop:
		for(var i = 0; i < map.length; i++){
			for(var j = 0; j < map[i].length; j++){
				if(map[i][j] !== 0){
					empty = false;
					break outerLoop;
				}
			}
		}
		
		return empty;
	}
	
	/**
	 * Generates the game panel body HTML structure
	 * @param {Number} userId
	 * @param {Object} data
	 * @returns {Object}
	 */
	function generatePanelBody(userId, data) {
		var body = $("<div>", {
			class: "panel-body"
		});
		
		var row = $("<div>", {
			class: "row"
		});
		
		//get the winner and loser objects
		var currentUser = _.find(data.players, {id: userId});
		var opponent = _.find(data.players, function (player){
			return player.id !== userId;
		});
		
		//in first place always put the current user
		[currentUser, opponent].forEach(function (playerData, index){
			var playerClass;
			
			//apply different bootstrap classes to each player
			if(index === 0){
				playerClass = "col-xs-6 col-sm-3";
			}else{
				playerClass = "col-xs-6 col-sm-push-6 col-sm-3";
			}
			
			var player = $("<div>", {
				class: "player "+playerClass
			});
			
			var avatar = $("<img>", {
				class: "avatar",
				src: "/upload/avatars/"+playerData.avatar
			});
			
			player.append(avatar);
			player.append(playerData.username);
			
			row.append(player);
		});
		
		//get the game result map/table
		var gameResultMap = generateGameResultMap(userId, data);
		
		row.append(gameResultMap);
		
		body.append(row);
		
		return body;
	}
	
	/**
	 * Generates the game result map with the provided game data
	 * @param {Number} userId
	 * @param {Object} data
	 * @returns {Object}
	 */
	function generateGameResultMap(userId, data){
		var wrapper = $("<div>", {
			class: "col-xs-12 col-sm-pull-3 col-sm-6"
		});
		
		var table = $("<table>", {
			id: "game-result-map",
			class: "table table-bordered"
		});
		
		//generate the table rows
		data.map.forEach(function (row, rowIndex) {
			var tr = $("<tr>");

			row.forEach(function (value, colIndex) {
				var td = $("<td>");

				//get the correct image
				var img = mapCellValue(userId, value);

				td.append(img);
				tr.append(td);
			});

			table.append(tr);
		});
		
		wrapper.append(table);
		
		return wrapper;
	}
	
	/**
	 * Maps the gameMap value to the correct image
	 * @param {Number} userId
	 * @param {Number} value
	 * @returns {Object}
	 */
	function mapCellValue(userId, value) {
		var icon;

		if (value === userId) {
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
	 * Counts the number of win, tie or lose games in the game history
	 * @param {Array} gameHistory
	 */
	function generateWTL(gameHistory) {
		var WTL = {
			win: 0,
			tie: 0,
			lose: 0
		};

		//count the number of win, tie or lose games
		gameHistory.forEach(function (game) {
			if (!game.winner) {
				WTL.tie++;
			} else if (game.winner === myUser.id) {
				WTL.win++;
			} else {
				WTL.lose++;
			}
		});
		
		//generate the html
		var tbody = modal.find(".wtl tbody");
		tbody.empty();
		
		var tr = $("<tr>");
		
		Object.values(WTL).forEach(function (count){			
			var td = $("<td>", {
				text: count 
			});
			tr.append(td);
		});
				
		tbody.append(tr);
	}
		
}