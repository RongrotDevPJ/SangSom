const fs = require('fs');
const path = require('path');

function addCart(req, res) {
    const { email, item, size } = req.body;

    const filePath = path.join(__dirname, "..", "data", "cart.json");
    const filePathUser = path.join(__dirname, "..", "data", "user.json");
    let users = [];
    let usersfile = [];

    if (fs.existsSync(filePathUser)) {
        let dataUsers = fs.readFileSync(filePathUser, "utf-8");
        usersfile = JSON.parse(dataUsers);
        let userNum1 = -1;
        for (let i = 0; i <= usersfile.length; i++) {
            if (usersfile[i] && usersfile[i].email === email) {
                userNum1 = i;
                break;
            }
        }
        if (userNum1 == -1) {
            console.log('AddCart NOTHave Email', { email });
            res.status(400).json({ status: 'AddCart NOTHave Email', email })
        } else {
            if (fs.existsSync(filePath)) {
                let data = fs.readFileSync(filePath, "utf-8");
                let userCart = JSON.parse(data);
                let userNum2 = -1;

                for (let i = 0; i < userCart.length; i++) {
                    if (userCart[i] && userCart[i].email === email) {
                        userNum2 = i;
                        break;
                    }
                }
                if (userNum2 == -1) {
                    users = JSON.parse(data);
                    const user = {
                        "email": email, "carts": [
                            {
                                "item": item,
                                "size": size,
                                "amount": 1
                            }
                        ]
                    }
                    users.push(user);
                    fs.writeFileSync(filePath, JSON.stringify(users, null, 2));
                    console.log('AddCart successfully', { email });
                    res.status(200).json({ status: 'AddCart successfully', user })
                } else {
                    users = JSON.parse(data);
                    let currentUser = users[userNum2];
                    let itemInCart = currentUser.carts.find(cartItem => cartItem.item === item);
                    let sizeInCart = currentUser.carts.find(cartSize => cartSize.size === size);
                    if (itemInCart && sizeInCart) {
                        //sizeInCart.amount++;
                        currentUser.carts = currentUser.carts.map(cartItem => {
                            if (cartItem.item === item && cartItem.size === size) {
                                cartItem.amount++;
                            }
                            return cartItem;
                        })
                    } else {
                        currentUser.carts.push(
                            {
                                item: item,
                                size: size,
                                amount: 1
                            }
                        )
                    }
                    const user = users[userNum2];
                    fs.writeFileSync(filePath, JSON.stringify(users, null, 2));
                    console.log('AddCart successfully', { email });
                    res.status(200).json({ status: 'AddCart successfully', user })
                    // let cart=0;
                    // for(let i=1;i<=users[userNum].length-1;i++){
                    //     if(users[userNum].i.item === item){
                    //         cart = i;
                    //     }
                    // }
                    // if(cart ==0){

                    // } else{
                    //     users[userNum].cart.amount = users[userNum].cart.amount++;
                    // }
                }
            } else {
                const user = {
                    "email": email, "carts": [
                        {
                            "item": item,
                            "size": size,
                            "amount": 1
                        }
                    ]
                }
                users.push(user)
                fs.writeFileSync(filePath, JSON.stringify(users, null, 2));
                console.log('AddCart successfully', { email });
                res.status(200).json({ status: 'AddCart successfully', user })
            }
        }
    } else {
        console.log('AddCart Error', { email });
        res.status(400).json({ status: 'AddCart Error', email })
    }

    // if (fs.existsSync(filePath)) {
    //     let data = fs.readFileSync(filePath, "utf-8");
    //     let userNum = -1;
    //     for (let i = 0; i < data.length; i++) {
    //         if (data.email = email) {
    //             userNum = i;
    //             break;
    //         }
    //     }
    //     if (userNum == -1) {
    //         users = JSON.parse(data);
    //     }
    // } else {
    //     const user = {
    //         email, "cart": {
    //             "item": item,
    //             "amount": 1
    //         }
    //     }
    //     users.push(user)
    //     fs.writeFileSync(filePath, JSON.stringify(users, null, 2));
    //     console.log('AddCart successfully', { email });
    //     res.status(200).json({ status: 'AddCart successfully', user })
    // }
    /*const user = {
        email, status, cart
    }*/
}

function removeCart(req, res) {
    const { email, item, size } = req.body;

    const filePath = path.join(__dirname, "..", "data", "cart.json");
    const filePathUser = path.join(__dirname, "..", "data", "user.json");
    let users = [];
    let usersfile = [];

    if (fs.existsSync(filePathUser)) {
        let dataUsers = fs.readFileSync(filePathUser, "utf-8");
        usersfile = JSON.parse(dataUsers);
        let userNum1 = -1;
        for (let i = 0; i <= usersfile.length; i++) {
            if (usersfile[i] && usersfile[i].email === email) {
                userNum1 = i;
                break;
            }
        }
        if (userNum1 == -1) {
            console.log('removeCart NOTHave Email', { email });
            res.status(400).json({ status: 'removeCart NOTHave Email', email })
        } else {
            if (fs.existsSync(filePath)) {
                let data = fs.readFileSync(filePath, "utf-8");
                let userCart = JSON.parse(data);
                let userNum2 = -1;
                for (let i = 0; i < userCart.length; i++) {
                    if (userCart[i] && userCart[i].email === email) {
                        userNum2 = i;
                        break;
                    }
                }
                if (userNum2 == -1) {
                    console.log('removeCart NOTHave Email', { email });
                    res.status(400).json({ status: 'removeCart NOTHave Email', email })
                } else {
                    users = JSON.parse(data);
                    let currentUser = users[userNum2];
                    let itemInCart = currentUser.carts.find(cartItem => cartItem.item === item);
                    let sizeInCart = currentUser.carts.find(cartSize => cartSize.size === size);
                    if (itemInCart && sizeInCart) {
                        currentUser.carts = currentUser.carts.map(cartItem => {
                            if (cartItem.item === item && cartItem.size === size) {
                                cartItem.amount--;
                            }
                            return cartItem;
                        }).filter(cartItem => cartItem.amount > 0);
                        let user = currentUser;
                        fs.writeFileSync(filePath, JSON.stringify(users, null, 2));
                        console.log('removeCart successfully', { email });
                        res.status(200).json({ status: 'removeCart successfully', user })
                    } else {
                        console.log('removeCart NOTHave Item', { email });
                        res.status(400).json({ status: 'removeCart NOTHave Item', email })
                    }
                }
            } else {
                console.log('removeCart NOTHave Email', { email });
                res.status(400).json({ status: 'removeCart NOTHave Email', email })
            }
        }
    } else {
        console.log('removeCart Error', { email });
        res.status(400).json({ status: 'removeCart Error', email })
    }
}

module.exports = {
    addCart,
    removeCart
};