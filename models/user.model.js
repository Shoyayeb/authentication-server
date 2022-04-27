const mongoose = require('mongoose');

const User = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    packagePlan: { type: String, required: true },
    phone: { type: String, required: true },
    photoURL: { type: String, required: true },
    password: { type: String, required: true }
}, { collection: 'user-data' });

const model = mongoose.model('UserData', User);
module.exports = model;