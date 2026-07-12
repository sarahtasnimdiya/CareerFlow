const express = require('express');
const jwt = require('jsonwebtoken');
const passport = require('../config/passport');

const crypto = require('crypto');
const oauthCodes = require('../lib/oauthCodes');

const router = express.Router();

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));


function issueOAuthRedirect(user, res) {

    try {
        const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });



        const randomCode = crypto.randomBytes(16).toString('hex');
        oauthCodes.set(randomCode, { token, expiresAt: Date.now() + 60000 }); 
    
    res.redirect(`${process.env.FRONTEND_URL}/login?code=${randomCode}`);

    } catch (error) {
        console.error(error);
        res.redirect(`${process.env.FRONTEND_URL}/login?error=Authentication failed`);
    }
  
}

router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    issueOAuthRedirect(req.user, res);
  }
);

router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

router.get('/github/callback',
  passport.authenticate('github', { session: false, failureRedirect: '/login' }),
  (req, res) => {

    issueOAuthRedirect(req.user, res);
  }

);

router.post('/exchange', (req, res) => {
    const { code } = req.body;
    const data = oauthCodes.get(code);

    if (!data) {
        return res.status(400).json({ message: 'Invalid or expired code' });
    }

    if (Date.now() > data.expiresAt) {
        oauthCodes.delete(code);
        return res.status(400).json({ message: 'Code has expired' });
    }       

    const token = data.token;
    oauthCodes.delete(code);
    res.json({ token });
});


module.exports = router;