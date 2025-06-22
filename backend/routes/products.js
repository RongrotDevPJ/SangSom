const express = require('express');
const router = express.Router();
const multer = require('multer'); // Import multer
const path = require('path'); // Import path for resolving upload directory
const fs = require('fs'); // Import fs to ensure directory exists

const productService = require('../services/productServices');

// กำหนด Path ไปยังไฟล์ product.json ของคุณ
const productsFilePath = path.join(__dirname, '..', 'data', 'product.json');

// Path to your temporary upload directory
const tempUploadDir = path.join(__dirname, '..', 'temp_uploads');
const finalUploadDir = path.join(__dirname, '..', 'uploads'); // Define final upload directory

// Ensure temporary and final upload directories exist
if (!fs.existsSync(tempUploadDir)) {
    fs.mkdirSync(tempUploadDir, { recursive: true });
}
if (!fs.existsSync(finalUploadDir)) {
    fs.mkdirSync(finalUploadDir, { recursive: true });
}

// Configure Multer storage to save to a temporary directory first
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, tempUploadDir); // Save to temp directory
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// --- Helper Functions สำหรับอ่าน/เขียนไฟล์ JSON ---
const readProductsFile = () => {
    try {
        const data = fs.readFileSync(productsFilePath, 'utf8');
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
        // *** สำคัญ: อ่านไฟล์ JSON จากดิสก์ใหม่ทุกครั้งที่มี GET Request ***
        const products = readProductsFile();
        res.json(products);
    } catch (e) {
        res.status(400).json({ status: "Error Don't have file"});
    }
})

router.post('/add', upload.array('img', 5), (req,res) => {
    const products = readProductsFile();
    const response = productService.addProduct(req, res);
})

router.post('/edit', upload.array('img', 5), (req,res) => {
    const products = readProductsFile();
    const response = productService.editProduct(req, res);
})

router.post('/remove', (req,res) => {
    const products = readProductsFile();
    const response = productService.removeProduct(req, res);
})

router.post('/sizeAdd', (req,res) => {
    const products = readProductsFile();
    const response = productService.sizeAdd(req, res);
})

router.post('/sizeRemove', (req,res) => {
    const products = readProductsFile();
    const response = productService.sizeRemove(req, res);
})

module.exports = router;