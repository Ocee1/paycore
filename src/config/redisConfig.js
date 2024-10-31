const Redis = require('ioredis');
const { createClient } = require('redis');
const client = createClient();
const redisConnection = new Redis({
    host: "localhost",
    port: 6379,
});


async function connectRedis() {
    // Handle Redis connection event
    client.on('connect', () => {
        console.log('Connected to Redis...');
    });

    // Handle Redis error event
    client.on('error', (error) => {
        console.error('Redis client error:', error);
    });

    // Attempt to connect to Redis
    try {
        await client.connect();
        console.log('Redis connection successful!!');
    } catch (error) {
        console.error('Error connecting to Redis:', error);
    }
}

module.exports = {redisConnection, connectRedis, client};
