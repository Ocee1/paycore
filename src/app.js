import express from "express";
import { DATABASE_HOST, DATABASE_PORT } from "./config/index.js";

console.log(DATABASE_HOST)
const PORT = DATABASE_PORT;

const createServer = async () => {
    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    })
}
createServer();