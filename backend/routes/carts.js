const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

const cartService = require('../services/cartService');

// กำหนด Path ไปยังไฟล์ cart.json ของคุณ (ยังคงมีไว้เผื่อมีการใช้งาน GET /carts โดยตรง)
const cartsFilePath = path.join(__dirname, '..', 'data', 'cart.json');

// --- Helper Functions สำหรับอ่าน/เขียนไฟล์ JSON (ใน carts.js นี้อาจจะเหลือแค่สำหรับ GET) ---
const readCartsFile = () => {
    try {
        const data = fs.readFileSync(cartsFilePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return []; // ถ้าไฟล์ไม่มี ให้คืนค่าเป็น Array ว่าง
        }
        throw error;
    }
};

router.get('/', (req, res) => {
    try {
        // อ่านไฟล์ JSON จากดิสก์ใหม่ทุกครั้งที่มี GET Request
        const carts = readCartsFile();
        res.json(carts);
    } catch (e) {
        res.status(400).json({ status: "Error Don't have file", message: e.message });
    }
});

router.post('/add', (req, res) => {
    // เรียกใช้ service โดยตรง ไม่ต้องอ่านไฟล์ใน route แล้ว
    cartService.addCart(req, res);
});

router.post('/remove', (req, res) => {
    // เรียกใช้ service โดยตรง ไม่ต้องอ่านไฟล์ใน route แล้ว
    cartService.removeCart(req, res);
});

module.exports = router;