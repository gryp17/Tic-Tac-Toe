
CREATE TABLE `user` (
	`id` int(11) AUTO_INCREMENT PRIMARY KEY,
	`username` varchar(20) NOT NULL,
	`password` varchar(40) NOT NULL,
	`avatar` varchar(80) DEFAULT NULL,
	`created` datetime NOT NULL,
	`sound` tinyint(4) DEFAULT '1'
);

CREATE TABLE `game` (
	`id` int(11) AUTO_INCREMENT PRIMARY KEY,
	`winner` int(11) NULL,
	`map` varchar(500) NOT NULL,
	`finished` datetime NOT NULL,
	CONSTRAINT `game_winner_fk` FOREIGN KEY (winner) REFERENCES user(id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE `player` (
	`gameId` int(11) NOT NULL,
	`userId` int(11) NOT NULL,
	CONSTRAINT `player_pk` PRIMARY KEY (userId, gameId),
	CONSTRAINT `player_user_fk` FOREIGN KEY (userId) REFERENCES user(id) ON UPDATE CASCADE ON DELETE CASCADE,
	CONSTRAINT `player_game_fk` FOREIGN KEY (gameId) REFERENCES game(id) ON UPDATE CASCADE ON DELETE CASCADE
);