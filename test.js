const express = require('express');
const path = require('path');
const webrepl = require('./main.js');

var app = express();
var router = express.Router();

function test1 () { 
    return "this [is an] example"; 
}

function test2 () { 
    return "version: " + require(path.join(__dirname,"package.json")).version;
}

async function test3 () {
    await Promise.reject();
}

async function test4 () {
    await Promise.reject({"test":"tree"});
}

function test5 (inp) {
    return inp;
}

let context = { 
    result: "42", 
    test1: test1,
    test2: test2,
    test3: test3,
    test4: test4,
    test5: test5
};

let vm = webrepl(router, {
    timeout: 1000,
    sandbox: context
});

app.use("/terminal", router);

app.listen(8081);

// http://localhost:8081/terminal/

