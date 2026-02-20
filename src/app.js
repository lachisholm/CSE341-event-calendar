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
let swaggerFile;

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());

// Session middleware (required for OAuth)
app.use(
  session({
    secret: "cse341_secret",
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
      callbackURL: "/auth/google/callback"
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Swagger UI (load safely so missing file doesn't crash deploys)
try {
  swaggerFile = require(path.join(__dirname, "..", "swagger", "swagger.json"));
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));
} catch (err) {
  console.warn("Swagger file not found or failed to load, skipping /api-docs:", err.message);
}

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
