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
// Google OAuth Strategy
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const googleCallbackUrl = process.env.GOOGLE_CALLBACK_URL || "/auth/google/callback";

// Basic validation to catch placeholder values (helps avoid sending literal placeholders)
if (!googleClientId || googleClientId === "YOUR_ID_HERE" || googleClientId === "GOOGLE_CLIENT_ID" || googleClientId.includes("YOUR")) {
  console.warn(
    "Warning: GOOGLE_CLIENT_ID looks unset or like a placeholder. Set a real client ID in environment variables."
  );
}
if (!googleClientSecret || googleClientSecret === "YOUR_SECRET_HERE" || googleClientSecret === "GOOGLE_CLIENT_SECRET" || googleClientSecret.includes("YOUR")) {
  console.warn(
    "Warning: GOOGLE_CLIENT_SECRET looks unset or like a placeholder. Set a real client secret in environment variables."
  );
}

passport.use(
  new GoogleStrategy(
    {
      clientID: googleClientId,
      clientSecret: googleClientSecret,
      callbackURL: googleCallbackUrl
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
