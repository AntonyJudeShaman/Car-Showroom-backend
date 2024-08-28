const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../Model/user');

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

passport.use(
  new JwtStrategy(options, async (payload, done) => {
    try {
      const user = await User.findById(payload.id);
      // console.log(payload);
      if (user) {
        return done(null, user, 'User found');
      } else {
        return done(null, false, 'User not found');
      }
    } catch (error) {
      return done(error, false, 'Some error occured');
    }
  }),
);

module.passport = passport;
