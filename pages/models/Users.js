const mongoose = require('mongoose');

const emergencyContactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    relationship: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    }
});

const emergencyEmailSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    relationship: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true
    }
});

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: false,
        trim: true,
        unique: true,
        lowercase: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
    emergencyContacts: {
        type: [emergencyContactSchema],
        validate: [arrayLimit, '{PATH} exceeds the limit of 5'],
        default: []
    },
    emergencyEmails: {
        type: [emergencyEmailSchema],
        validate: [arrayLimit, '{PATH} exceeds the limit of 5'],
        default: []
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

function arrayLimit(val) {
    return val.length <= 5;
}

mongoose.models = {}
export default mongoose.model("AuraUsers", userSchema);