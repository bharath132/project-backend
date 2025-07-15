const admin = require('../firebase.js');

async function sendNotification(token, title, body) {
    try {
        const message = {
            notification: {
                title: title,
                body: body
            },
            token: token
        };

        const response = await admin.messaging().send(message);
        console.log('Notification sent successfully:', response);

    } catch (error) {
        console.error('Error sending notification:', error);
    }
}
module.exports = sendNotification;