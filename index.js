const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require('mongoose');
const User = require("./models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;
mongoose.connect('mongodb://localhost:27017/authentication-server');

// login
app.get("/login", async (req, res) => {
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
            name: user.name,
            email: user.email
        }, process.env.JWTSECRET);

        return res.json({ status: 'ok', user: token });
    } else {
        return res.json({ status: 'error', user: false })
    }
});

// register
app.get("/register", async (req, res) => {
    // console.log(req.body);
    try {
        const newPassword = await bcrypt.hash(req.body.password, 10)
        const user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: newPassword,
        })
        res.json({ status: 'ok' })
    } catch (err) {
        // console.log(err);
        res.json({ status: 'error', error: 'Duplicate email' })
    }
});

app.listen(port, () => {
    console.log(`Running server on http://localhost:${port}`);
});