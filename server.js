require("dotenv").config();
const cors = require("cors");
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const port = process.env.PORT || 3000;
const bodyparser = require("body-parser");
const cookieparser = require("cookie-parser");
const cron = require('node-cron');
const { sendEventReminderEmails } = require('./controller/user/eventCard.control');

app.use(cors());
app.use(cookieparser());
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGODB_KEY)
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("Error connecting to MongoDB", err));


app.use("/", require("./router/razorpaywebhook"));

//user 
app.use("/user", require("./router/user/user.route"));
app.use("/user/book", require("./router/user/book.route"));
app.use("/user/event", require("./router/user/events.route"));
app.use("/user/course", require("./router/user/course.route"));
app.use("/user/account", require("./router/user/account.route"));
app.use("/user/payment", require("./router/user/payment.route"));
app.use("/user/bookcard", require("./router/user/bookCard.route"));
app.use("/user/contactus", require("./router/user/contactUs.route"));
app.use("/user/eventcard", require("./router/user/eventCard.route"));
app.use("/user/instructor", require("./router/user/instructor.route"));
app.use("/user/coursecard", require("./router/user/courseCard.route"));
app.use("/user/userreview", require("./router/user/userReview.route"));
app.use("/user/enrollform", require("./router/user/enrollForm.route"));
app.use("/user/studentsuccess", require("./router/user/studentSuccess.route"));

//cron job
cron.schedule('0 0 9 * * *', () => {
    sendEventReminderEmails();
    console.log('running a task every day at 9:00:00 AM');
});

//admin
app.use("/admin", require("./router/admin/account.route"));
app.use("/admin/book", require("./router/admin/book.route"));
app.use("/admin/user", require("./router/admin/user.route"));
app.use("/admin/event", require("./router/admin/events.route"));
app.use("/admin/course", require("./router/admin/course.route"));
app.use("/admin/reports", require("./router/admin/reports.route"));
app.use("/admin/payment", require("./router/admin/payment.route"));
app.use("/admin/bookcard", require("./router/admin/bookCard.route"));
app.use("/admin/eventcard", require("./router/admin/eventCard.route"));
app.use("/admin/instructor", require("./router/admin/instructor.route"));
app.use("/admin/coursecard", require("./router/admin/courseCard.route"));
app.use("/admin/userreview", require("./router/admin/userReview.route"));
app.use("/admin/bookcategory", require("./router/admin/bookCategory.route"));
app.use("/admin/eventcategory", require("./router/admin/eventCategory.route"));
app.use("/admin/studentsuccess", require("./router/admin/studentSuccess.route"));
app.use("/admin/coursecategory", require("./router/admin/courseCategory.route"));


app.listen(port, (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log("Server is running on port " + port);
    }
})