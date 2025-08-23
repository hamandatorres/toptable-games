const crypto = require('crypto');
const { ADDRESS, PASSWORD } = process.env;
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');

module.exports = {
  resetPwdEmail: async (req, res) => {
    const db = req.app.get('db');
    if (req.body.email === '') {
      res.sendStatus(400);
    } else {
      const rtvdCreds = await db.user.getUser(req.body.email.toLowerCase().replace(/\s/g, ''));
      if (rtvdCreds.length > 0) {
        let expDate = new Date(Date.now() + 1000 * 60 * 60 * 24);
        const token = crypto.randomBytes(16).toString('hex');
        db.pwdReset.pwdReset(rtvdCreds[0].user_id, token, expDate);

        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: `${ADDRESS}`,
            pass: `${PASSWORD}`
          }
        });

        const mailOptions = {
          from: '${ADDRESS]',
          to: `${rtvdCreds[0].email}`,
          subject: 'Password Reset',
          html: `<div style='background: #f0f0f0; height: 50px; width: 100%;'> </div>
            <body>
              <div style='padding: 20px 50px;'>
                <h1 style='font-size: 20pt; font-family: Tahoma; font-weight: 400'>Hello,<h1>
                <main>
                  <p  style='font-size: 14pt; font-family: Tahoma; font-weight: 400'>You, or someone with access to your account, has requested a password reset with TopTableGames.net.</p>            
                  <p  style='font-size: 14pt; font-family: Tahoma; font-weight: 400'>If this request was not made by you, please reset your password immediately using the "Reset Password" link on our login page.</p>
                  <p  style='font-size: 14pt; font-family: Tahoma; font-weight: 400'>Otherwise, please click on the following link within 24 hours to reset your password.</p>
                  <a style='font-size: 18pt; font-family: Tahoma; font-weight: 400;'href="https://toptablegames.net/reset/${token}"> Reset Password </a>
                  <p  style='font-size: 14pt; font-family: Tahoma; font-weight: 400'>Thank you, TopTable Games</p>
                </main>
  
              </div>
            </body>
            <div style='background: #bebdbd; height: 50px; width:100%;  margin-top: 20px;'> <h3 style='text-align: center; padding-top: 12px;'>TopTable Games</h3> </div>`
        };

        transporter.sendMail(mailOptions, (err, res) => {
          if (err) {
            console.log(err);
          } else {
            res.sendStatus(200);
          }
        });
        res.sendStatus(200);
      } else {
        res.sendStatus(400);
      }
    }
  },
  processReset: async (req, res) => {
    const db = req.app.get('db');
    if (req.params.token) {
      const userCreds = await db.pwdReset.getUserByResetToken(req.params.token);
      if (userCreds.length > 0) {
        if (userCreds[0].reset_expiration.getTime() >= Date.now()) {
          const { newPassword } = req.body;
          try {
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(newPassword, salt);
            await db.userInfo.editPassword(userCreds[0].user_id, hash);
            req.session.user = { ...userCreds[0], ...{ hash: hash, pwd_reset_token: '' } };
            await db.pwdReset.removeResetToken(userCreds[0].user_id);
            res.status(200).send(req.session.user);
          } catch (err) {
            console.log(err);
          }
        } else {
          res.sendStatus(403);
        }
      }
    }
  }
};
