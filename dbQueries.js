let db = require("./db")


let create_user = (data) => {
    return db.query(`INSERT INTO users (${Object.keys(data)}) VALUES (${Object.values(data).map((x) => `'${x}' `)})`)
}

let check_if_email_or_phone_aleredy_exist = (email, mobile) => {
    return db.query(`SELECT * FROM users WHERE emailAddress = '${email}' or mobileNumber = '${mobile}'`)
}

let does_user_exist = (email) => {
    return db.query(`SELECT * FROM users WHERE emailAddress = '${email}'`)
}

let get_user_password = (id) => {
    return db.query(`SELECT password from users WHERE id = '${id}'`)
}


let get_account_balance = (id) => {
    return db.query(`SELECT balance FROM users WHERE id = '${id}'`)
}

let update_account_balance = (amount, id) => {
    return db.query(`UPDATE users SET balance = '${amount}' WHERE ID = '${id}'`)
}

let add_recharge_details = (data) => {
    return db.query(`INSERT INTO transcations (${Object.keys(data)}) VALUES (${Object.values(data).map((x) => `'${x}' `)})`)
}

let get_transcations = (id) => {
    return db.query(`SELECT * FROM transcations WHERE user_id = '${id}'`)
}


let add_vehicle_details = (data) => {
    return db.query(`INSERT INTO vehicles (${Object.keys(data)}) VALUES (${Object.values(data).map((x) => `'${x}' `)})`)
}


let get_all_vehicles_of_a_user = (id) => {
    return db.query(`SELECT * FROM vehicles WHERE user_id = '${id}'`)
}

let add_booking_details = (data) => {
    return db.query(`INSERT INTO bookings (${Object.keys(data)}) VALUES (${Object.values(data).map((x) => `'${x}' `)})`)
}

let get_all_bookings_of_a_user = (id) => {
    return db.query(`SELECT * FROM bookings WHERE user_id = '${id}'`)
}

let deduct_money = (id, amount) => {
    return db.query(`UPDATE users SET balance = '${amount}' WHERE ID = '${id}'`)
}

module.exports = {
    create_user,
    check_if_email_or_phone_aleredy_exist,
    does_user_exist,
    get_user_password,
    add_recharge_details,
    get_account_balance,
    update_account_balance,
    get_transcations,
    add_vehicle_details,
    get_all_vehicles_of_a_user,
    add_booking_details,
    get_all_bookings_of_a_user,
    deduct_money
}