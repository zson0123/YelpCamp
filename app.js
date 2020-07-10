var express 	= require("express"),
	app 		= express(),
	bodyParser 	= require("body-parser"),
	axios 		= require("axios"),
	mongoose 	= require("mongoose"),
	Campground  = require("./models/campground"),
	Comment		= require("./models/comment"),
	passport	= require("passport"),
	LocalStrategy = require("passport-local"),
	flash		= require("connect-flash"),
	methodOverride = require("method-override"),
	User		= require("./models/user"),
	seedsDB		= require("./seeds");

// seedsDB(); // seed the database

// requiring routes
var commentRoutes 		= require("./routes/comments"),
	campgroundRoutes 	= require("./routes/campgrounds"),
	indexRoutes			= require("./routes/index");

var port = process.env.PORT || 3000;
var url = process.env.DATABASEURL || "mongodb://localhost/yelp_camp";
// Database Setup

mongoose.connect(url,
				{
	useNewUrlParser: true, 
	useUnifiedTopology: true, 
	useFindAndModify: false
});

app.use(methodOverride("_method"));

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(flash());

// PASSPORT CONFIGURATION
app.use(require("express-session")({
	secret: "Secret Passport Configuration",
	resave: false,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res, next) => {
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});

app.use("/", indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);

app.listen(port, () => {
	console.log("YelpCamp has Started!");
});