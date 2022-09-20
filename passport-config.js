const localStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
function initialize(passport, getUserByUsername) {
  const authenticateUser = async (username, password, done) => {
    const user = await getUserByUsername(username);
    if (user == null) {
      return done(null, false, { message: "no user with that username" });
    }

    try {
      if (await bcrypt.compare(password, user.pass)) {
        return done(null, user);
      } else {
        return done(null, false, { message: "Password does not match" });
      }
    } catch (e) {
      return done(e);
    }
  };
  passport.use(
    new localStrategy({ usernameField: "username" }, authenticateUser)
  );
  passport.serializeUser((user, done) => {
    return done(null, user.username);
  });
  passport.deserializeUser((username, done) => {
    return done(null, getUserByUsername(username));
  });
}

module.exports = initialize;
