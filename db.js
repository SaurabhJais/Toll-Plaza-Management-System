var mysql = require('mysql2');

var con = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "Saurabh@123",
    database: "tpms"
});


con.query(`CREATE TABLE IF NOT EXISTS users (id VARCHAR(255) , fullname VARCHAR(255), mobileNumber VARCHAR(255), emailAddress VARCHAR(255), age VARCHAR(255), password VARCHAR(255), balance INT, PRIMARY KEY(id))`, (err, res) => {
    if (err)
        console.log(err)
})

con.query(`CREATE TABLE IF NOT EXISTS transcations (id INT AUTO_INCREMENT, amount VARCHAR(255), message VARCHAR(255), time_stamp VARCHAR(255), transcation_id BIGINT, method VARCHAR(255), user_id VARCHAR(255), PRIMARY KEY(id))`, (err, res) => {
    if (err)
        console.log(err)
})

con.query(`CREATE TABLE IF NOT EXISTS vehicles (id INT AUTO_INCREMENT, vehicle_number VARCHAR(255), manufacturer VARCHAR(255), model VARCHAR(255), owner varchar(255), user_id VARCHAR(255), PRIMARY KEY(id))`, (err, res) => {
    if (err)
        console.log(err)
})

con.query(`CREATE TABLE IF NOT EXISTS bookings (id INT AUTO_INCREMENT, state VARCHAR(255), plaza_name VARCHAR(255), vehicle_number VARCHAR(255), amount varchar(255), user_id varchar(255), is_expired VARCHAR(255), transcation_id VARCHAR(255), PRIMARY KEY(id))`, (err, res) => {
    if (err)
        console.log(err)
})


/*
con.query(`ALTER TABLE users ADD balance int`, (err, res) => {
    if(err)
        console.log(err)
})
*/


module.exports = con.promise();