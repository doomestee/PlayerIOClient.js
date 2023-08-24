require("dotenv").config();

let email = process.env.EMAIL;
let password = process.env.PASSWORD;

let PlayerIO = require("../index.js");

PlayerIO.QuickConnect.simpleConnect(process.env.GAMEID, email, password)
    .then(v  => {
        console.log(v.connectUserId);

        v.payVault.refresh()
            .then(g => console.log(v.payVault.items));
    })