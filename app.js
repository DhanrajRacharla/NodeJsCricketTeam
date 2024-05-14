const express = require('express')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const app = express()

const path = require('path')
const dbPath = path.join(__dirname, 'cricketTeam.db')

let db = null
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server running at http://localhost/3000/')
    })
  } catch (e) {
    console.log(`Db Error: ${e.message}`)
  }
}

initializeDbAndServer()
app.use(express.json())

const convertDbObjectToResponseObject = dbObject => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  }
}

app.get('/players/', async (request, response) => {
  const getListOfPlayers = `SELECT * FROM cricket_team`
  const playersArray = await db.all(getListOfPlayers)
  response.send(
    playersArray.map(eachPlayer => convertDbObjectToResponseObject(eachPlayer)),
  )
})

app.post('/players/', async (request, response) => {
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails
  const addPlayerQuery = `INSERT INTO cricket_team(player_name,jersey_number,role) VALUES ('${playerName}', ${jerseyNumber},'${role}');`

  const dbResponse = await db.run(addPlayerQuery)
  const playerId = dbResponse.lastID
  response.send('Player Added to Team')
})

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getListOfPlayer = `SELECT * FROM cricket_team WHERE player_id = ${playerId};`
  const playersArray = await db.get(getListOfPlayer)
  response.send(convertDbObjectToResponseObject(playersArray))
})

app.put('/players/:playerId', async (request, response) => {
  const playerDetails = request.body
  const {playerId} = request.params
  const {playerName, jerseyNumber, role} = playerDetails
  const updatePlayerQuery = `UPDATE cricket_team SET player_name = '${playerName}',jersey_number =  ${jerseyNumber},role = '${role}' WHERE player_id = ${playerId} ;`

  await db.run(updatePlayerQuery)
  //const playerId = dbResponse.lastID
  response.send('Player Details Updated')
})

app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const deleteQuery = `DELETE FROM cricket_team WHERE player_id = ${playerId};`
  const playersArray = await db.get(deleteQuery)
  response.send('Player Removed')
})

module.exports = app
