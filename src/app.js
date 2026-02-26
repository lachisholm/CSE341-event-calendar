const express = require("express");
require("dotenv").config();

const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const connectDB = require("./config/db");
const routes = require("./routes");
const errorHandler = require("./middleware/errorHandler");
const User = require("./models/User");

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

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const googleCallbackUrl =
  process.env.GOOGLE_CALLBACK_URL || "/auth/google/callback";

// Warn if credentials look incorrect
if (
  !googleClientId ||
  googleClientId.includes("YOUR") ||
  googleClientId === "GOOGLE_CLIENT_ID"
) {
  console.warn(
    "Warning: GOOGLE_CLIENT_ID looks unset or like a placeholder."
  );
}

if (
  !googleClientSecret ||
  googleClientSecret.includes("YOUR") ||
  googleClientSecret === "GOOGLE_CLIENT_SECRET"
) {
  console.warn(
    "Warning: GOOGLE_CLIENT_SECRET looks unset or like a placeholder."
  );
}

passport.use(
  new GoogleStrategy(
    {
      clientID: googleClientId,
      clientSecret: googleClientSecret,
      callbackURL: googleCallbackUrl
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          user = await User.create({
            googleId: profile.id,
            displayName: profile.displayName,
            email: profile.emails[0].value
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// Store only MongoDB user id in session
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

// Swagger UI
try {
  swaggerFile = require(path.join(
    __dirname,
    "..",
    "swagger",
    "swagger.json"
  ));
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));
} catch (err) {
  console.warn(
    "Swagger file not found or failed to load:",
    err.message
  );
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

// Error Handler
app.use(errorHandler);

module.exports = app;