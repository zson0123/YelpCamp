var express = require("express"),
	router 	= express.Router(),
	Campground = require("../models/campground"),
	middleware = require("../middleware"); //require directory runs index.js file

//INDEX - show all campgrounds
router.get("/", (req, res) => {
	// Get data from DB
	Campground.find({}, (err, allCampgrounds) => {
		if (err) {
			console.log(err);
		} else {
			res.render("campgrounds/index", {campgrounds: allCampgrounds, currentUser: req.user, page: "campgrounds"});
		}
	});
});

// CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, (req, res) => {
	// get data from form and add to DB
	var name = req.body.name;
	var price = req.body.price;
	var image = req.body.image;
	var desc = req.body.description;
	var author = {
		id: req.user._id,
		username: req.user.username
	}
	var newCampground = {name: name, image: image, description: desc, author: author, price: price};
	// create new campground and save to DB
	Campground.create(newCampground, (err, newCreated) => {
		if (err) {
			console.log(err);
		} else {
			// redirect to /campgrounds
			res.redirect("/campgrounds");
		}
	});
});

// POST LIKE ROUTE
router.post("/:id/like", middleware.isLoggedIn, (req, res) => {
	Campground.findById(req.params.id, (err, foundCampground) => {
		if (err) {
			console.log(err);
			return res.redirect("/campgrounds");
		}
		
		var foundUserLike = foundCampground.likes.some((like) => {
			return like.equals(req.user._id);
		});
		
		if (foundUserLike) {
			// user already liked => dislike
			foundCampground.likes.pull(req.user._id);
		} else {
			// add likes
			foundCampground.likes.push(req.user);
		}
		
		foundCampground.save((err) => {
			if (err) {
				console.log(err);
				return res.redirect("/campgrounds");
			}
			return res.redirect("/campgrounds/" + foundCampground._id);	
		});
	});
});

// NEW - show form to create new campground
router.get("/new", middleware.isLoggedIn, (req, res) => {
	res.render("campgrounds/new");
});

// SHOW - shows more info about campground
router.get("/:id", (req, res) => { // order matters
	// find campground with provided ID
	Campground.findById(req.params.id).populate("comments likes").exec((err, foundCampground) => {
		if (err) {
			console.log(err);
		} else {
			// render show template with that campground
			res.render("campgrounds/show", {campground: foundCampground});
		}
	});
});

// EDIT CAMPGROUND ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership, (req, res) => {
	Campground.findById(req.params.id, (err, foundCampground) => {
		res.render("campgrounds/edit", {campground: foundCampground});
	});
});

// UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, (req, res) => {
	// find and update correct campgrounds
	Campground.findByIdAndUpdate(req.params.id, req.body.campground, (err, updatedCampground) => {
		if(err) {
			res.redirect("/campgrounds");
		} else {
			// redirect (show page)
			res.redirect("/campgrounds/" + req.params.id);
		}
	});
});

// DELETE CAMPGROUND ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership, (req, res) => {
	Campground.findByIdAndRemove(req.params.id, (err) => {
		if (err) {
			res.redirect("/campgrounds");
		} else {
			res.redirect("/campgrounds");
		}
	});
});

module.exports = router;