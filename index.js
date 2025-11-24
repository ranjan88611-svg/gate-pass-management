const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");

const app = express();

app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: "mysecretkey123",
    resave: false,
    saveUninitialized: true,
  })
);

const bcrypt = require("bcrypt");
const User = require("./models/user");
const studentData = require("./models/student");


const PORT = process.env.PORT || 8080;

// --------------------
// DATABASE CONNECTION
// --------------------
main()
  .then(() => console.log("MongoDB Connection Successful"))
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/studentdata');
}

// --------------------
// APP CONFIG
// --------------------
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
// ROOT PAGE → Login page
app.get("/", (req, res) => {
  res.render("login.ejs");
});

// --------------------
// ROUTES
// --------------------

// ROOT LOGIN PAGE

app.get("/apply", async (req, res) => {
    // Fetch logged in user using session
    if (!req.session.userId) return res.redirect("/studentsignin");

    const user = await User.findById(req.session.userId);

    res.render("apply.ejs", { user });
});

// --------------------
// STUDENT LOGIN
// --------------------
app.get("/studentsignin", (req, res) => {
  res.render("studentlogin.ejs");
});

app.post("/studentsignin", async (req, res) => {
    const { usn, password } = req.body;
    const u = await User.findOne({ usn });
    if (!u) return res.redirect("/studentsignin");

    const ok = await bcrypt.compare(password, u.password);
    if (!ok) return res.redirect("/studentsignin");

    req.session.userId = u._id;  // STORE LOGGED USER

    res.redirect("/apply");
});


// --------------------
// STUDENT REGISTER
// --------------------
app.get("/student/register", (req, res) => {
  res.render("studentregister.ejs");
});

app.post("/student/register", async (req, res) => {
  const { name, usn, email, phone, password, confirmPassword, sem, section } = req.body;


  if (password !== confirmPassword) {
    return res.redirect("/student/register");
  }

  const exists = await User.findOne({ usn });
  if (exists) {
    return res.redirect("/student/register");
  }

  const hash = await bcrypt.hash(password, 10);
  await User.create({ name, usn, email, phone, password: hash, sem, section });


  res.redirect("/studentsignin");
});

// --------------------
// ADMIN LOGIN
// --------------------
app.get("/adminsignin", (req, res) => {
  res.render("adminlogin.ejs");
});

// --------------------
// GUARD LOGIN
// --------------------
app.get("/guardsignin", (req, res) => {
  res.render("guardlogin.ejs");
});

// --------------------
// STUDENT HOME
// --------------------
app.get("/studenthome", (req, res) => {
  res.render("sudenthome.ejs");
});

// --------------------
// ADMIN DASHBOARD
// --------------------
app.get("/admindashboard", async (req, res) => {
  let studat = await studentData.find();
  res.render("admindashboard.ejs", { studat });
});

// --------------------
// ADMIN HOME
// --------------------
app.get("/adminhome", (req, res) => {
  res.render("adminhome.ejs");
});

// --------------------
// GUARD HOME
// --------------------
app.get("/guardhome", (req, res) => {
  res.render("guardhome.ejs");
});

// --------------------
// GUARD DASHBOARD
// --------------------
app.get("/guarddeshboard", async (req, res) => {
  let studat = await studentData.find();
  res.render("guarddeshboard.ejs", { studat });
});

// --------------------
// STUDENT DASHBOARD
// --------------------
app.get("/dashboard", async (req, res) => {
  let studat = await studentData.find();
  res.render("deshboard.ejs", { studat });
});

// --------------------
// APPLY FORM
// --------------------
app.get("/apply", (req, res) => {
  res.render("apply.ejs");
});

// SAVE APPLICATION DATA
app.post("/deshboard", (req, res) => {
  try {
    const formData = req.body;
    formData.Status = 'pending';

    const newStudent = new studentData(formData);
    newStudent.save();

    console.log("Data saved");
  } catch (err) {
    console.error(err);
  }

  res.redirect("/apply");
});

// UPDATE STATUS (ADMIN / GUARD)
app.post("/ward", async (req, res) => {
  const approvaldata = req.body;
  await studentData.updateOne({ _id: approvaldata.id }, { Status: approvaldata.decision });
  res.redirect("/admindashboard");
});
app.post("/admin/delete", async (req, res) => {
    const id = req.body.id;

    try {
        await studentData.findByIdAndDelete(id);
        res.redirect("/admindashboard");
    } catch (err) {
        console.log(err);
        res.redirect("/admindashboard");
    }
});

// --------------------
// START SERVER
// --------------------
app.listen(PORT, () => {
  console.log(`🚀 Server running at: http://localhost:${PORT}`);
});
