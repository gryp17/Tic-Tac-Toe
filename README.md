# Tic-Tac-Toe
NodeJS/Socket.IO implementation of the Tic-Tac-Toe game.
The backend is based on Express and MySQL while the front end uses mostly jQuery with some changes to the way it handles reusable components.
It uses [SASS](http://sass-lang.com) as css preprocessor, the dependencies are managed using [npm](https://www.npmjs.com/) and the build process is done with [webpack](https://webpack.js.org/).

Some of the game's features include:
- User signup.
- Game lobby with a global chat and a list of available players and active games.
- User profile and game history (with all player's moves) for each player.
- Ingame chat for the two players.
- Sound notifications on chat message and game request.

## Installation

1. Install all npm dependencies:

  ```
  npm install
  ```

3. Build the javascript and css files in production or development mode:

  ```
  npm run build
  ```

  ```
  npm run build-dev
  ```

4. Import the database schema:
  
  > [/db-schema.sql](https://github.com/gryp17/Tic-Tac-Toe/blob/master/db-schema.sql)


5. Start the web server in production or development mode:

  ```
  npm run start
  ```

  ```
  npm run start-dev
  ```

## Configuration

The configuration files are located in

> [/server/config/](https://github.com/gryp17/Tic-Tac-Toe/blob/master/server/config/)

The [development.js](https://github.com/gryp17/Tic-Tac-Toe/blob/master/server/config/development.js) configuration file is loaded by default if the "NODE_ENV" environment variable is not set.

It contains the default server port, session configuration, database credentials and directories.



