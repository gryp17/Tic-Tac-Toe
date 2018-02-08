function user() {
	var myUser = window.myUser;
	var gameHistory = window.gameHistory;
	
	console.log(gameHistory);

	calculateWTL();

	/**
	 * Counts the number of win, tie or lose games in the game history
	 */
	function calculateWTL() {
		var WTL = {
			win: 0,
			tie: 0,
			lose: 0
		};

		gameHistory.forEach(function (game) {
			if (!game.winner) {
				WTL.tie++;
			} else if (game.winner === myUser.id) {
				WTL.win++;
			} else {
				WTL.lose++;
			}
		});
		
		console.log(WTL);
	}

	

}