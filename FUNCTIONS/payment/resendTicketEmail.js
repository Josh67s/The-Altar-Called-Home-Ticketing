const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");

const admin = require("firebase-admin");

const db = admin.firestore();

const {
    sendTicketEmail,
    gmailEmail,
    gmailPassword
} = require("../services/emailService");

exports.resendTicketEmail = onCall(
{
    secrets: [
        gmailEmail,
        gmailPassword
    ]
},
async (request) => {

    const orderId = request.data.orderId;

    if (!orderId) {
        throw new HttpsError(
            "invalid-argument",
            "Order ID is required."
        );
    }

    const orderDoc = await db
        .collection("orders")
        .doc(orderId)
        .get();

    if (!orderDoc.exists) {
        throw new HttpsError(
            "not-found",
            "Order not found."
        );
    }

    const order = {

        id: orderDoc.id,

        ...orderDoc.data()

    };

    await sendTicketEmail(order);

    return {

        success: true

    };

});