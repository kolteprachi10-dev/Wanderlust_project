const Listing = require("../models/listings.js");
const axios = require("axios");
const mapToken = process.env.MAP_TOKEN;

module.exports.index = async (req, res) => {
    const { category , search } = req.query;
    let allListings;
    if (category) {
        allListings = await Listing.find({
            categories: category
        });
    } else if (search) {
        allListings = await Listing.find({
            $or: [
                { location: { $regex: search, $options: "i" } },
                { country: { $regex: search, $options: "i" } }
            ]
        });
    } else {
        allListings = await Listing.find({});
    }
    res.render("listings.ejs", { allListings });
};  // index - asynchronous function 

module.exports.renderNewForm = (req, res) => {
    res.render("new.ejs");
};

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate({path: "reviews", populate:{path:"author",},}).populate("owner");
    if(!listing){
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    res.render("show.ejs", { listing });
};

module.exports.createListing = async (req, res) => {

    let listing = req.body.listing;
    // Forward geocoding using LocationIQ
    let response = await axios.get(
        "https://us1.locationiq.com/v1/search",
        {
            params: {
                key: mapToken,
                q: `${listing.location}`,
                format: "json",
                limit: 1
            }
        }
    );
    console.log("LocationIQ response:", response.data);
    let newListing = new Listing(listing);
    newListing.owner = req.user._id;
    newListing.image = {
        url: req.file.path,
        filename: req.file.filename
    };
    // Store coordinates
    newListing.geometry = {
        type: "Point",
        coordinates: [
            Number(response.data[0].lon),
            Number(response.data[0].lat)
        ]
    };
    let savelisting = await newListing.save();
    console.log(savelisting);
    await newListing.save();
    req.flash("success", "Successfully created a new listing");
    res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/uploads" , "/uploads/h_300,w_250");
    res.render("edit.ejs", { listing , originalImageUrl});
};

module.exports.updateListing = async (req, res) => {
    // if(!req.body.listing){
    //     throw new ExpressError(400 , "Send valid data for listing");
    // }
    let { id } = req.params;
    let updateData = { ...req.body.listing };

    if (!updateData.categories) {
        updateData.categories = [];
    }

    let listing = await Listing.findByIdAndUpdate(id, updateData);

    if(typeof req.file !== "undefined"){
        listing.image = {
        url: req.file.path,
        filename: req.file.filename
        };
        await listing.save();
    }

    req.flash("success", "Listing Updated");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    const deletedlisting = await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted")
    res.redirect("/listings");
};