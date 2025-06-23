const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs'); // ตรวจสอบให้แน่ใจว่าได้ require 'bcryptjs' แล้ว

const usersFilePath = path.join(__dirname, "..", "data", "user.json");

function readUsersFile() {
    try {
        if (fs.existsSync(usersFilePath)) {
            const data = fs.readFileSync(usersFilePath, "utf-8");
            if (data) { // เพิ่มการตรวจสอบว่ามีข้อมูลในไฟล์หรือไม่
                return JSON.parse(data);
            }
        }
        return []; // ถ้าไฟล์ไม่มี หรือว่างเปล่า ให้คืนค่าเป็น Array ว่าง
    } catch (error) {
        // หากไฟล์มีปัญหาแต่ไม่ว่างเปล่า เช่น JSON format ผิด
        console.error("Error reading users file, returning empty array:", error.message);
        return [];
    }
}

function writeUsersFile(users) {
    try {
        fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
    } catch (error) {
        console.error("Error writing users file:", error);
    }
}

async function login(req, res) {
    const { email, password } = req.body;
    let users = readUsersFile();

    const foundUser = users.find(u => u.email === email);

    if (!foundUser) {
        console.log('Login failed: Email not found', { email });
        return res.status(400).json({ status: 'Email not found', email });
    }

    try {
        // เปรียบเทียบรหัสผ่านที่ผู้ใช้ป้อนกับรหัสผ่านที่ถูก hash ไว้
        const isMatch = await bcrypt.compare(password, foundUser.password);

        if (isMatch) {
            console.log('Login successfully', { email });
            // ไม่ควรส่ง password กลับไปที่ client
            return res.status(200).json({ status: 'Login successfully', user: { email: foundUser.email, fname: foundUser.fname, lname: foundUser.lname } });
        } else {
            console.log('Incorrect Password', { email });
            return res.status(401).json({ status: 'Incorrect Password', email });
        }
    } catch (error) {
        console.error('Error during password comparison:', error);
        return res.status(500).json({ status: 'Internal server error during login' });
    }
}

async function register(req, res) {
    const { fname, lname, email, password } = req.body;

    try {
        let users = readUsersFile(); // ใช้ helper function

        // ตรวจสอบอีเมลซ้ำ
        const emailExists = users.some(existingUser => existingUser.email === email);

        if (emailExists) {
            console.log('This email has already been used', { email });
            return res.status(409).json({ status: 'This email has already been used', user: { email } });
        }

        // *** นี่คือส่วนสำคัญ: Hash รหัสผ่านก่อนบันทึก ***
        const hashedPassword = await bcrypt.hash(password, 10); // 10 คือ saltRounds แนะนำ 10-12

        const newUser = {
            userAt: new Date().toISOString(),
            fname,
            lname,
            email,
            password: hashedPassword // บันทึกรหัสผ่านที่ถูก Hash แล้ว
        };

        // เพิ่มผู้ใช้ใหม่
        users.push(newUser);
        writeUsersFile(users); // ใช้ helper function

        console.log('Register successfully', { email });
        // ไม่ควรส่ง password (hashed หรือไม่ hashed) กลับไปที่ client
        return res.status(201).json({ status: 'Register successfully', user: { email: newUser.email, fname: newUser.fname, lname: newUser.lname } });

    } catch (error) {
        console.error('Error during registration:', error);
        return res.status(500).json({ status: 'An error occurred during registration', error: error.message });
    }
}

module.exports = {
    login,
    register
};