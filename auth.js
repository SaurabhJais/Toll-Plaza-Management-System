let express = require("express")
let router = express.Router();
let query = require("./dbQueries")


router.get("/login", (req, res) => {
    res.render("login")
})



router.get("/signup", (req, res) => {
    res.render("signup")
})



router.post("/signup", async(req, res) => {
    let data = {id: require("./id_generater")(8)};
    data = {...data, ...req.body}
    data.balance = 0;
    let x = await query.check_if_email_or_phone_aleredy_exist(data.emailAddress, data.mobileNumber);

    if (x[0].length) {
        res.send("Email or Mobile Number already exists....")
    } else {
        try {
            await query.create_user(data);
            res.render("success")
        } catch (err) {
            res.send("Something Went Wrong")
        }
    }
})


router.post("/login", async (req, res) => {
    let data = req.body;
    let a = await query.does_user_exist(data.username);
    if (a[0]) {
        if (data.password === a[0][0]['password']) {
            let temp = a[0][0]
            temp.role = "user"
            delete temp['password']
            res.cookie("userDetails", temp)
            res.redirect("/dashboard")
        } else {
            res.send("Wrong Password found")
        }
    } else {
        res.send("No user found of this username")
    }
})


router.get("/logout", (req, res) => {
    res.cookie("userDetails", "");
    res.redirect("/")
})


module.exports = router;