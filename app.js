if(process.env.NODE_ENV != "production")
{
  require('dotenv').config();
}
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session =require("express-session");
const MongoStore = require('connect-mongo');

const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const listingRouter=require("./routes/listing.js");
const reviewRouter=require("./routes/review.js");
const UserRouter = require("./routes/user.js");
require('./utils/nodeCron');
const MONGO_URL = process.env.MONGO_URL

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  try {
    await mongoose.connect(MONGO_URL);
  } catch (err) {
    console.log("Error connecting to database ");
  }
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
// use ejs-locals for all ejs templates:
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));


const store = MongoStore.create({
  mongoUrl: process.env.MONGO_URL,
  ttl: 60 * 60 * 1000,
  touchAfter: 30 * 60 * 1000,
});

store.on("error", (err) => {
  console.error("Error in mongo session store:", err);
});

// sessions
const sessionOptions={
  store: store,
  secret:process.env.SESSION_SECRET,
  resave:false,
  saveUninitialized: true,
  cookie:{
    expires: Date.now() + 60 * 60 * 1000,
    maxAge: 60 * 60 * 1000,//1hr
    httpOnly:true,
  }
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req,res,next)=>{
  res.locals.success=req.flash("success");
  res.locals.error=req.flash("error");
  res.locals.currUser = req.user;
  next(); 
});


app.get("/", (req, res) => {
  res.redirect("/listings"); // Redirects to the "All Listings" page
});

app.get('/search', listingRouter);
app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",UserRouter);
// Route to handle search functionality



app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page not Found !"));
});

// custom error handler
app.use((err, req, res, next) => {

  let { statusCode = 500, message = "something went wrong !" } = err;
  res.status(statusCode).render("error.ejs", { err });
});

app.listen(process.env.PORT || 8080, () => {
  console.log("server is listening to port 8080");
});
