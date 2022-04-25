const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require('mongoose');
const User = require("./models/user.model");

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;
mongoose.connect('mongodb://localhost:27017/authentication-server');

// login
app.post("/login", async (req, res) => {
    console.log(req.body);

    const user = await User.findOne({ email: req.body.email, password: req.body.password })
    if (user) {
        return res.json({ status: 'ok', user: true })
    } else {
        return res.json({ status: 'error', user: false })
    }
});

// register
app.post("/register", async (req, res) => {
    console.log(req);
    // console.log(req.headers);
    // try {
    //     const user = await User.create({
    //         name: req.headers.name,
    //         email: req.headers.email,
    //         password: req.headers.password,
    //     })
    //     res.json({ status: 'ok' })
    // } catch (err) {
    //     console.log(err);
    //     res.json({ status: 'error', error: 'Duplicate email' })
    // }
    res.json({ status: 'ok' })
});

app.listen(port, () => {
    console.log(`Running server on http://localhost:${port}`);
});