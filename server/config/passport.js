const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const prisma = require("../lib/db");

const crypto = require('crypto');
const bcrypt = require('bcryptjs');



passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;
      let user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        const randomPassword = crypto.randomBytes(32).toString('hex');
        const hashedPassword = await bcrypt.hash(randomPassword, 10);

        user = await prisma.user.create({
          data: {
            email: email,
            username: profile.displayName + '_' + profile.id.slice(-4),
            role: 'CANDIDATE',
            password: hashedPassword
          }
        });
      }
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  }
));

const GitHubStrategy = require('passport-github2').Strategy;

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: `${process.env.BACKEND_URL}/api/auth/github/callback`,
  scope: ['user:email'] 
},
async (accessToken, refreshToken, profile, done) => {
    try {
        const email = profile.emails[0].value;
        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            const randomPassword = crypto.randomBytes(32).toString('hex');
            const hashedPassword = await bcrypt.hash(randomPassword, 10);

            user = await prisma.user.create({
                data: {
                    email: email,
                    username: profile.username,
                    role: 'CANDIDATE',
                    password: hashedPassword
                }
            });
        }
        done(null, user);
    } catch (error) {
        done(error, null);
    }
}
));


module.exports = passport;