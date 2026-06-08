const mongoose = require('mongoose');
require('dotenv').config();
const Lead = require('./models/Lead');

async function test() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/dawn');
    const leads = await Lead.find();
    console.log(`Found ${leads.length} leads.`);
    if (leads.length === 0) return;
    
    const lead = leads[0];
    console.log('Testing update on lead:', lead._id);
    
    let mappedStatus = 'contacted';
    let funnelStage = 'Attempted to Contact';
    
    const updated = await Lead.findByIdAndUpdate(lead._id, { $set: { status: mappedStatus, funnelStage } }, { new: true, runValidators: true });
    console.log('Update result:', updated ? 'Success' : 'Failed');
    console.log('New funnelStage:', updated.funnelStage);
  } catch (err) {
    console.error('Error during update:', err);
  } finally {
    mongoose.disconnect();
  }
}
test();
