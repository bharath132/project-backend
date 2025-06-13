const admin = require('firebase-admin')
const ServiceAccount = require('./serviceAccountKey.json')

admin.initializeApp({
    credential:admin.credential.cert(ServiceAccount),
});

module.exports = admin;