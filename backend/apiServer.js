const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer'); // Import multer
const path = require('path'); // Import path for resolving upload directory

const app = express();
const PORT = 5000;

app.use(cors());

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Ensure the 'uploads' directory exists
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir); // Files will be saved in the 'uploads' directory
    },
    filename: function (req, file, cb) {
        // Use the original file name with a timestamp to avoid conflicts
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Use bodyParser for JSON parsing (for non-file data)
app.use(bodyParser.json());
// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/carts', require('./routes/carts.js'));
app.use('/api/users', require('./routes/users.js'));
app.use('/api/products', require('./routes/products.js'));

app.listen(PORT, ()=>{
    console.log(`Server running at http://localhost:${PORT}`);
})
