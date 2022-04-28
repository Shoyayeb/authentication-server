const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require('mongoose');
const User = require("./models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;
mongoose.connect('mongodb://localhost:27017/authentication-server').then(result => {
    console.log('DB connected');
}).catch(err => {
    console.log(err);
});

// login
app.post("/login", async (req, res) => {
    // console.log(req.body);
    const user = await User.findOne({
        email: req.body.email
    });
    if (!user) {
        return { status: 'error', error: 'Invalid login' }
    }
    const isPasswordValid = await bcrypt.compare(req.body.password, user.password);
    if (isPasswordValid) {
        const token = jwt.sign({
            // firstName: user.firstName,
            // lastName: user.lastName,
            email: user.email,
            uuid: user.uuid
            // packagePlan: user.packagePlan,
            // phone: user.phone,
            // photoURL: user.photoURL
        }, process.env.JWTSECRET);
        return res.json({ status: 'ok', user: token });
    } else {
        return res.json({ status: 'error', user: false })
    }
});

// register
app.post("/register", async (req, res) => {
    // console.log(req.body);
    // first name, last name, email, package plan, phone, photoURL
    const { password, firstName, lastName, email, packagePlan, phone, photoURL } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const uuid = crypto.randomUUID();
        const user = await User.create({
            firstName,
            lastName,
            email,
            packagePlan,
            phone,
            photoURL,
            uuid,
            password: hashedPassword
        });
        res.json({ status: 'ok' })
    } catch (err) {
        // console.log(err);
        res.json({ status: 'error', error: 'Duplicate email' });
    }
});

// reset password
app.post("/reset", async (req, res) => {
    const { oldPassword, newPassword, email } = req.body;

    // validating current user with old password
    const user = await User.findOne({
        email: email
    });
    if (!user) {
        return { status: 'error', error: 'Invalid email' }
    };
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

    // changing the password if old password is true
    if (isPasswordValid) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.save().then(savedDoc => {
            console.log('password changed');
        })
        return res.json({ status: 'ok', message: 'password changed' });
    } else {
        return res.json({ status: 'error', message: 'wrong password' })
    };

    res.json({ status: 'ok' })
});

// Changing user name
app.post("/change_name", async (req, res) => {
    const { email, password, newName } = req.body;
    // validating current user with old password
    const user = await User.findOne({
        email: email
    });
    if (!user) {
        return { status: 'error', error: 'Invalid email' }
    };
    const isPasswordValid = await bcrypt.compare(password, user.password);

    // changing details
    if (isPasswordValid) {
        user.name = newName;
        user.save().then(savedDoc => {
            console.log('name changed');
        });
        return res.json({ status: 'ok', message: 'name changed' });
    } else {
        return res.json({ status: 'error', message: 'wrong password' })
    };

    res.json({ status: 'ok' })
});


// route for changing all detail
app.post("/change_details", async (req, res) => {
    const { password, newUserDetails, email } = req.body;
    // validating current user with old password
    const user = await User.findOne({
        email: email
    });
    if (!user) {
        return { status: 'error', error: 'Invalid email' }
    };
    const isPasswordValid = await bcrypt.compare(password, user.password);

    // changing details
    const { firstName, lastName, packagePlan, phone, photoURL } = newUserDetails;
    if (isPasswordValid) {
        user.firstName = firstName;
        user.lastName = lastName;
        user.email = email;
        user.packagePlan = packagePlan;
        user.phone = phone;
        user.photoURL = photoURL;

        user.save().then(savedDoc => {
            console.log('name changed', savedDoc);
        });
        return res.json({ status: 'ok', message: 'name changed' });
    } else {
        return res.json({ status: 'error', message: 'wrong password' })
    };

    res.json({ status: 'ok' })
});

// route for getting all userDetails
app.get("/me", async (req, res) => {
    if (req.body.token) {
        const verifiedToken = jwt.verify(req.body.token, process.env.JWTSECRET);
        const user = await User.findOne({
            email: verifiedToken.email
        });

        if (!user) {
            return { status: 'error', error: 'Invalid email' }
        } else if (user) {
            const userDetails = jwt.sign({
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                uuid: user.uuid,
                packagePlan: user.packagePlan,
                phone: user.phone,
                photoURL: user.photoURL
            }, process.env.JWTSECRET);

            return res.json({ status: 'ok', userDetails });
        } else {
            return res.json({ status: 'error', message: 'wrong password' })
        };
    }
    res.json({ status: 'ok' });
});

app.listen(port, () => {
    console.log(`Running server on http://localhost:${port}`);
});