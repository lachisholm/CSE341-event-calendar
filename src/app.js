const express = require("express");
require("dotenv").config();

const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const connectDB = require("./config/db");
const routes = require("./routes");
const errorHandler = require("./middleware/errorHandler");

const swaggerUi = require("swagger-ui-express");
const path = require("path");

const User = require("./models/User");

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());

// Session middleware (required for OAuth)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "cse341_secret",
    resave: false,
    saveUninitialized: false
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL ||
        "/auth/google/callback"
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let existingUser = await User.findOne({ googleId: profile.id });

        if (existingUser) {
          return done(null, existingUser);
        }

        const newUser = new User({
          googleId: profile.id,
          displayName: profile.displayName,
          email: profile.emails && profile.emails.length > 0
            ? profile.emails[0].value
            : null
        });

        await newUser.save();
        return done(null, newUser);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

/*
  🔥 THIS FIXES RENDER PATH ISSUE
  app.js is inside /src
  swagger folder is at project root
*/
const swaggerPath = path.join(__dirname, "..", "..", "swagger", "swagger.json");
const swaggerFile = require(swaggerPath);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));

// Auth Routes
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.send("Authentication successful");
  }
);

app.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/");
  });
});

// Root Route
app.get("/", (req, res) => {
  res.send("CSE341 Event Calendar API Running");
});

// API Routes
app.use("/", routes);

// Error handler
app.use(errorHandler);

module.exports = app;