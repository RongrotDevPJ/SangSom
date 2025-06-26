const fs = require('fs');
const path = require('path');

const productFilePath = path.join(__dirname, "..", "data", "product.json");
const runningFilePath = path.join(__dirname, "..", "data", "running.json");
const searchFilePath = path.join(__dirname, "..", "data", "search.json");
const finalUploadDir = path.join(__dirname, '..', 'uploads');

// Helper function to clean up temporary uploaded files
function cleanupTempFiles(files) {
    if (files && files.length > 0) {
        files.forEach(file => {
            const tempFilePath = file.path;
            if (fs.existsSync(tempFilePath)) {
                fs.unlinkSync(tempFilePath);
                console.log(`Cleaned up temporary file: ${tempFilePath}`);
            }
        });
    }
}

// Helper function to delete files from the final upload directory
function deleteFinalFiles(filePaths) {
    if (filePaths && filePaths.length > 0) {
        filePaths.forEach(relativePath => {
            if (relativePath.startsWith('/uploads/')) {
                const filename = path.basename(relativePath);
                const fullPath = path.join(finalUploadDir, filename);
                if (fs.existsSync(fullPath)) {
                    fs.unlinkSync(fullPath);
                    console.log(`Deleted old image: ${fullPath}`);
                }
            }
        });
    }
}

// Helper function to read product data
function readProductsFile() {
    try {
        const data = fs.readFileSync(productFilePath, "utf-8");
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return { products: [] };
        }
        throw error;
    }
}

// Helper function to write product data
function writeProductsFile(products) {
    fs.writeFileSync(productFilePath, JSON.stringify(products, null, 2));
}

// Helper function to read running products data
function readRunningFile() {
    try {
        const data = fs.readFileSync(runningFilePath, "utf-8");
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return { products: [] };
        }
        throw error;
    }
}

// Helper function to write running products data
function writeRunningFile(products) {
    fs.writeFileSync(runningFilePath, JSON.stringify(products, null, 2));
}

// Helper function to read search products data
function readSearchFile() {
    try {
        const data = fs.readFileSync(searchFilePath, "utf-8");
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return { products: [] };
        }
        throw error;
    }
}

// Helper function to write search products data
function writeSearchFile(products) {
    fs.writeFileSync(searchFilePath, JSON.stringify(products, null, 2));
}

function addProduct(req, res) {
    const { id, name, price, detail, type, sizes, brand, gender, color } = req.body;
    const uploadedFiles = req.files;

    if (!id || !name || !price || !detail || !type || !sizes || !brand || !gender || !color) {
        cleanupTempFiles(uploadedFiles);
        return res.status(400).json({ status: 'Missing required product fields' });
    }

    // Parse sizes from JSON string if needed
    let parsedSizes;
    try {
        parsedSizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
    } catch (e) {
        cleanupTempFiles(uploadedFiles);
        return res.status(400).json({ status: 'Invalid sizes format' });
    }

    // Move files to final destination and prepare image paths
    const imagePaths = [];
    if (uploadedFiles && uploadedFiles.length > 0) {
        uploadedFiles.forEach(file => {
            const oldPath = file.path;
            const newFilename = path.basename(file.path);
            const newPath = path.join(finalUploadDir, newFilename);

            try {
                fs.renameSync(oldPath, newPath);
                imagePaths.push(`/uploads/${newFilename}`);
            } catch (error) {
                console.error(`Error moving file ${oldPath} to ${newPath}:`, error);
                cleanupTempFiles(uploadedFiles.filter(f => f.path !== oldPath));
                imagePaths.forEach(movedPath => {
                    const fullMovedPath = path.join(__dirname, '..', movedPath);
                    if (fs.existsSync(fullMovedPath)) {
                        fs.unlinkSync(fullMovedPath);
                    }
                });
                return res.status(500).json({ status: "Server error: Could not save product images." });
            }
        });
    }

    // Prepare new product data
    const newProduct = {
        id: id.toString(),
        name,
        image_url: imagePaths.length > 0 ? imagePaths[0] : '', // Main image
        brand,
        rating: 5, // Default rating
        price: parseFloat(price),
        detail,
        type,
        sizes: parsedSizes,
        colors: [
            {
                color,
                images: imagePaths
            }
        ]
    };

    try {
        // Read all product files
        let productsData = readProductsFile();
        let runningData = readRunningFile();
        let searchData = readSearchFile();

        // Check if product ID already exists
        if (productsData.products.some(p => p.id === id)){
            cleanupTempFiles(uploadedFiles);
            deleteFinalFiles(imagePaths);
            return res.status(400).json({ status: 'Product ID already exists' });
        }

        // Add to all product files
        productsData.products.push(newProduct);
        runningData.products.push(newProduct);
        searchData.products.push(newProduct);

        // Write all files
        writeProductsFile(productsData);
        writeRunningFile(runningData);
        writeSearchFile(searchData);

        console.log('AddProduct successfully', { id });
        res.status(200).json({ status: 'AddProduct successfully', product: newProduct });
    } catch (error) {
        console.error('Error adding product:', error);
        cleanupTempFiles(uploadedFiles);
        deleteFinalFiles(imagePaths);
        res.status(500).json({ status: 'Error adding product', message: error.message });
    }
}

