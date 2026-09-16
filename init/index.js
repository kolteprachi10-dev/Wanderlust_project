const mongoose = require("mongoose");
const axios = require("axios");
const dns = require("dns");

// Fix Atlas DNS issue
dns.setServers(["8.8.8.8", "8.8.4.4"]);

// .env is in the project root
require("dotenv").config({ path: "../.env" });

const initData = require("./data.js");
const Listing = require("../models/listings.js");


// ============================================================
// CATEGORY DATA
// ============================================================

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


// ============================================================
// MAIN
// ============================================================

async function main() {

    try {

        await mongoose.connect(process.env.ATLASDB_URL);

        console.log("Connected to MongoDB Atlas");


        // 1. Delete old listings
        await Listing.deleteMany({});

        console.log("Old listings deleted.");


        // 2. Create listings with coordinates
        const listings = [];

        for (const obj of initData.data) {

            try {

                console.log(
                    `Finding location for: ${obj.location}, ${obj.country}`
                );


                // LocationIQ API
                const response = await axios.get(
                    "https://us1.locationiq.com/v1/search",
                    {
                        params: {
                            key: process.env.MAP_TOKEN,
                            q: `${obj.location}, ${obj.country}`,
                            format: "json",
                            limit: 1
                        }
                    }
                );


                // Location not found
                if (!response.data || response.data.length === 0) {

                    console.log(
                        `Location not found: ${obj.location}, ${obj.country}`
                    );

                    continue;
                }


                // Get coordinates
                const longitude = Number(response.data[0].lon);
                const latitude = Number(response.data[0].lat);


                // Create listing with geometry
                const listing = {

                    ...obj,

                    owner: "6aaa3d03f95bed5a575f2d14",

                    geometry: {

                        type: "Point",

                        coordinates: [
                            longitude,
                            latitude
                        ]
                    }
                };


                listings.push(listing);


                console.log(
                    `Coordinates found: ${obj.title} → [${longitude}, ${latitude}]`
                );


            } catch (error) {

                console.log(
                    `Error finding coordinates for ${obj.title}:`,
                    error.response?.data || error.message
                );
            }


            // Wait 1 second between LocationIQ requests
            await new Promise(resolve => setTimeout(resolve, 1000));
        }


        // 3. Insert listings AFTER geometry is added
        if (listings.length > 0) {

            await Listing.insertMany(listings);

            console.log(
                `\n${listings.length} listings inserted successfully.`
            );

        } else {

            console.log("No listings were inserted.");
        }


        // 4. Update categories
        console.log("\n--- Updating Categories ---");


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


        console.log("\n=================================");
        console.log("All operations completed!");
        console.log("=================================");


    } catch (error) {

        console.log("\nDatabase/Initialization error:");
        console.log(error);


    } finally {

        await mongoose.connection.close();

        console.log("\nMongoDB connection closed.");
    }
}


main();
