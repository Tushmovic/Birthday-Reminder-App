const cron = require('cron');
const User = require('../models/User');
const { sendBirthdayEmail } = require('./emailService');

const checkBirthdays = async () => {
  console.log('Checking for birthdays...');
  
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const day = String(today.getDate()).padStart(2, '0');
  const year = today.getFullYear();
  
  try {
    // Find users with birthdays today
    const birthdayUsers = await User.findByBirthday(month, day);
    
    console.log(`Found ${birthdayUsers.length} users with birthdays today`);
    
    for (const user of birthdayUsers) {
      // Check if we already sent birthday email this year
      const alreadySent = await User.isBirthdaySent(user.id, year);
      
      if (!alreadySent) {
        console.log(`Sending birthday email to ${user.username} (${user.email})`);
        
        // Send email
        const emailSent = await sendBirthdayEmail(user);
        
        if (emailSent) {
          // Mark as sent for this year
          await User.markBirthdaySent(user.id, year);
          console.log(`Birthday marked as sent for ${user.username}`);
        }
      } else {
        console.log(`Birthday already sent to ${user.username} for ${year}`);
      }
    }
    
    console.log('Birthday check completed');
  } catch (error) {
    console.error('Error checking birthdays:', error);
  }
};

const startCronJob = () => {
  // Schedule to run every day at 7:00 AM
  const job = new cron.CronJob('0 7 * * *', checkBirthdays, null, true, 'UTC');
  
  // For testing: run every minute
  // const job = new cron.CronJob('* * * * *', checkBirthdays, null, true, 'UTC');
  
  console.log('Cron job scheduled for daily birthday checks at 7:00 AM UTC');
  
  // Optionally, run immediately on startup for testing
  if (process.env.NODE_ENV === 'development') {
    console.log('Running initial birthday check...');
    checkBirthdays();
  }
};

module.exports = { startCronJob, checkBirthdays };