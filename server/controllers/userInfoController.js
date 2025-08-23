const bcrypt = require('bcryptjs');

module.exports = {
  editInfo: async (req, res) => {
    const editType = req.params.editType;
    switch (editType) {
      case 'email':
        const db = req.app.get('db');
        const { email } = req.body;
        const emailFiltered = email.toLowerCase().replace(/\s/g, '');
        const storedUser = await db.user.getUserByEmail(emailFiltered);
        if (email) {
          if (storedUser.length === 0) {
            const user_id = req.session.user.user_id;
            try {
              await db.userInfo.editEmail(user_id, emailFiltered);
              req.session.user = { ...req.session.user, email: emailFiltered };
              return res.status(200).send(req.session.user);
            } catch (err) {
              return res.sendStatus(500);
            }
          } else {
            return res.status(400).send('email');
          }
        } else {
          return res.status(400).send('incomplete');
        }
      case 'username':
        const db1 = req.app.get('db');
        const { username } = req.body;
        const usernameFiltered = username.toLowerCase().replace(/\s/g, '');
        const storedUser1 = await db1.user.getUserByUsername(usernameFiltered);
        if (username) {
          if (storedUser1.length === 0) {
            const user_id1 = req.session.user.user_id;
            try {
              await db1.userInfo.editUsername(user_id1, usernameFiltered);
              req.session.user = { ...req.session.user, username: usernameFiltered };
              return res.status(200).send(req.session.user);
            } catch (err) {
              return res.sendStatus(500);
            }
          } else {
            return res.status(400).send('username');
          }
        } else {
          return res.status(400).send('incomplete');
        }
      case 'password':
        const db2 = req.app.get('db');
        const { password } = req.body;
        const user_id2 = req.session.user.user_id;
        try {
          const salt = await bcrypt.genSalt(10);
          const hash = await bcrypt.hash(password, salt);
          await db2.userInfo.editPassword(user_id2, hash);
          return res.status(200).send(req.session.user);
        } catch (err) {
          return res.sendStatus(500);
        }
      case 'firstname':
        const db3 = req.app.get('db');
        const { first_name } = req.body;
        const user_id3 = req.session.user.user_id;
        try {
          await db3.userInfo.editFirstName(user_id3, first_name);
          req.session.user = { ...req.session.user, first_name };
          return res.status(200).send(req.session.user);
        } catch (err) {
          return res.sendStatus(500);
        }
      case 'lastname':
        const db4 = req.app.get('db');
        const { last_name } = req.body;
        const user_id4 = req.session.user.user_id;
        try {
          await db4.userInfo.editLastName(user_id4, last_name);
          req.session.user = { ...req.session.user, last_name };
          return res.status(200).send(req.session.user);
        } catch (err) {
          return res.sendStatus(500);
        }
      default:
        return res.sendStatus(400);
    }
  },
  deleteUser: async (req, res) => {
    const db = req.app.get('db');
    const user_id = req.session.user.user_id;
    try {
      await db.userInfo.deleteUser(user_id);
      req.session.destroy();
      return res.sendStatus(200);
    } catch (err) {
      return res.sendStatus(500);
    }
  }
};
