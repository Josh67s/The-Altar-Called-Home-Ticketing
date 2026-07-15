const admin = require("firebase-admin");

admin.initializeApp();

exports.verifyPayment =
    require("./payment/verifyPayment").verifyPayment;

exports.checkInTicket =
require("./payment/checkInTicket")
.checkInTicket;