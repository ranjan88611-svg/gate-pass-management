const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  fName: { type: String, maxLength: 50, required: true },
  lName: { type: String, maxLength: 50, required: true },

  hName: { type: String, required: false, default: null },
  rNO: { type: Number, required: false, default: null },

  pOV: { type: String, maxLength: 50, required: true },
  time: { type: Date, required: true },

  Status: { type: String, default: 'pending' },

  sem: { type: String, required: true },
  section: { type: String, required: true },
  usn: { type: String, required: true },
});

const studentData = mongoose.model("studentData", studentSchema);
module.exports = studentData;
