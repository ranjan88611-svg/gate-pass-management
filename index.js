const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

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

const PORT = process.env.PORT || 8081;

// --------------------
// DATABASE CONNECTION
// --------------------
main()
  .then(() => console.log("MongoDB Connection Successful"))
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/studentdata");
}

// --------------------
// APP CONFIG
// --------------------
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

// --------------------
// ROOT LOGIN PAGE
// --------------------
app.get("/", (req, res) => {
  res.render("login.ejs");
});

// --------------------
// STUDENT REGISTRATION
// --------------------
app.get("/student/register", (req, res) => {
  res.render("studentregister.ejs");
});

app.post("/student/register", async (req, res) => {
  try {
    const { name, usn, email, phone, password, sem, section } = req.body;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with sem and section
    await User.create({
      name,
      usn,
      email,
      phone,
      password: hashedPassword,
      sem,
      section
    });

    console.log("Student registered successfully:", usn);
    res.redirect("/studentsignin");
  } catch (err) {
    console.error("Registration error:", err.message);
    res.redirect("/student/register");
  }
});

// --------------------
// APPLY FORM (STUDENT)
// --------------------
app.get("/apply", async (req, res) => {
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

  req.session.userId = u._id;
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

  if (password !== confirmPassword) return res.redirect("/student/register");

  const exists = await User.findOne({ usn });
  if (exists) return res.redirect("/student/register");

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

app.post("/guardsignin", (req, res) => {
  const { email, password } = req.body;

  // Hardcoded guard credentials
  const GUARD_EMAIL = "santhosh@nce.in";
  const GUARD_PASSWORD = "654321";

  if (email === GUARD_EMAIL && password === GUARD_PASSWORD) {
    req.session.guardAuth = true;
    res.redirect("/guarddeshboard");
  } else {
    res.send(`
      <script>
        alert('Access Denied: Invalid guard credentials');
        window.location.href = '/guardsignin';
      </script>
    `);
  }
});


// --------------------
// ADMIN LOGIN
// --------------------
app.get("/adminsignin", (req, res) => {
  res.render("adminlogin.ejs");
});

app.post("/adminsignin", (req, res) => {
  const { email, password } = req.body;

  // Hardcoded admin credentials
  const ADMIN_EMAIL = "Najmuddinaamer@nce.in";
  const ADMIN_PASSWORD = "123456";

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    req.session.adminAuth = true;
    res.redirect("/admindashboard");
  } else {
    res.send(`
      <script>
        alert('Access Denied: Invalid admin credentials');
        window.location.href = '/adminsignin';
      </script>
    `);
  }
});

// --------------------
// ADMIN DASHBOARD
// --------------------
app.get("/admindashboard", async (req, res) => {
  if (!req.session.adminAuth) return res.redirect("/adminsignin");

  const studat = await studentData.find().lean();
  res.render("admindashboard.ejs", { studat });
});

// --------------------
// GUARD DASHBOARD
// --------------------
app.get("/guarddeshboard", async (req, res) => {
  if (!req.session.guardAuth) return res.redirect("/guardsignin");

  const studat = await studentData.find().lean();
  res.render("guarddeshboard.ejs", { studat });
});

// --------------------
// STUDENT DASHBOARD (OWN SEM + SECTION)
// --------------------
app.get("/dashboard", async (req, res) => {
  if (!req.session.userId) return res.redirect("/studentsignin");

  const user = await User.findById(req.session.userId);
  const studat = await studentData.find({ usn: user.usn });

  res.render("deshboard.ejs", { studat });
});

// --------------------
// SAVE GATEPASS APPLICATION
// --------------------
app.post("/dashboard", async (req, res) => {
  if (!req.session.userId) return res.redirect("/studentsignin");

  try {
    const user = await User.findById(req.session.userId);
    console.log("User found:", { id: user._id, sem: user.sem, section: user.section, usn: user.usn });

    const { fName, lName, sem, section, pOV, time, hName, rNO } = req.body;
    console.log("Form data:", { fName, lName, pOV, time, userSem: user.sem, userSection: user.section });

    const gatePassData = {
      fName: fName || user.name.split(" ")[0] || user.name,
      lName: lName || user.name.split(" ")[1] || user.name,
      pOV,
      time,
      hName: hName || null,
      rNO: rNO || null,
      sem: user.sem,
      section: user.section,
      usn: user.usn,
      Status: "pending",
    };

    console.log("Attempting to save:", gatePassData);
    await studentData.create(gatePassData);

    console.log("GatePass Submitted Successfully");
    res.render("success.ejs");
  } catch (err) {
    console.error("Error:", err.message);
    console.error("Full error:", err);
    res.redirect("/apply");
  }
});

// --------------------
// UPDATE STATUS (ADMIN / GUARD)
// --------------------
app.post("/ward", async (req, res) => {
  const { id, decision } = req.body;
  await studentData.updateOne({ _id: id }, { Status: decision });
  res.redirect("/admindashboard");
});

// --------------------
// DELETE REQUEST (ADMIN)
// --------------------
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
