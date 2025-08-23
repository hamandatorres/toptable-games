const bcrypt = require('bcryptjs');

module.exports = {
  register: async (req, res) => {
    const { email, username, password, first_name, last_name } = req.body;
    const db = req.app.get('db');
    if (email && username && password) {
      const emailFiltered = email.toLowerCase().replace(/\s/g, '');
      const usernameFiltered = username.toLowerCase().replace(/\s/g, '');
      try {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        const storedUserEmail = await db.user.getUserByEmail(emailFiltered);
        if (storedUserEmail.length === 0) {
          try {
            const storedUserUsername = await db.user.getUserByUsername(usernameFiltered);
            if (storedUserUsername.length === 0) {
              try {
                const user_id = await db.user.register(emailFiltered, usernameFiltered, first_name, last_name, hash);
                const newUser = {
                  user_id: user_id[0].user_id,
                  email: emailFiltered,
                  username: usernameFiltered,
                  first_name,
                  last_name
                };
                req.session.user = newUser;
                return res.status(200).send(newUser);
              } catch (err) {
                console.log(err);
              }
            } else {
              return res.status(400).send('username');
            }
          } catch (err) {
            res.sendStatus(500);
          }
        } else {
          return res.status(400).send('email');
        }
      } catch (err) {
        res.sendStatus(500);
      }
    } else {
      return res.status(400).send('incomplete');
    }
  },
  login: async (req, res) => {
    const db = req.app.get('db');
    const { userCreds, password } = req.body;
    if (userCreds && password) {
      const userCredsFiltered = userCreds.toLowerCase().replace(/\s/g, '');
      try {
        const storedUser = await db.user.getUserHash(userCredsFiltered);
        if (storedUser.length !== 0) {
          if (await bcrypt.compare(password, storedUser[0].hash)) {
            const user = await db.user.getUser(userCredsFiltered);
            req.session.user = user[0];
            return res.status(200).send(req.session.user);
          } else {
            req.session.destroy();
            return res.status(403).send('password');
          }
        } else {
          return res.status(404).send('userCreds');
        }
      } catch (err) {
        res.sendStatus(500);
      }
    } else {
      res.status(400).send('incomplete');
    }
  },

  logout: async (req, res) => {
    req.session.destroy();
    return res.sendStatus(200);
  },

  getUser: async (req, res) => {
    res.status(200).send(req.session.user);
  }
};
