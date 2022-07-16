let express = require("express");
let app = express();
let bodyParser = require('body-parser')
let cookieParser = require("cookie-parser")
let auth = require("./auth")
const query = require("./dbQueries");
const checksum_lib = require("./Paytm/check_sum");
let paytm_config = require("./config/paytm.config").config_prod
var QRCode = require('qrcode')
let toll_plaza = require("./toll_plaza")
let scrapping = require("./scrap_toll_data")
require("./db")
require("./scrap_toll_data")



app.set("view engine", "ejs")
app.use(express.static(__dirname + "/public"))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser());
app.use((req, res, next) => {
    try {
        if (req.cookies.userDetails) {
            let data = req.cookies.userDetails;
            data.isLoggedIn = true;
            req.app.locals.data = data;
        } else {
            let data = {};
            data.isLoggedIn = false;
            req.app.locals.data = data;
        }
    } catch (err) {
        res.send(err);
    }
    next()
})




app.get("/", (req, res) => {
    if (req.app.locals.data.isLoggedIn) {
        res.redirect("/dashboard")
    } else {
        res.render("home")
    }
})

app.get("/dashboard", (req, res) => {
    res.render("dashboard")
})

app.post("/add-recharge", (req, res) => {
    // Route for making payment

    var paymentDetails = {
        amount: req.body.amount,
        customerId: `${req.app.locals.data.id}`,
        customerEmail: req.app.locals.data.emailAddress,
        customerPhone: req.app.locals.data.mobileNumber,
    }

    if (!paymentDetails.amount || !paymentDetails.customerId || !paymentDetails.customerEmail || !paymentDetails.customerPhone) {
        res.status(400).send('Payment failed')
    } else {
        var params = {};
        params['MID'] = paytm_config["Merchant ID"];
        params['WEBSITE'] = paytm_config.Website;
        params['CHANNEL_ID'] = 'WEB';
        params['INDUSTRY_TYPE_ID'] = 'Retail';
        params['ORDER_ID'] = 'TEST_' + new Date().getTime();
        params['CUST_ID'] = paymentDetails.customerId;
        params['TXN_AMOUNT'] = paymentDetails.amount;
        params['CALLBACK_URL'] = 'http://localhost:3000/callback';
        params['EMAIL'] = paymentDetails.customerEmail;
        params['MOBILE_NO'] = paymentDetails.customerPhone;



        checksum_lib.genchecksum(params, paytm_config["Merchant Key"], function (err, checksum) {
            //var txn_url = "https://securegw-stage.paytm.in/theia/processTransaction"; // for staging
            var txn_url = "https://securegw.paytm.in/theia/processTransaction"; // for production

            var form_fields = "";
            for (var x in params) {
                form_fields += "<input type='hidden' name='" + x + "' value='" + params[x] + "' >";
            }
            form_fields += "<input type='hidden' name='CHECKSUMHASH' value='" + checksum + "' >";

            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write('<html><head><title>Merchant Checkout Page</title></head><body><center><h1>Please do not refresh this page...</h1></center><form method="post" action="' + txn_url + '" name="f1">' + form_fields + '</form><script type="text/javascript">document.f1.submit();</script></body></html>');
            res.end();
        });
    }
});




app.post("/callback", (req, res) => {
    var PaytmChecksum = require("./Paytm/check_sum");


    let body = req.body;
    var paytmChecksum = body["CHECKSUMHASH"];
    delete body["CHECKSUMHASH"];

    let isVerifySignature = PaytmChecksum.verifychecksum(body, paytm_config["Merchant Key"], paytmChecksum);
    if (isVerifySignature) {
        if (req.body.STATUS == "TXN_FAILURE") {
            res.render("error", { subject: "Payment calcelled", message: req.body.RESPMSG })
        } else {
            res.render("transcation_details", { subject: "Payment calcelled", data: req.body })
        }
        console.log("Checksum Matched");
    } else {
        res.render("error", { message: "Some unexpected error happened" })
        console.log("Checksum Mismatched");
    }
});





app.get("/error", (req, res) => {
    res.render("error", { subject: "Payment calcelled", message: "User has not completed transaction" })
})



app.get("/transcation-details", (req, res) => {
    res.render('transcation_details')
})


app.get("/result", (req, res) => {
    res.render("result")
})

app.get("/add-recharge", (req, res) => {
    res.render("add-recharge")
})