function editProduct(req, res) {
    const { id, name, price, detail, type, brand, gender, color } = req.body;
    const uploadedFiles = req.files;

    if (!id) {
        cleanupTempFiles(uploadedFiles);
        return res.status(400).json({ status: 'Product ID is required' });
    }

    try {
        // Read all product files
        let productsData = readProductsFile();
        let runningData = readRunningFile();
        let searchData = readSearchFile();

        // Find product in each file
        const productIndex = productsData.products.findIndex(p => p.id === id);
        const runningIndex = runningData.products.findIndex(p => p.id === id);
        const searchIndex = searchData.products.findIndex(p => p.id === id);

        if (productIndex === -1) {
            cleanupTempFiles(uploadedFiles);
            return res.status(404).json({ status: 'Product not found' });
        }

        const oldProduct = productsData.products[productIndex];
        let newImagePaths = oldProduct.colors[0].images; // Default to old images

        // Handle image updates
        if (uploadedFiles && uploadedFiles.length > 0) {
            // Move new files to uploads directory
            newImagePaths = [];
            for (const file of uploadedFiles) {
                const oldPath = file.path;
                const newFilename = path.basename(file.path);
                const newPath = path.join(finalUploadDir, newFilename);
                
                try {
                    fs.renameSync(oldPath, newPath);
                    newImagePaths.push(`/uploads/${newFilename}`);
                } catch (error) {
                    console.error(`Error moving file during edit: ${oldPath} to ${newPath}`, error);
                    cleanupTempFiles(uploadedFiles.filter(f => f.path !== oldPath));
                    deleteFinalFiles(newImagePaths);
                    return res.status(500).json({ status: "Error updating product images" });
                }
            }
            
            // Delete old images
            deleteFinalFiles(oldProduct.colors[0].images);
        }

        // Update product data
        const updatedProduct = {
            ...oldProduct,
            name: name || oldProduct.name,
            price: price || oldProduct.price,
            detail: detail || oldProduct.detail,
            type: type || oldProduct.type,
            brand: brand || oldProduct.brand,
            image_url: newImagePaths.length > 0 ? newImagePaths[0] : oldProduct.image_url,
            colors: [
                {
                    color: color || oldProduct.colors[0].color,
                    images: newImagePaths
                }
            ]
        };

        // Update in all files
        productsData.products[productIndex] = updatedProduct;
        if (runningIndex !== -1) runningData.products[runningIndex] = updatedProduct;
        if (searchIndex !== -1) searchData.products[searchIndex] = updatedProduct;

        // Write all files
        writeProductsFile(productsData);
        writeRunningFile(runningData);
        writeSearchFile(searchData);

        console.log('EditProduct successfully', { id });
        res.status(200).json({ status: 'EditProduct successfully', product: updatedProduct });
    } catch (error) {
        console.error('Error editing product:', error);
        cleanupTempFiles(uploadedFiles);
        res.status(500).json({ status: 'Error editing product', message: error.message });
    }
}

