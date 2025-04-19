const mongoose = require('mongoose');

const donateSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        // Not required to allow anonymous donations
    },
    fullname: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: false, // Explicitly set to false to ensure no uniqueness constraint
    },
    phone: {
        type: String,
        required: true,
    },
    foodType: {
        type: String,
        required: true,
        enum: ['veg', 'non-veg', 'both'],
    },
    fullAddress: {
        type: String,
        required: true,
    },
    foodQuantity: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'completed', 'cancelled'],
        default: 'pending'
    },
    donationDate: {
        type: Date,
        default: Date.now
    },
    notes: {
        type: String
    },
    uniqueId: {
        type: String,
        // This will ensure each donation has a unique identifier
        // even if the same user donates multiple times
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('donate', donateSchema);