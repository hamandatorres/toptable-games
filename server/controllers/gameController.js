require('dotenv').config();
const { CLIENT_ID, CLIENT_SECRET } = process.env;
const axios = require('axios');

module.exports = {
  gameAverageRatings: async (req, res) => {
    try {
      const db = req.app.get('db');
      const ratings = await db.game.gameAverageRatings();
      return res.status(200).send(ratings);
    } catch (err) {
      return res.sendStatus(500);
    }
  },
  gameReviews: async (req, res) => {
    try {
      const db = req.app.get('db');
      const gameID = req.params.id;
      const reviews = await db.game.gameReviews(gameID);
      return res.status(200).send(reviews);
    } catch (err) {
      return res.sendStatus(500);
    }
  },
  gamePlayers: async (req, res) => {
    try {
      const db = req.app.get('db');
      const gameID = req.params.id;
      const players = await db.game.gamePlayers(gameID);
      return res.status(200).send(players);
    } catch (err) {
      return res.sendStatus(500);
    }
  },
  totalPlays: async (req, res) => {
    const db = req.app.get('db');
    const gameID = req.params.id;
    try {
      const plays = await db.game.gameTotalPlays(gameID);
      return res.status(200).send(plays[0]);
    } catch (err) {
      return res.sendStatus(500);
    }
  }
};
