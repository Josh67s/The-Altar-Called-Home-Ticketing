const admin = require("firebase-admin");

admin.initializeApp();

exports.resendTicketEmail =
require("./payment/resendTicketEmail").resendTicketEmail;

exports.checkInTicket =
require("./payment/checkInTicket").checkInTicket;

exports.verifyPayment =
require("./payment/verifyPayment").verifyPayment;

exports.createStaff =
require("./staff/createStaff").createStaff;

exports.toggleStaff =
require("./staff/toggleStaff").toggleStaff;

exports.updateStaff =
require("./staff/updateStaff").updateStaff;

exports.resetStaffPassword =
require("./staff/resetStaffPassword").resetStaffPassword;

exports.deleteStaff =
require("./staff/deleteStaff").deleteStaff;