const Pool = require('pg').Pool
const pool = new Pool({
    user: 'pwmcqpcwjygpqk',
    host: '    ec2-34-255-225-151.eu-west-1.compute.amazonaws.com',
    database: 'dcvigboa8a7tih',
    password: '985d104d09287e6836405d451ca70b6829b50f63089e3a06e093da8e449fbf11',
    port: 5432,});

module.exports = { pool };