const cron = require('node-cron');
const User = require('../models/user.js'); // Adjust the path to your user model as needed
cron.schedule('0 0 * * *', async () => {  // This runs at midnight every day
    try {
        const now = new Date();
        const threshold = 1 * 24 * 60 * 60 * 1000; // 1 day in milliseconds

        // Find users who haven't verified their email and are older than 1 day
        const usersToDelete = await User.find({
            emailVerified: false,
            createdAt: { $lt: new Date(now - threshold) }
        });

        // Delete unverified users
        if (usersToDelete.length > 0) {
            await User.deleteMany({
                emailVerified: false,
                createdAt: { $lt: new Date(now - threshold) }
            });
            console.log(`${usersToDelete.length} unverified users removed.`);
        } else {
            console.log("No unverified users to remove.");
        }
    } catch (error) {
        console.error("Error during cleanup:", error);
    }
});
