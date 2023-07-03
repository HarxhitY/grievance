if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const compression = require('compression');
const MongoStore = require('connect-mongo');

const app = express();

process.setMaxListeners(15);


// Middleware to Handle Post request
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(compression());

// Define paths for views and public dir
const publicDirectoryPath = path.join(__dirname, '../public');
const viewsDirectoryPath = path.join(__dirname, '../views');

// Set path for views and public directory
app.set('views', viewsDirectoryPath);
app.use(express.static(publicDirectoryPath));

// Ejs Engine
app.set('view engine', 'ejs');

// connecting db
const dbURI = 'mongodb://127.0.0.1:27017/e-complaints';

mongoose.connect(dbURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.error('Error connecting to MongoDB:', error);
});

process.on('SIGINT', () => {
  mongoose.connection.close().then(() => {
    console.log('Disconnected from MongoDB');
    process.exit(0);
  });
});

// Express session middleware
app.use(
  session({
    secret: 'secretKey',
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24, httpOnly: true },
    store: MongoStore.create({
      mongoUrl: dbURI,
      mongoOptions: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
    }),
  })
);

app.use(flash());
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

// passport config
require('../middleware/passport.js')(passport);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// setting global variable for every view as middleware function to check whether user is logged in or not
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.isAuthenticated();
  next();
});

// Routes
const homeRouter = require('../routes/index');
app.use(homeRouter);

const complaintRouter = require('../routes/complaints');
app.use(complaintRouter);

const feedbackRouter = require('../routes/feedback');
app.use('/feedback', feedbackRouter);

const userRouter = require('../routes/users');
app.use('/users', userRouter);

const adminRouter = require('../routes/admin');
app.use('/admin', adminRouter);

const staffRouter = require('../routes/staff');
app.use('/staff', staffRouter);

const errorRouter = require('../routes/404');
app.use(errorRouter);

app.listen(3000, () => {
  console.log('Server running at 3000');
});
