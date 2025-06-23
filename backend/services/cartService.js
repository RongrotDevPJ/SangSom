const fs = require('fs');
const path = require('path');

const cartsFilePath = path.join(__dirname, "..", "data", "cart.json");
const usersFilePath = path.join(__dirname, "..", "data", "user.json"); // เพิ่ม path สำหรับ user.json

// Helper function to read carts data
function readCartsFile() {
    try {
        const data = fs.readFileSync(cartsFilePath, "utf-8");
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return []; // Return empty array if file does not exist
        }
        throw error;
    }
}

// Helper function to write carts data
function writeCartsFile(carts) {
    fs.writeFileSync(cartsFilePath, JSON.stringify(carts, null, 2));
}

// Helper function to read users data (used for validation)
function readUsersFile() {
    try {
        const data = fs.readFileSync(usersFilePath, "utf-8");
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return [];
        }
        throw error;
    }
}

function addCart(req, res) {
    const { email, productID, name, price, size, img } = req.body; // เปลี่ยน item เป็น productID เพื่อความชัดเจน

    if (!email || !productID || !name || !price || !size || !img) {
        return res.status(400).json({ status: 'Missing required fields' });
    }

    try {
        let users = readUsersFile();
        const userExists = users.some(u => u.email === email);
        if (!userExists) {
            console.log('AddCart: Email not found', { email });
            return res.status(400).json({ status: 'AddCart NOTHave Email', email });
        }

        let carts = readCartsFile();
        let currentUserCart = carts.find(cart => cart.email === email);

        if (!currentUserCart) {
            currentUserCart = { email, carts: [] };
            carts.push(currentUserCart);
        }

        const existingItem = currentUserCart.carts.find(
            item => item.productID === productID && item.size === size
        );

        if (existingItem) {
            existingItem.quantity = (existingItem.quantity || 1) + 1;
            existingItem.totalPrice = parseFloat(existingItem.price) * existingItem.quantity;
        } else {
            currentUserCart.carts.push({
                productID,
                name,
                img,
                price: parseFloat(price),
                size,
                quantity: 1,
                totalPrice: parseFloat(price)
            });
        }

        writeCartsFile(carts);
        console.log('addCart successfully', { email, productID, size });
        res.status(200).json({ status: 'addCart successfully', userCart: currentUserCart });

    } catch (error) {
        console.error('addCart Error:', error);
        res.status(500).json({ status: 'addCart Error', message: error.message });
    }
}

function removeCart(req, res) {
    const { email, productID, size } = req.body; // เปลี่ยน item เป็น productID เพื่อความชัดเจน

    if (!email || !productID || !size) {
        return res.status(400).json({ status: 'Missing required fields' });
    }

    try {
        let carts = readCartsFile();
        let currentUserCartIndex = carts.findIndex(cart => cart.email === email);

        if (currentUserCartIndex === -1) {
            console.log('removeCart: User cart not found', { email });
            return res.status(400).json({ status: 'User cart not found', email });
        }

        let currentUserCart = carts[currentUserCartIndex];
        const itemIndex = currentUserCart.carts.findIndex(
            item => item.productID === productID && item.size === size
        );

        if (itemIndex === -1) {
            console.log('removeCart: Item not found in cart', { email, productID, size });
            return res.status(400).json({ status: 'Item not found in cart', email, productID, size });
        }

        let itemToRemove = currentUserCart.carts[itemIndex];

        if (itemToRemove.quantity > 1) {
            itemToRemove.quantity--;
            itemToRemove.totalPrice = parseFloat(itemToRemove.price) * itemToRemove.quantity;
        } else {
            currentUserCart.carts.splice(itemIndex, 1);
        }

        // If the user's cart becomes empty, remove the entire cart object for that user
        if (currentUserCart.carts.length === 0) {
            carts.splice(currentUserCartIndex, 1);
        }

        writeCartsFile(carts);
        console.log('removeCart successfully', { email, productID, size });
        res.status(200).json({ status: 'removeCart successfully', userCart: currentUserCart });

    } catch (error) {
        console.error('removeCart Error:', error);
        res.status(500).json({ status: 'removeCart Error', message: error.message });
    }
}

module.exports = {
    addCart,
    removeCart
};