const cron = require('node-cron');
const Document = require('../models/Document');
const { deleteFromCloudinary } = require('./fileService');

// Helper function: Get the exact start and end of a day, X days from now
const getTargetDateRange = (daysAhead) => {
  const start = new Date();
  start.setDate(start.getDate() + daysAhead);
  start.setHours(0, 0, 0, 0); // 12:00:00 AM

  const end = new Date(start);
  end.setHours(23, 59, 59, 999); // 11:59:59 PM

  return { start, end };
};

// The core logic that scans the database
const checkExpiringDocuments = async () => {
  try {
    console.log("⏰ Running Daily Expiry Check...");
    
    // We want to alert users 30 days, 7 days, and 1 day before expiry
    const alertIntervals = [30, 7, 1];

    for (const days of alertIntervals) {
      const { start, end } = getTargetDateRange(days);
      
      // Query MongoDB: Find active documents expiring on this exact target day
      // We use .populate() to pull the user's email so we know who to notify!
  const expiringDocs = await Document.find({
        status: 'active',
        'extractedData.expiryDate': { $gte: start, $lte: end }
      }).populate('user', 'email username');

      if (expiringDocs.length > 0) {
        console.log(`📌 Found ${expiringDocs.length} document(s) expiring in exactly ${days} days.`);
        
        // This is where you will eventually put your Email/SMS sending logic!
        expiringDocs.forEach(doc => {
          console.log(`   -> ALERT: User [${doc.user.email}] | Document: "${doc.title}" | Expires: ${doc.extractedData.expiryDate.toDateString()}`);
        });
      }
    }
  } catch (error) {
    console.error("❌ Cron Job Error:", error);
  }
};

// The core logic that empties the trash
const cleanUpTrash = async () => {
  try {    
    // Calculate the exact date 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Find documents that were moved to the trash MORE than 30 days ago
    const trashedDocs = await Document.find({
      status: 'trash',
      updatedAt: { $lte: thirtyDaysAgo } 
    });

    if (trashedDocs.length === 0) {
      return console.log("✨ Trash is already clean.");
    }

    console.log(`🧹 Found ${trashedDocs.length} old document(s) to permanently delete.`);

    let deletedCount = 0;

    // Loop through and destroy them one by one
    for (const doc of trashedDocs) {
      // 1. Nuke it from Cloudinary (Saves money!)
      const isDeletedFromCloud = await deleteFromCloudinary(doc.cloudinaryId);
      
      // 2. Nuke it from MongoDB (Saves space!)
      if (isDeletedFromCloud) {
        await Document.findByIdAndDelete(doc._id);
        deletedCount++;
      } else {
        console.log(`⚠️ Failed to delete image from Cloudinary for doc: ${doc._id}`);
      }
    }

    console.log(`🔥 Successfully destroyed ${deletedCount} document(s) permanently.`);
  } catch (error) {
    console.error("❌ Trash Cleanup Error:", error);
  }
};

// The function that actually starts the timer
const startCronJobs = () => {
  // Cron syntax: 'Minute Hour DayOfMonth Month DayOfWeek'
  // '0 8 * * *' means: At minute 0, past hour 8 (8:00 AM), every day, every month, every day of the week.
  cron.schedule('0 8 * * *', checkExpiringDocuments);

  cron.schedule('0 2 * * *', cleanUpTrash);
  
  console.log("⚙️  Cron Jobs Initialized: Expiry scanner set for 8:00 AM daily.");
};

// We export both so we can start the schedule, but also run the check manually for testing!
module.exports = { startCronJobs, checkExpiringDocuments };