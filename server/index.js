const keys = require('./keys');

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const { Pool } = require('pg');

const pgClient = new Pool({
    user: keys.pgUser,
    host: keys.pgHost,
    database: keys.pgDatabase,
    password: keys.pgPassword,
    port: keys.pgPort,
});

pgClient.on('error', () => console.log('Lost PG connection'));

// Ensure table is created before accepting requests
const initDatabase = async () => {
    let retries = 5;
    while (retries) {
        try {
            await pgClient.query('CREATE TABLE IF NOT EXISTS values (number INT)');
            console.log('Created values table');
            break;
        } catch (err) {
            console.error('Error creating table', err);
            retries -= 1;
            console.log(`Retries left: ${retries}`);
            // wait 5 seconds
            await new Promise(res => setTimeout(res, 5000));
        }
    }
};

// Initialize the database
initDatabase();

const redis = require('redis');
const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000,
});
const redisPublisher = redisClient.duplicate();

app.get('/', (req, res) => {
    res.send("Hi");
});

app.get('/values/all', async (req, res) => {
    try {
        const values = await pgClient.query('SELECT * FROM values');
        res.send(values.rows);
    } catch (err) {
        console.error('Error fetching values:', err);
        res.status(500).json({ error: 'Error fetching values from database' });
    }
});

app.get('/values/current', async (req, res) => {
    redisClient.hgetall('values', (err, values) => {
        res.send(values);
    });
});

app.post('/values', async (req, res) => {
    const index = req.body.index;

    if (parseInt(index) > 40) {
        return res.status(422).send('Index too high');
    }

    redisClient.hset('values', index, 'Nothing yet!');
    redisPublisher.publish('insert', index);
    pgClient.query('INSERT INTO values(number) VALUES($1)', [index]);

    res.send({ working: true });
});

app.listen(5000, err => {
    console.log('Listening on port 5000');
});