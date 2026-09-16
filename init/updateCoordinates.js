// const mongoose = require("mongoose");
// const axios = require("axios");
// require("dotenv").config({ path: "../.env" });

// const Listing = require("../models/listings.js");
// const dbUrl = "mongodb://127.0.0.1:27017/wanderlust";

// async function updateCoordinates() {
//     try {
//         // Connect to MongoDB
//         await mongoose.connect(dbUrl);
//         console.log("Connected to MongoDB");
//         // Get all listings
//         const listings = await Listing.find({});
//         console.log(`Found ${listings.length} listings`);
//         // Update each listing
//         for (let listing of listings) {
//             // Skip listings that already have coordinates
//             if (
//                 listing.geometry &&
//                 listing.geometry.coordinates &&
//                 listing.geometry.coordinates.length === 2
//             ) {
//                 console.log(`Skipping: ${listing.title}`);
//                 continue;
//             }
//             try {
//                 console.log(
//                     `Finding location for: ${listing.location}, ${listing.country}`
//                 );
//                 // LocationIQ forward geocoding
//                 const response = await axios.get(
//                     "https://us1.locationiq.com/v1/search",
//                     {
//                         params: {
//                             key: process.env.MAP_TOKEN,
//                             q: `${listing.location}, ${listing.country}`,
//                             format: "json",
//                             limit: 1
//                         }
//                     }
//                 );
//                 // Location not found
//                 if (!response.data || response.data.length === 0) {
//                     console.log(
//                         `Location not found: ${listing.location}, ${listing.country}`
//                     );
//                     continue;
//                 }
//                 // Get longitude and latitude
//                 const longitude = Number(response.data[0].lon);
//                 const latitude = Number(response.data[0].lat);
//                 // Save geometry
//                 listing.geometry = {
//                     type: "Point",

//                     coordinates: [
//                         longitude,
//                         latitude
//                     ]
//                 };
//                 // Save listing
//                 await listing.save();
//                 console.log(
//                     `Updated: ${listing.title} → [${longitude}, ${latitude}]`
//                 );
//             } catch (error) {
//                 console.log(
//                     `Error updating ${listing.title}:`,
//                     error.response?.data || error.message
//                 );
//             }
//             // Wait 1 second before next request
//             await new Promise(resolve => setTimeout(resolve, 1000));
//         }
//         console.log("All listings processed!");
//     } catch (error) {
//         console.log("Database error:", error.message);
//     } finally {
//         await mongoose.connection.close();
//         console.log("MongoDB connection closed");
//     }
// }
// updateCoordinates();




// code to update categories
const mongoose = require("mongoose");
require("dotenv").config({ path: "../.env" });
const Listing = require("../models/listings.js");

const dbUrl = "mongodb://127.0.0.1:27017/wanderlust";

const categoryData = {
    "Cozy Beachfront Cottage": [
        "Trending",
        "Rooms"
    ],

    "Modern Loft in Downtown": [
        "Rooms",
        "Iconic Cities"
    ],

    "Mountain Retreat": [
        "Mountains",
        "Trending"
    ],

    "Historic Villa in Tuscany": [
        "Rooms",
        "Trending"
    ],

    "Secluded Treehouse Getaway": [
        "Camping",
        "Trending"
    ],

    "Beachfront Paradise": [
        "Rooms",
        "Trending"
    ],

    "Rustic Cabin by the Lake": [
        "Camping",
        "Mountains"
    ],

    "Luxury Penthouse with City Views": [
        "Rooms",
        "Iconic Cities",
        "Trending"
    ],

    "Ski-In/Ski-Out Chalet": [
        "Mountains",
        "Trending"
    ],

    "Safari Lodge in the Serengeti": [
        "Camping",
        "Trending"
    ],

    "Historic Canal House": [
        "Rooms",
        "Iconic Cities"
    ],

    "Private Island Retreat": [
        "Trending"
    ],

    "Charming Cottage in the Cotswolds": [
        "Rooms",
        "Trending"
    ],

    "Historic Brownstone in Boston": [
        "Rooms",
        "Iconic Cities"
    ],

    "Beachfront Bungalow in Bali": [
        "Rooms",
        "Amazing Pools",
        "Trending"
    ],

    "Mountain View Cabin in Banff": [
        "Mountains",
        "Camping",
        "Trending"
    ],

    "Art Deco Apartment in Miami": [
        "Rooms",
        "Iconic Cities"
    ],

    "Tropical Villa in Phuket": [
        "Rooms",
        "Amazing Pools",
        "Trending"
    ],

    "Historic Castle in Scotland": [
        "Castles",
        "Mountains",
        "Trending"
    ],

    "Desert Oasis in Dubai": [
        "Rooms",
        "Amazing Pools",
        "Trending"
    ],

    "Rustic Log Cabin in Montana": [
        "Mountains",
        "Camping"
    ],

    "Beachfront Villa in Greece": [
        "Rooms",
        "Amazing Pools",
        "Trending"
    ],

    "Eco-Friendly Treehouse Retreat": [
        "Camping",
        "Trending"
    ],

    "Historic Cottage in Charleston": [
        "Rooms",
        "Iconic Cities"
    ],

    "Modern Apartment in Tokyo": [
        "Rooms",
        "Iconic Cities",
        "Trending"
    ],

    "Lakefront Cabin in New Hampshire": [
        "Camping",
        "Mountains"
    ],

    "Luxury Villa in the Maldives": [
        "Rooms",
        "Amazing Pools",
        "Trending"
    ],

    "Ski Chalet in Aspen": [
        "Mountains",
        "Trending"
    ],

    "Secluded Beach House in Costa Rica": [
        "Rooms",
        "Trending"
    ]
};


async function updateCategories() {

    try {

        await mongoose.connect(dbUrl);

        console.log("Connected to MongoDB");

        for (const [title, categories] of Object.entries(categoryData)) {

            const listing = await Listing.findOne({ title });

            if (!listing) {
                console.log(`Not found: ${title}`);
                continue;
            }

            listing.categories = categories;

            await listing.save();

            console.log(
                `Updated: ${title} → ${categories.join(", ")}`
            );
        }

        console.log("\nAll categories updated successfully!");

    } catch (error) {

        console.log("Error:", error.message);

    } finally {

        await mongoose.connection.close();

        console.log("MongoDB connection closed");
    }
}

updateCategories();