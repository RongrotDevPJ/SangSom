function addProduct(req, res) {
    const { name, price, detail, type, sizes, brand, gender, color } = req.body; // เพิ่ม brand, gender, color
    // ... (โค้ดเดิม) ...

    if (!name || !price || !detail || !type || !sizes || !brand || !gender || !color) { // เพิ่มการตรวจสอบ
        // cleanupTempFiles(req.files); // อย่าลืม cleanup ไฟล์ที่อัปโหลดไปแล้วหากเกิด error
        return res.status(400).json({ status: 'Missing required product fields' });
    }

    // ... (โค้ดเดิม) ...
    const newProduct = {
        id: newProductId.toString(),
        name,
        img: imagePaths,
        price,
        detail,
        type,
        brand, // เพิ่ม brand
        gender, // เพิ่ม gender
        color, // เพิ่ม color
        sizes: parsedSizes // ตรวจสอบว่า `sizes` ถูกแปลงจาก JSON string แล้ว
    };
    // ... (โค้ดเดิม) ...
}