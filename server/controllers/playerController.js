module.exports = {
  getPlayerTotalPlays: async (req, res) => {
    try {
      const db = req.app.get('db');
      const userID = req.params.id;
      const plays = await db.player.getPlayerTotalPlays(userID);
      return res.status(200).send(plays[0]);
    } catch (err) {
      return res.sendStatus(500);
    }
  },
  // getPlayerReviews: async (req, res) => {
  //   try {
  //     const db = req.app.get('db');
  //     const userID = req.params.id
  //     const reviews = await db.player.getPlayerReviews(userID)
  //     return res.status(200).send(reviews)
  //   } catch (err) {
  //     return res.sendStatus(500)
  //   }
  // },
  getAllPlayersTotalPlays: async (req, res) => {
    try {
      const db = req.app.get('db');
      const leaderboard = await db.player.getAllPlayersTotalPlays();
      return res.status(200).send(leaderboard);
    } catch (err) {
      return res.sendStatus(500);
    }
  }
};
