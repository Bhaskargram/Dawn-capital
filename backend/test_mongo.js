const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGODB_URI)
  .then(() => { console.log("SUCCESS"); process.exit(0); })
  .catch((err) => { console.log("ERROR:", err.message); process.exit(1); });
