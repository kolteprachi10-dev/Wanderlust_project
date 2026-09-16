if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}

const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const PORT = 8080;
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const { MongoStore } = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
require("dotenv").config();

const listingsRoutes = require("./routes/listings.js");
const reviewsRoutes = require("./routes/reviews.js");
const userRoutes = require("./routes/user.js");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended : true}));
app.use(methodOverride("_method"));
app.engine("ejs" , ejsMate);
app.use(express.static(path.join(__dirname, "public")));

async function main() {
    console.log(process.env.ATLASDB_URL);
    await mongoose.connect(process.env.ATLASDB_URL);
}

main()
    .then(() => {
        console.log("Connected to DB");
    })
    .catch((err) => {
        console.log(err);
    });

// mongostore configuration
const store = new MongoStore({
    mongoUrl: process.env.ATLASDB_URL,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
});

store.on("error",() => {
    console.log("ERROR in MONGO SESSION STORE", err);
});

// session configuration
const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 1000 * 60 * 60 * 24 * 3,   
        maxAge: 1000 * 60 * 60 * 24 * 3,
        httpOnly: true
    },
};

// flash 
app.use(session(sessionOptions));
app.use(flash());

// passport 
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())) 

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// flash middleware
app.use((req,res,next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;              // used for navbar
    next();
});

//reviews routes
app.use("/listings/:id/reviews", reviewsRoutes);

//listings routes
app.use("/listings", listingsRoutes);

//user routes
app.use("/", userRoutes);

app.all("/{*splat}", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

// error handling middleware
app.use((err,req,res,next) => {
    let {statusCode = 500 , message = "Something Went Wrong!"} = err;
    res.status(statusCode).render("error.ejs" , {err});
    // res.status(statusCode).send(message);
});

app.listen(PORT, () => {
    console.log(`Server is listening to port ${PORT}`);
});