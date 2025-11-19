const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    fName : {
        type : String,
        maxLength : 50,
        required : true,
    },
    mName : {
        type : String,
        maxLength : 50
    },
    lName : {
        type : String,
        maxLength : 50,
        required : true,
    },

    // Gate Pass Name REMOVED => make fully optional with no enum restriction
    hName: {
        type: String,
        required : false,
        default: null
    },

    // Room No REMOVED => make optional
    rNO : {
        type : Number,
        required : false,
        default: null
    },

    mode: {
        type: String,
        enum: ['Day', 'Night'],
        required: true,
    },

    pOV : {
        type : String,
        maxLength : 50,
        required : true,
    },

    time: {
        type: Date,
        required: true,
    },

    Status: {
        type: String,
        default: "pending"
    }
});

const studentData = mongoose.model("studentData", studentSchema);
module.exports = studentData;
