// functions/index.js
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.cleanupExpiredBookings = functions.pubsub
    .schedule("every 24 hours")
    .onRun(async(context) => {
        const db = admin.firestore();
        const usersSnapshot = await db.collection("users").get();

        const today = new Date();

        for (const userDoc of usersSnapshot.docs) {
            const bookingsRef = db.collection(`users/${userDoc.id}/bookings`);
            const bookingsSnapshot = await bookingsRef.get();

            for (const bookingDoc of bookingsSnapshot.docs) {
                const bookingData = bookingDoc.data();
                const dropDate = bookingData.endDate ? .toDate ? .() || new Date(bookingData.endDate);

                if (dropDate < today) {
                    console.log(`Deleting expired booking for user ${userDoc.id}`);
                    await bookingDoc.ref.delete();
                }
            }
        }

        return null;
    });