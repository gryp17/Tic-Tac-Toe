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
	});
	
	//profile link click handler
	$("body").on("click", ".user-profile-modal-link", function (e){
		e.preventDefault();
		
		var userId = parseInt($(this).attr("data-id"));
		
		//get the user info
		$.ajax({
			url: "/user/"+userId,
			type: "GET"
		}).done(function (result) {
			if (!result.userData) {
				toastr.error(result);
				return;
			}
						
			console.log(result);
			
			generateTabsButtons(userId);
			generateWTL(result.gameHistory);
			
			//TODO:
			//should probably add pagination
			generateGameHistory(result.gameHistory);
		
			modal.modal("show");
		});
		
	});
	
	/**
	 * Generates the tabs buttons depending on the opened user id
	 * @param {Number} userId
	 */
	function generateTabsButtons(userId){
		var tabsWrapper = modal.find(".tabs-wrapper");
		var visibleTabs = [];
		
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

			//add the "active" class to the first tab
			if(index === 0){
				data.classes.push("active");
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
	 * @param {Array} gameHistory
	 */
	function generateGameHistory(gameHistory) {
		
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