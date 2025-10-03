// // server.js

// const express = require("express");
// const bodyParser = require("body-parser");
// const cors = require("cors");
// require('dotenv').config();

// const loginRoutes = require("./routes/login");
// const ticketsRouter = require('./routes/ticket');



// const app = express();

// const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000')
//   .split(',')
//   .map(origin => origin.trim());

// app.use(cors({
//   origin: allowedOrigins,
//   credentials: true
// }));

// app.use(bodyParser.json());

// app.use("/api/login", loginRoutes);
// app.use('/api/ticket', ticketsRouter);

// const PORT = process.env.PORT || 9002;
// app.listen(PORT, '0.0.0.0', () => {
//   console.log(`API server running on http://localhost:${PORT}`);
// });

// server.js

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require('dotenv').config();

const loginRoutes = require("./routes/login");
const ticketsRouter = require('./routes/ticket');

const app = express();

const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000')
  .split(',')
  .map(origin => origin.trim());

app.use(cors({
  origin: function (origin, callback) {
    console.log('Incoming request from origin:', origin);
    // allow requests with no origin (like Postman or curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('Blocked origin:', origin);
      callback(new Error('CORS policy: Origin not allowed'), false);
    }
  },
  credentials: true
}));

app.use(bodyParser.json());

app.use("/api/login", loginRoutes);
app.use('/api/ticket', ticketsRouter);

const PORT = process.env.PORT || 9002;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
