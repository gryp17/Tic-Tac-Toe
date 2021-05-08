export default function AudioService(myUser) {
	
	var sounds = {
		'message': new Audio('/audio/message.mp3'),
		'challenge': new Audio('/audio/challenge.mp3')
	};
	
	/**
	 * Plays the specified sound
	 * @param {String} sound
	 */
	this.play = function (sound) {
		//if the sound exsits and the sounds settings are enabled for this user
		if(sounds[sound] && myUser.sound === 1) {
			sounds[sound].play();
		}
	};
	
	/**
	 * Returns a list containing all available sounds
	 * @returns {Array}
	 */
	this.getAvailableSounds = function () {
		return Object.keys(sounds);
	};
	
}