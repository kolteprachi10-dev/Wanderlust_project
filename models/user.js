const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose").default;
// default is used to get the actual plugin function from the package's exported object.
// Without .default, Mongoose receives an object, causing the "must be a function, got object" error.

const userSchema = new Schema({
    email: {
        type : String,
        required: true
    }
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);