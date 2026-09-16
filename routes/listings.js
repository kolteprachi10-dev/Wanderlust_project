const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listings.js");
const {isLoggedIn , isOwner, validateLsting} = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const {storage} = require("../cloudConfig.js");
const multer = require('multer');
const upload = multer({ storage });

//Index route & POST - Create route - create new listing 
router.route("/")
.get(wrapAsync (listingController.index))
.post(isLoggedIn, validateLsting, upload.single('listing[image][url]'), wrapAsync (listingController.createListing));

// GET route - show form
router.get("/new", isLoggedIn, listingController.renderNewForm);

//edit route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync (listingController.renderEditForm));

// show route & update route & delete route
router.route("/:id")
.get(wrapAsync (listingController.showListing))
.put(isLoggedIn, isOwner, validateLsting, upload.single('listing[image][url]'), wrapAsync (listingController.updateListing))
.delete(isLoggedIn, isOwner, wrapAsync (listingController.destroyListing));

module.exports = router;