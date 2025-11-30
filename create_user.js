const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./models/user");

async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/studentdata");

    const usn = "1MS23CS999";
    const password = "password123";
    const hash = await bcrypt.hash(password, 10);

    // Check if exists
    const exists = await User.findOne({ usn });
    if (exists) {
        console.log("User already exists");
        await User.deleteOne({ usn });
        console.log("Deleted existing user");
    }

    await User.create({
        name: "Test User",
        usn: usn,
        email: "test@example.com",
        phone: "9999999999",
        password: hash,
        sem: "5",
        section: "A"
    });

    console.log("User created successfully");
    mongoose.connection.close();
}

main().catch(err => console.error(err));
