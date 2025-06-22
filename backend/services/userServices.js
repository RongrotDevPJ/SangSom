const fs = require('fs');
const path = require('path');

function login(req, res) {
    const { email, password } = req.body;
    const user = {
        userAt: new Date(), email, password
    }

    const filePath = path.join(__dirname, "..", "data", "user.json");
    //step 1 - 2 : read the existing file an parse it into an arry
    let users = [];
    let emailDupli = false;
    let passDupli = false;

    if (fs.existsSync(filePath)) {
        let data = fs.readFileSync(filePath, "utf-8");
        users = JSON.parse(data);
        for (let i = 0; i <= users.length; i++) {
            if (users[i] && users[i].email === user.email) {
                emailDupli = true;
                break;
            }
        }
        for (let i = 0; i <= users.length; i++) {
            if (users[i] && users[i].password === user.password) {
                passDupli = true;
                break;
            }
        }
        if (emailDupli == true) {
            if (passDupli == false) {
                console.log('Incorrected Password', { email });
                res.status(200).json({ status: 'Incorrected Password', user })
            } else {
                console.log('Login successfully', { email });
                res.status(200).json({ status: 'Login successfully', email })
            }
        } else {
            console.log('Incorrected Username', { email });
            res.status(200).json({ status: 'Incorrected Username', user })
        }

    } else {
        console.log('Login error', { email });
        res.status(400).json({ status: 'Login fail', user })
    }

    // console.log('Content form summited', {email});
    // res.status(200).json({message : 'Email Received'});
}

function register(req, res) {
    const { fname, lname, email, password } = req.body;
    const user = {
        userAt: new Date(), fname, lname, email, password
    }

    const filePath = path.join(__dirname, "..", "data", "user.json");
    //step 1 - 2 : read the existing file an parse it into an arry
    let users = [];
    let emailDupli = false;

    if (fs.existsSync(filePath)) {
        let data = fs.readFileSync(filePath, "utf-8");
        users = JSON.parse(data);
        for (let i = 0; i <= users.length; i++) {
            if (users[i] && users[i].email === user.email) {
                emailDupli = true;
                break;
            }
        }
        if (emailDupli == false) {
            //step 3 : append new data
            users.push(user)
            //step 4 : write array back into file
            fs.writeFileSync(filePath, JSON.stringify(users, null, 2));
            console.log('Register successfully', { email });
            res.status(200).json({ status: 'Register successfully', user })
        } else {
            console.log('This email has already been used', { email });
            res.status(200).json({ status: 'This email has already been used', user })
        }

    } else {
        users.push(user)
        fs.writeFileSync(filePath, JSON.stringify(users, null, 2));
        console.log('Register successfully', { email });
        res.status(200).json({ status: 'Register successfully', user })
    }

    // console.log('Content form summited', {email});
    // res.status(200).json({message : 'Email Received'});
}

module.exports = {
    login,
    register
};