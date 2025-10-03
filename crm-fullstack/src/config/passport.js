const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_REDIRECT_URI,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const name = profile.displayName || 'Google User';
        const picture = profile.photos?.[0]?.value || null;

        if (!email) {
          return done(new Error("Google account doesn't provide email"), null);
        }

        
        let user = await prisma.user.findUnique({ where: { email } });
       if (!user) {
       user = await prisma.user.create({
          data: {
          name,
          email,
          profilePicture: picture,  
       },
     });
    }



        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);


// Serialize user into session (optional if using sessions)
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  const user = await prisma.user.findUnique({ where: { id } });
  done(null, user);
});
