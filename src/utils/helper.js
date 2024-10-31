const { client } = require("../config/redisConfig");
// const util = require('util');

const saveArrayToRedis = async (key, array) => {
    try {
        const reply = await client.set(key, JSON.stringify(array));
        console.log(`Array saved as string in Redis: ${reply}`);
    } catch (err) {
        console.error('Error saving array to Redis:', err);
    }
};

// Function to retrieve the array from Redis
const getArrayFromRedis = async (key) => {
    try {
        const reply = await client.get(key);
        const retrievedArray = JSON.parse(reply);
        console.log('Retrieved array from Redis:', retrievedArray);
        return retrievedArray;
    } catch (err) {
        console.error('Error retrieving array from Redis:', err);
        return null;
    }
};



// Promisify Redis commands for better async/await handling
const sAddAsync = async (key, data) => {
    try {
        const result = await client.sAdd(key, data)
        return result;
    } catch (err) {
        console.error('Error retrieving array from Redis:', err);
        return null;
    }
}

const sIsMemberAsync = async (key) => {
    try {
        const result = await client.sIsMember(key);
        return result;
    } catch (err) {
        console.error('Error retrieving bulk from Redis:', err);
        return null;
    }
}

module.exports = {
    saveArrayToRedis,
    getArrayFromRedis,
    sAddAsync,
    sIsMemberAsync
};