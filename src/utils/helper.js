const { client } = require("../config/redisConfig");
// const util = require('util');

const saveArrayToRedis = async (key, array) => {
    try {
        const reply = await client.set(key, JSON.stringify(array));
        return reply;
    } catch (err) {
        console.error('Error saving array to Redis:', err);
    }
};

const addItemToRedisList = async (key, newItem) => {
    try {
        // Retrieve the current array from Redis
        const reply = await client.get(key);
        let array = JSON.parse(reply) || []; 

        // Add new item to the array
        array.push(newItem);

        // Save the updated array back to Redis
        await saveArrayToRedis(key, array);
    } catch (err) {
        console.error('Error adding item to Redis list:', err);
    }
};

// Function to retrieve the array from Redis
const getArrayFromRedis = async (key) => {
    try {
        const reply = await client.get(key);
        const retrievedArray = JSON.parse(reply);
        return retrievedArray;
    } catch (err) {
        console.error('Error retrieving array from Redis:', err);
        return null;
    }
};



// Promisify Redis commands for better async/await handling
const sAddAsync = async (key, data) => {
    try {
        const result = await client.sAdd(key, [data.toString()])
        return result;
    } catch (err) {
        console.error('Error adding bulk key to redis:', err.message);
        return null;
    }
}

const sIsMemberAsync = async (key, member) => {
    try {
        const result = await client.sIsMember(key, member.toString());
        return result;
    } catch (err) {
        console.error('Error retrieving bulk id from Redis:', err.message);
        return null;
    }
}

module.exports = {
    saveArrayToRedis,
    getArrayFromRedis,
    sAddAsync,
    sIsMemberAsync,
    addItemToRedisList
};