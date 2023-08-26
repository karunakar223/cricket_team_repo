const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const dbPath = path.join(__dirname, "cricketTeam.db");

const app = express();

app.use(express.json());

let database = null;

const initializeDbServer = async () => {
  try {
    database = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Server is running at port: 3000");
    });
  } catch (error) {
    console.log(`Database error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbServer();

const convertingToResObject = (resObj) => {
  return {
    playerId: resObj.player_id,
    playerName: resObj.player_name,
    jerseyNumber: resObj.jersey_number,
    role: resObj.role,
  };
};

app.get("/players/", async (req, res) => {
  const getPlayersQuery = `SELECT * FROM cricket_team;`;
  const playersArray = await database.all(getPlayersQuery);
  res.send(playersArray.map((eachPlayer) => convertingToResObject(eachPlayer)));
});

app.post("/players/", async (req, res) => {
  const { playerName, jerseyNumber, role } = req.body;
  const postPlayerQuery = `
        INSERT INTO 
            cricket_team(player_name, jersey_number, role)
        VALUES 
            ('${playerName}', ${jerseyNumber}, '${role}');`;
  const createdPlayer = await database.run(postPlayerQuery);
  res.send("Player Added to Team");
});

app.get("/players/:playerId/", async (req, res) => {
  const { playerId } = req.params;
  const getPlayerQuery = `SELECT * FROM cricket_team WHERE player_id = ${playerId};`;
  const player = await database.get(getPlayerQuery);
  res.send(convertingToResObject(player));
});

app.put("/players/:playerId/", async (req, res) => {
  const { playerName, jerseyNumber, role } = req.body;
  const { playerId } = req.params;
  const updatePlayerQuery = `UPDATE 
                                    cricket_team 
                                SET 
                                    player_name = '${playerName}',
                                    jersey_number = ${jerseyNumber},
                                    role = '${role}'
                                WHERE player_id = ${playerId};`;
  const updatedPlayer = await database.run(updatePlayerQuery);
  res.send("Player Details Updated");
});

app.delete("/players/:playerId/", async (req, res) => {
  const { playerId } = req.params;
  const playerDeleteQuery = `DELETE FROM 
                                    cricket_team 
                                 WHERE 
                                    player_id = ${playerId};`;
  const deletedPerson = await database.run(playerDeleteQuery);
  res.send("Player Removed");
});

module.exports = app;
