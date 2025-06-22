const fs = require('fs');
const path = require('path');

const productFilePath = path.join(__dirname, "..", "data", "product.json");
const finalUploadDir = path.join(__dirname, '..', 'uploads'); // Reference to final upload directory

// Helper function to clean up temporary uploaded files
function cleanupTempFiles(files) {
    if (files && files.length > 0) {
        files.forEach(file => {
            const tempFilePath = file.path; // Multer provides the full path in file.path
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
            // Ensure the path starts with /uploads/ for security and consistency
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

function addProduct(req, res) {
    const { id, name, price, detail, type, size, onShop } = req.body;
    // req.files will contain an array of uploaded image files
    //const imgPaths = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];
    const uploadedFiles = req.files; // Get the array of uploaded files from Multer

    let on_off;
    if (onShop === 'true' || onShop === true) {
        on_off = true;
    } else if (onShop === 'false' || onShop === false) {
        on_off = false;
    }

    // Ensure onShop is a boolean
    const product = {
        id,
        name,
        img: [],
        price,
        detail,
        type,
        sizes: {
            size: size,
            onShop: on_off
        }
    };

    const filePath = path.join(__dirname, "..", "data", "product.json");
    let products = [];

    if (fs.existsSync(filePath)) {
        if (on_off === true || on_off === false) {
            let dataProduct = fs.readFileSync(filePath, "utf-8");
            products = JSON.parse(dataProduct);
            let findId = -1;
            for (let i = 0; i < products.length; i++) {
                if (products[i].id == id) {
                    findId = i;
                    break;
                }
            }
            if (findId == -1) {
                // If all validations pass, move files to final destination and prepare product data
                const imgPaths = [];
                if (uploadedFiles && uploadedFiles.length > 0) {
                    uploadedFiles.forEach(file => {
                        const oldPath = file.path; // Path in temp_uploads
                        const newFilename = path.basename(file.path); // Just the filename
                        const newPath = path.join(finalUploadDir, newFilename); // Path in final uploads

                        try {
                            fs.renameSync(oldPath, newPath); // Move the file
                            imgPaths.push(`/uploads/${newFilename}`); // Store the public path
                        } catch (error) {
                            console.error(`Error moving file ${oldPath} to ${newPath}:`, error);
                            // If a file move fails, clean up all files that were successfully moved so far
                            cleanupTempFiles(uploadedFiles.filter(f => f.path !== oldPath)); // Clean up remaining temp files
                            imgPaths.forEach(movedPath => { // Clean up already moved files if an error occurs
                                const fullMovedPath = path.join(__dirname, '..', movedPath);
                                if (fs.existsSync(fullMovedPath)) {
                                    fs.unlinkSync(fullMovedPath);
                                }
                            });
                            return res.status(500).json({ status: "Server error: Could not save all product images." });
                        }
                    });
                }

                const product = {
                    id,
                    name,
                    img: imgPaths, // Store the paths to the final uploaded images
                    price,
                    detail,
                    type,
                    sizes: {
                        size: size,
                        onShop: on_off
                    }
                };

                products.push(product)
                fs.writeFileSync(filePath, JSON.stringify(products, null, 2));
                console.log('AddProduct successfully', { id });
                res.status(200).json({ status: 'AddProduct successfully', product })
            } else {
                console.log('AddProduct idsame error', { id });
                res.status(400).json({ status: 'AddProduct idsame error', product })
            }

        } else {
            console.log('AddProduct onShop error', { id });
            res.status(400).json({ status: 'AddProduct onShop error', product })
        }
    } else {
        if (on_off === true || on_off === false) {
            products.push(product)
            fs.writeFileSync(filePath, JSON.stringify(products, null, 2));
            console.log('AddProduct successfully', { id });
            res.status(200).json({ status: 'AddProduct successfully', product })
        } else {
            console.log('AddProduct onShop error', { id });
            res.status(400).json({ status: 'AddProduct onShop error', product })
        }
    }
}

function editProduct(req, res) {
    const { id, name, price, detail, type } = req.body;
    const uploadedFiles = req.files; // New uploaded files (from temp_uploads)

    const filePath = path.join(__dirname, "..", "data", "product.json");
    let products = [];

    // let on_off;
    // if (onShop === 'true' || onShop === true) {
    //     on_off = true;
    // } else if (onShop === 'false' || onShop === false) {
    //     on_off = false;
    // }

    if (fs.existsSync(filePath)) {
        let dataProduct = fs.readFileSync(filePath, "utf-8");
        products = JSON.parse(dataProduct);
        let findId = -1;
        for (let i = 0; i < products.length; i++) {
            if (products[i].id == id) {
                findId = i;
                break;
            }
        }
        const oldProduct = products[findId];
        let newImgPaths = [];
        if (findId == -1) {
            console.log('AddProduct NotHaveId error', { id });
            res.status(400).json({ status: 'AddProduct NotHaveId error', oldProduct })
        } else {
            if (uploadedFiles && uploadedFiles.length > 0) {
                // Case 1: New images are uploaded
                // Move new files from temp_uploads to uploads
                for (const file of uploadedFiles) {
                    const oldPath = file.path;
                    const newFilename = path.basename(file.path);
                    const newPath = path.join(finalUploadDir, newFilename);
                    try {
                        fs.renameSync(oldPath, newPath);
                        newImgPaths.push(`/uploads/${newFilename}`);
                    } catch (error) {
                        console.error(`Error moving new file ${oldPath} to ${newPath} during edit:`, error);
                        // Clean up any files that were already moved
                        deleteFinalFiles(newImgPaths); // Delete newly moved files if error occurs
                        cleanupTempFiles(uploadedFiles.filter(f => f.path !== oldPath)); // Delete remaining temp files
                        return res.status(500).json({ status: "Server error: Could not save all new product images during edit." });
                    }
                }
                // Delete old images associated with this product
                deleteFinalFiles(oldProduct.img);
            } else if (req.body.img) {
                // Case 2: No new files uploaded, but img paths are sent in req.body
                // This means the client might have sent back the original paths, or changed some of them
                // Ensure req.body.img is an array of strings
                if (!Array.isArray(req.body.img)) {
                    // If it's a single string, make it an array
                    if (typeof req.body.img === 'string') {
                        newImgPaths = [req.body.img];
                    } else {
                        console.log('EditProduct img format error: img must be an array or string of paths.', { id });
                        return res.status(400).json({ status: 'EditProduct img format error', product: { id } });
                    }
                } else {
                    newImgPaths = req.body.img;
                }

                // Compare old paths with new paths and delete old files that are no longer needed
                const oldPathsToDelete = oldProduct.img.filter(oldPath => !newImgPaths.includes(oldPath));
                deleteFinalFiles(oldPathsToDelete);

            } else {
                // Case 3: No new files uploaded and no img paths in req.body, keep old images
                newImgPaths = oldProduct.img;
            }

            const updatedProduct = {
                id,
                name: name || oldProduct.name, // Keep old name if not provided
                img: newImgPaths,
                price: price || oldProduct.price,
                detail: detail || oldProduct.detail,
                type: type || oldProduct.type,
                sizes: oldProduct.sizes
            };

            products[findId] = updatedProduct;
            fs.writeFileSync(filePath, JSON.stringify(products, null, 2));
            console.log('EditProduct successfully', { id });
            res.status(200).json({ status: 'EditProduct successfully', updatedProduct })
        }
    } else {
        console.log('EditProduct NotHaveFile error', { id });
        res.status(400).json({ status: 'EditProduct NotHaveFile error', oldProduct })
    }
}

function removeProduct(req, res) {
    const { id } = req.body;

    const filePath = path.join(__dirname, "..", "data", "product.json");
    let products = [];

    if (fs.existsSync(filePath)) {
        let dataProduct = fs.readFileSync(filePath, "utf-8");
        products = JSON.parse(dataProduct);
        let findId = -1;
        for (let i = 0; i < products.length; i++) {
            if (products[i].id == id) {
                findId = i;
                break;
            }
        }
        if (findId == -1) {
            console.log('RemoveProduct NotHaveId error', { id });
            res.status(400).json({ status: 'RemoveProduct NotHaveId error', id })
        } else {
            // ดึงข้อมูลสินค้าที่กำลังจะถูกลบ
            const removedProduct = products[findId];

            // ลบไฟล์รูปภาพที่เกี่ยวข้องออกไป
            if (removedProduct && Array.isArray(removedProduct.img)) {
                deleteFinalFiles(removedProduct.img);
            }

            // ลบข้อมูลสินค้าออกจาก Array
            const removedItems = products.splice(findId, 1);

            // บันทึกไฟล์ JSON ที่อัปเดตแล้ว
            fs.writeFileSync(filePath, JSON.stringify(products, null, 2));
            console.log('RemoveProduct successfully', { id });
            res.status(200).json({ status: 'RemoveProduct successfully', removedItems })
        }
    } else {
        console.log('RemoveProduct NotHaveFile error', { id });
        res.status(400).json({ status: 'RemoveProduct NotHaveFile error', id })
    }
}

function sizeAdd(req, res) {
    const { id, size, onShop } = req.body;

    let on_off;
    if (onShop === 'true' || onShop === true) {
        on_off = true;
    } else if (onShop === 'false' || onShop === false) {
        on_off = false;
    }
    const product = {
        size: size,
        onShop: on_off
    };

    const filePath = path.join(__dirname, "..", "data", "product.json");
    let products = [];
    if (fs.existsSync(filePath)) {
        let dataProduct = fs.readFileSync(filePath, "utf-8");
        products = JSON.parse(dataProduct);
        let findId = -1;
        for (let i = 0; i < products.length; i++) {
            if (products[i].id == id) {
                findId = i;
                break;
            }
        }
        if (findId == -1) {
            console.log('AddSize NotHaveId error', { id });
            res.status(400).json({ status: 'AddSize NotHaveId error', id })
        } else {
            let sizeSame = -1;
            for (let i = 0; i < products[findId].sizes.length; i++) {
                if (products[findId].sizes[i].size == size) {
                    sizeSame = i;
                    break;
                }
            }
            //console.log(sizeSame);
            if (sizeSame == -1) {
                products[findId].sizes.push(product);
                fs.writeFileSync(filePath, JSON.stringify(products, null, 2));
                console.log('AddSize successfully', { id });
                res.status(200).json({ status: 'AddSize successfully', product })
            } else {
                products[findId].sizes[sizeSame] = product;
                fs.writeFileSync(filePath, JSON.stringify(products, null, 2));
                console.log('AddSize successfully', { id });
                res.status(200).json({ status: 'AddSize successfully', product })
            }

        }
    } else {
        console.log('AddSize NotHaveFile error', { id });
        res.status(400).json({ status: 'AddSize NotHaveFile error', id })
    }
}

function sizeRemove(req, res) {
    const { id, size } = req.body;

    const filePath = path.join(__dirname, "..", "data", "product.json");
    let products = [];
    if (fs.existsSync(filePath)) {
        let dataProduct = fs.readFileSync(filePath, "utf-8");
        products = JSON.parse(dataProduct);
        let findId = -1;
        for (let i = 0; i < products.length; i++) {
            if (products[i].id == id) {
                findId = i;
                break;
            }
        }
        if (findId == -1) {
            console.log('RemoveSize NotHaveId error', { id });
            res.status(400).json({ status: 'RemoveSize NotHaveId error', id })
        } else {
            let sizeSame = -1;
            for (let i = 0; i < products[findId].sizes.length; i++) {
                if (products[findId].sizes[i].size == size) {
                    sizeSame = i;
                    break;
                }
            }
            if (sizeSame == -1) {
                console.log('RemoveSize SizeNotFind error', { id });
                res.status(400).json({ status: 'RemoveSize SizeNotFind error', id, size })
            } else {
                //products[findId].sizes[sizeSame] = product;
                const removedSizes = products[findId].sizes.splice(sizeSame, 1);
                fs.writeFileSync(filePath, JSON.stringify(products, null, 2));
                console.log('RemoveSize successfully', { id });
                res.status(200).json({ status: 'RemoveSize successfully', removedSizes })
            }
        }
    } else {
        console.log('RemoveSize NotHaveFile error', { id });
        res.status(400).json({ status: 'RemoveSize NotHaveFile error', id })
    }
}

module.exports = {
    addProduct,
    editProduct,
    removeProduct,
    sizeAdd,
    sizeRemove
}