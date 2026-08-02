import passport from 'passport';
// config/passport.js
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import * as authService from '../servises/authService.js';
import { updateProfile } from '../servises/userService.js';

const serverUrl = process.env.NODE_ENV === 'production'
                    ? [process.env.PRODUCTION_SERVER] // <-- Replace with your live frontend URL
                    : [process.env.DEVELOPMENT_SERVER]; // Local development URL
console.log()
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${serverUrl}/auth/google/login`,
    scope: ['profile', 'email'] // 💡 Ensure 'profile' scope is requested!
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // 1. Extract the Google Avatar URL safely
      const googleAvatar = profile.photos?.[0]?.value || profile._json?.picture;

      // 2. Pass it to your database strategy
      let user = await authService.findByEmail(profile.emails[0].value);

      if (!user) {
        // If it's a new user, save their Google avatar directly to the DB
        user = await authService.createUser({
          userName: profile.displayName,
          email: profile.emails[0].value,
          avatarUrl: googleAvatar, // ✅ Store it here
    
        });
      } else if (!user.avatarUrl && googleAvatar) {
        // Optional: Update an existing local user's empty avatar with their Google photo
        const updateData = {avatarUrl:googleAvatar};
        user = await updateProfile(user.id ,updateData); 
      }

      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));
export default passport;