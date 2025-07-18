const mongoose = require('mongoose');
require('dotenv').config();

//Define the MongoDB connection URL
const mongoUrl = process.env.MONGODB_URL_LOCAL;

//Set up MongoDb connection
mongoose.connect(mongoUrl);

//Get the default connection
//Mongoose maintains a default connection object representing the MongoDB connection.
const db = mongoose.connection;

//Define event listeners for database connection

db.on('connected',()=>{
    console.log('Connected to MonogoDb server')
})

module.exports = db;