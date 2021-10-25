const fs = require("fs");
const { resolve } = require("path");
const cors = require("cors");
const express = require("express");

process.env.NODE_ENV = process.argv.includes("--dev") ? "development" : "production";

const app = express();
app.use(cors());
app.use("/", express.static(__dirname + "/dist"));
app.listen(80, () => {
    console.log("Dev server!");
    if(process.env.NODE_ENV === "development") {
        require("./webpack");
    }
})

app.get("*", (req, res) => {
    res.sendFile(`${__dirname}/dist/index.html`);
})