const express = require('express');
const app = express();
const cors = require('cors')


const connectDB = require('./database/db.js');
require('dotenv').config();
connectDB();
app.use(cors())


app.use(express.json());
// Middleware to parse URL-encoded data
app.use(express.urlencoded({ extended: true }));

const adminRoutes = require('./routes/adminRoutes.js');
const userRoutes = require('./routes/userRoutes.js');
const donateRoutes = require('./routes/donateRoute.js');

app.use('/admin', adminRoutes);
app.use('/user', userRoutes);
app.use('/donate', donateRoutes);

app.get('/', (req, res) => {
    res.send('<h1>Hello World</h1>');
});


module.exports = app;

