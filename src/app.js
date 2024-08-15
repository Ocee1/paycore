const express = require("express");
const { DATABASE_HOST, DATABASE_PORT, SERVER_PORT } = require("./config/index.js");

console.log(DATABASE_HOST)
const PORT = SERVER_PORT;

const createServer = async () => {
    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    })
}
createServer();