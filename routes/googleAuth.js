exports.googleAuth = () => {
  const GoogleStrategy = require("passport-google-oauth2").Strategy;
  const GOOGLE_CLIENT_ID =
    "440162361558-a6g5bialhgo794bqbouv2fq2jjlvhrqg.apps.googleusercontent.com";
  const GOOGLE_CLIENT_SECRET = "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";
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:3000/google/authenticated",
        passReqToCallback: true,
      },
      function (request, accessToken, refreshToken, profile, done) {
        userModel.findOrCreate(
          {
            username: req.body.email,
            name: req.body.name,
            number: req.body.number,
          },
          function (err, user) {
            return done(err, user);
          }
        );
      }
    )
  );
  router.get("/google/auth",passport.authenticate("google", { scope: ["profile", "email"] })
  );
  
  router.get("/google/authenticated",passport.authenticate("google", {
      successRedirect: "/",
      failureRedirect: "/login",
    }),
    function (req, res) {}
  );  
};
