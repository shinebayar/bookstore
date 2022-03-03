const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
var rfs = require('rotating-file-stream')

const morgan = require('morgan');
const colors = require('colors');
const logger = require('./middleware/logger');
const connectDB = require('./config/db');
const categoriesRoutes = require('./routes/categories');
const booksRoutes = require('./routes/books');
const errorHandler = require('./middleware/error');

// To load application config to process.env
dotenv.config({path: './config/config.env'});

const app = express();

connectDB();

console.log(__dirname.blue);

// create a rotating write stream
var accessLogStream = rfs.createStream('access.log', {
    interval: '1d', // rotate daily
    path: path.join(__dirname, 'log')
  })


// Body parser
app.use(express.json());

// Implementing middleware
app.use(logger);
app.use(morgan('combined', {stream: accessLogStream}));
app.use('/api/v1/categories', categoriesRoutes);
app.use('/api/v1/books', booksRoutes);
app.use(errorHandler);

const server = app.listen(process.env.PORT, () => console.log(`Express server running in ${process.env.PORT} ...`.rainbow) );

process.on('unhandledRejection', (err, promise) => {
    console.log(`Error ocured: ${err.message}`.red.underline.bold);
    server.close(() => {
        process.exit(1);
    });
});