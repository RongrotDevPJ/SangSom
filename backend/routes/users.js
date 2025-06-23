const express = require('express');
const router = express.Router();

const userService = require('../services/userServices');

router.post('/login', (req, res) => {
    // เรียกใช้ service โดยตรง service จะจัดการ response เอง
    userService.login(req, res);
});

router.post('/register', (req, res) => {
    // เรียกใช้ service โดยตรง service จะจัดการ response เอง
    userService.register(req, res);
});

module.exports = router;