var mongoose = require('mongoose');

var MemberSchema = new mongoose.Schema({
  id: Number,
  firstName: String,
  lastName: String,
  city: String,
  
  });

module.exports = mongoose.model('Member', MemberSchema);
