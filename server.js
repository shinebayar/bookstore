const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
var rfs = require('rotating-file-stream')
const fileUpload = require('express-fileupload');
const morgan = require('morgan');
const colors = require('colors');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');

const logger = require('./middleware/logger');
const connectDB = require('./config/db');
const categoriesRoutes = require('./routes/categories');
const booksRoutes = require('./routes/books');
const usersRoutes = require('./routes/users');
const errorHandler = require('./middleware/error');

// To load application config to process.env
dotenv.config({path: './config/config.env'});

const app = express();

// To point index.html in public directory. So It can be loaded in localhost:4000 url
app.use(express.static(path.join(__dirname, 'public')));

connectDB();

console.log(__dirname.blue);

const whitelist = ['http://localhost:3000'];

const corsOptions = {
    origin: function (origin, callback){
        console.log(origin);
        if( origin === undefined || whitelist.indexOf(origin) !== -1 ){
            // to allow to access our rest api from this domain
            callback(null, true);
        }else {
            // to deny to access from this domain
            callback(new Error('Access id denied from this domain ...'));
        }
    },
    allowedHeaders: 'Authorization, Set-Cookie, Content-type',
    methods: 'GET, POST, PUT, DELETE',
    credentials: true,
};
  
// Implementing middlewares

// To restrict api call count in specific times
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 5, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: 'You can only call 100 times in 3 minutes.'
})
// Apply the rate limiting middleware to all requests
app.use(limiter);

// Anti http parameter polution attack ?name=aaa&name=bbb ===> name=bbb in req.query
app.use(hpp());

// Convert body data into json format
app.use(express.json());

// Can give an access from different domains
app.use(cors(corsOptions));

// If there is cookie, push that cookie into req.cookie variable
app.use(cookieParser());

// To clean mongodb datas from client side
app.use(mongoSanitize());

// For client web apps, to point rules using http header
app.use(helmet());

// To protoct cross site scripting attack from client side
app.use(xss());

// To work with uploaded files
app.use(fileUpload());

// Our custom logger
app.use(logger);

// Morgan logger
// create a rotating write stream, Configuration of morgan logger
var accessLogStream = rfs.createStream('access.log', {
    interval: '1d', // rotate daily
    path: path.join(__dirname, 'log')
})
app.use(morgan('combined', {stream: accessLogStream}));

// REST API RESOURCE
app.use('/api/v1/categories', categoriesRoutes);
app.use('/api/v1/books', booksRoutes);
app.use('/api/v1/users', usersRoutes);

// When there is error occured, grab that error's info and transfer it to client side
app.use(errorHandler);

const server = app.listen(process.env.PORT, () => console.log(`Express server running in ${process.env.PORT} ...`.rainbow) );

process.on('unhandledRejection', (err, promise) => {
    console.log(`Error ocured: ${err.message}`.red.underline.bold);
    server.close(() => {
        process.exit(1);
    });
});