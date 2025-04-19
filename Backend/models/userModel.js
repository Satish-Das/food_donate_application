const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    city:{
        type: String,
        required: true,
    },
    pincode:{
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    address:{
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
        unique: true,
    },
    totalDonations: {
        type: Number,
        default: 0,
    },
    donations: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Donation',
    }],
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next(); 

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

module.exports = mongoose.model('User', userSchema);