function removeProduct(req, res) {
    const { id } = req.body;

    if (!id) {
        return res.status(400).json({ status: 'Product ID is required' });
    }

    try {
        // Read all product files
        let productsData = readProductsFile();
        let runningData = readRunningFile();
        let searchData = readSearchFile();

        // Find product in each file
        const productIndex = productsData.products.findIndex(p => p.id === id);
        const runningIndex = runningData.products.findIndex(p => p.id === id);
        const searchIndex = searchData.products.findIndex(p => p.id === id);

        if (productIndex === -1) {
            return res.status(404).json({ status: 'Product not found' });
        }

        // Get product to be removed for image cleanup
        const removedProduct = productsData.products[productIndex];

        // Delete associated images
        if (removedProduct.colors && removedProduct.colors.length > 0) {
            removedProduct.colors.forEach(color => {
                deleteFinalFiles(color.images);
            });
        }

        // Remove from all files
        const removedItems = productsData.products.splice(productIndex, 1);
        if (runningIndex !== -1) runningData.products.splice(runningIndex, 1);
        if (searchIndex !== -1) searchData.products.splice(searchIndex, 1);

        // Write all files
        writeProductsFile(productsData);
        writeRunningFile(runningData);
        writeSearchFile(searchData);

        console.log('RemoveProduct successfully', { id });
        res.status(200).json({ status: 'RemoveProduct successfully', removedItems });
    } catch (error) {
        console.error('Error removing product:', error);
        res.status(500).json({ status: 'Error removing product', message: error.message });
    }
}

function sizeAdd(req, res) {
    const { id, size } = req.body;

    if (!id || !size) {
        return res.status(400).json({ status: 'Product ID and size are required' });
    }

    try {
        // Read all product files
        let productsData = readProductsFile();
        let runningData = readRunningFile();
        let searchData = readSearchFile();

        // Find product in each file
        const productIndex = productsData.products.findIndex(p => p.id === id);
        const runningIndex = runningData.products.findIndex(p => p.id === id);
        const searchIndex = searchData.products.findIndex(p => p.id === id);

        if (productIndex === -1) {
            return res.status(404).json({ status: 'Product not found' });
        }

        // Check if size already exists
        if (productsData.products[productIndex].sizes.includes(size)) {
            return res.status(400).json({ status: 'Size already exists for this product' });
        }

        // Add size to all files
        productsData.products[productIndex].sizes.push(size);
        if (runningIndex !== -1) runningData.products[runningIndex].sizes.push(size);
        if (searchIndex !== -1) searchData.products[searchIndex].sizes.push(size);

        // Write all files
        writeProductsFile(productsData);
        writeRunningFile(runningData);
        writeSearchFile(searchData);

        console.log('AddSize successfully', { id, size });
        res.status(200).json({ status: 'AddSize successfully', product: productsData.products[productIndex] });
    } catch (error) {
        console.error('Error adding size:', error);
        res.status(500).json({ status: 'Error adding size', message: error.message });
    }
}

function sizeRemove(req, res) {
    const { id, size } = req.body;

    if (!id || !size) {
        return res.status(400).json({ status: 'Product ID and size are required' });
    }

    try {
        // Read all product files
        let productsData = readProductsFile();
        let runningData = readRunningFile();
        let searchData = readSearchFile();

        // Find product in each file
        const productIndex = productsData.products.findIndex(p => p.id === id);
        const runningIndex = runningData.products.findIndex(p => p.id === id);
        const searchIndex = searchData.products.findIndex(p => p.id === id);

        if (productIndex === -1) {
            return res.status(404).json({ status: 'Product not found' });
        }

        // Find size index
        const sizeIndex = productsData.products[productIndex].sizes.indexOf(size);
        if (sizeIndex === -1) {
            return res.status(404).json({ status: 'Size not found for this product' });
        }

        // Remove size from all files
        const removedSize = productsData.products[productIndex].sizes.splice(sizeIndex, 1)[0];
        if (runningIndex !== -1) {
            const runningSizeIndex = runningData.products[runningIndex].sizes.indexOf(size);
            if (runningSizeIndex !== -1) runningData.products[runningIndex].sizes.splice(runningSizeIndex, 1);
        }
        if (searchIndex !== -1) {
            const searchSizeIndex = searchData.products[searchIndex].sizes.indexOf(size);
            if (searchSizeIndex !== -1) searchData.products[searchIndex].sizes.splice(searchSizeIndex, 1);
        }

        // Write all files
        writeProductsFile(productsData);
        writeRunningFile(runningData);
        writeSearchFile(searchData);

        console.log('RemoveSize successfully', { id, size });
        res.status(200).json({ status: 'RemoveSize successfully', removedSize });
    } catch (error) {
        console.error('Error removing size:', error);
        res.status(500).json({ status: 'Error removing size', message: error.message });
    }
}

module.exports = {
    addProduct,
    editProduct,
    removeProduct,
    sizeAdd,
    sizeRemove
};