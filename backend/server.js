const express = require('express')
const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json());

require('dotenv').config();
require('./config/db').connectDB();

const userRoutes = require("./routes/userRoutes");
const tripRoutes = require("./routes/tripRoutes");
const batteryRoutes = require("./routes/batteryRoutes");
const mapRoutes = require("./routes/mapRoutes");

app.use("/api/users", userRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/battery", batteryRoutes);
app.use("/api/maps", mapRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

