const { client } = require("../config/redisConfig");

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

module.exports = {
    saveArrayToRedis,
    getArrayFromRedis
};