const { Pool } = require('pg');

const pool = new Pool({
    user: 'fmbmjrhrwsipvv',
    host: 'ec2-63-34-153-52.eu-west-1.compute.amazonaws.com',
    database: 'dbo87n19ul54rf',
    password: 'fb5097b83f2bd8f88b21557b7f53300c90f35dbac2e8cd9c63d0d5d528650593',
    port: 5432,
    ssl: {
        rejectUnauthorized: false,
    }
});

module.exports = { pool };