app.get("/fake-recharge", (req, res) => {
    res.render("fake-recharge.ejs")
})


app.post("/fake-recharge", (req, res) => {
    let data = req.body;
    data.time_stamp = new Date().toLocaleString();
    data.transcation_id = Math.floor(Math.random() * (99999999999999 - 900000000000) + 900000000000)
    data.method = "fake"
    data.user_id = res.app.locals.data.id
    console.log(data)
    query.add_recharge_details(data).then((x) => {
        query.get_account_balance(req.app.locals.data.id).then((result) => {
            let curr_bal = result[0][0]["balance"];
            query.update_account_balance(curr_bal + parseInt(data.amount), req.app.locals.data.id).then((result) => {
                console.log(result);
            })
            res.render("transcation_details", { subject: "Payment Successfull", amount: req.body.amount })
        })
    }).catch((err) => {
        res.send(err)
    })
})



app.get("/check-balance", (req, res) => {
    res.render("check-balance", { isPasswordWrong: false, accountBalance: null })
})

app.post("/check-balance", async (req, res) => {
    let password_in_db = await query.get_user_password(req.app.locals.data.id)
    password_in_db = password_in_db[0][0]["password"]
    if (req.body.password == password_in_db) {
        let curr_bal = await query.get_account_balance(req.app.locals.data.id);
        res.render("check-balance", { isPasswordWrong: false, accountBalance: curr_bal[0][0]['balance'] })
    } else {
        res.render("check-balance", { isPasswordWrong: true, accountBalance: null })
    }
})


app.get("/transcation-history", async (req, res) => {
    let txn = await query.get_transcations(req.app.locals.data.id);
    res.render("transcation_history", { data: txn[0].reverse() })
})


app.get("/show-qr", (req, res) => {
    QRCode.toDataURL(`{"id": ${req.app.locals.data.id}}`, function (err, url) {
        res.render("qr", { url: url, transcation_id: req.app.locals.data.id })
    })
})


app.get("/all-toll-plaza", (req, res) => {
    let data = toll_plaza.get_all_toll_plazas();
    res.render("all_toll_plaza", { data: data })
})

app.get("/search-plaza", (req, res) => {
    res.render("search_plaza")
})

app.post("/get_plaza_names", (req, res) => {
    let tolls = toll_plaza.get_plazas_of_a_state(req.body.state);
    res.json(tolls)
})

app.post("/search-plaza", async (req, res) => {
    let x = await scrapping.get_toll_detail(req.body.id)
    res.render("show_toll_detail", { html: x })
})


app.get("/book-plaza", async (req, res) => {
    let data = await query.get_all_vehicles_of_a_user(req.app.locals.data.id)
    res.render("book_plaza", { vehicles: data[0] })
})


app.post("/book-plaza", async (req, res) => {
    let data = req.body;
    data.user_id = req.app.locals.data.id;
    data.is_expired = false;
    data.transcation_id = require("./id_generater")(10)
    let x = await query.add_booking_details(data);
    if (x) {
        let y = await query.get_account_balance(req.app.locals.data.id)
        let curr_bal = y[0][0].balance
        let z = await query.deduct_money(req.app.locals.data.id, (curr_bal - parseInt(data.amount)))
        if (z) {
            QRCode.toDataURL(`{"transcation_id": ${data.transcation_id}}`, function (err, url) {
                res.render("qr", { url: url, transcation_id: data.transcation_id })
            })
        }
    }
})


app.get("/all-bookings", async (req, res) => {
    let data = await query.get_all_bookings_of_a_user(req.app.locals.data.id)
    console.log(data[0])
    res.render("all-bookings", { data: data[0] })
})

app.get("/add-vehicle", async (req, res) => {
    res.render("add_vehicle")
})


app.post("/add-vehicle", async (req, res) => {
    let data = req.body
    data.user_id = req.app.locals.data.id;
    let x = await query.add_vehicle_details(data)
    res.redirect("/all-vehicles")
})

app.get("/all-vehicles", async (req, res) => {
    let data = await query.get_all_vehicles_of_a_user(req.app.locals.data.id)
    res.render("all_vehicles", { data: data[0] })
})


app.use("/auth", auth);



app.use("*", (req, res) => {
    res.render("404")
})



app.listen(3000, () => {
    console.log("Running Successfully")
})