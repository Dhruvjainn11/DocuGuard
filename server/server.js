require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const connectDB = require("./src/config/db");
const router = require("./src/routes");
const errorMiddleware = require("./src/middlewares/errorMiddleware");
const { apiLimiter } = require("./src/middlewares/rateLimiterMiddleware");

const app = express();

app.use(helmet());

app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "DocuGuard Server is running perfectly!" });
});

app.use('/api', apiLimiter)
app.use("/api", router);

const PORT = process.env.PORT || 5000;

// 11. Only start listening if this file is run directly (useful for testing later)
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server is cooking on port ${PORT}`);
  });
}

connectDB();

app.use(errorMiddleware);

// 12. Export the app for our testing robots
module.exports = app;
