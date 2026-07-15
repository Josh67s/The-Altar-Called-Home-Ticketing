const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");

const admin = require("firebase-admin");
const axios = require("axios");

const db = admin.firestore();

const { FieldValue } = admin.firestore;

const PAYSTACK_SECRET_KEY =
    defineSecret("PAYSTACK_SECRET_KEY");

exports.verifyPayment = onCall(
    {
        secrets: [PAYSTACK_SECRET_KEY]
    },

    async (request) => {

        const reference = request.data.reference;

        if (!reference) {

            throw new HttpsError(
                "invalid-argument",
                "Payment reference is required."
            );

        }

        const response = await axios.get(

            `https://api.paystack.co/transaction/verify/${reference}`,

            {
                headers: {
                    Authorization:
                        `Bearer ${PAYSTACK_SECRET_KEY.value()}`
                }
            }

        );

        const paymentData = response.data.data;

if (paymentData.status !== "success") {

    throw new HttpsError(
        "failed-precondition",
        "Payment not successful."
    );

}

const snapshot = await db
    .collection("orders")
    .where(
        "payment.reference",
        "==",
        reference
    )
    .limit(1)
    .get();

if (snapshot.empty) {

    throw new HttpsError(
        "not-found",
        "Order not found."
    );

}

const orderDoc = snapshot.docs[0];

await orderDoc.ref.update({

    "payment.status": "Paid",

    "payment.reference": paymentData.reference,

    "payment.gateway": "Paystack",

    "payment.transactionId": paymentData.id,

    "payment.paidAt":
        admin.firestore.FieldValue.serverTimestamp()

});

let ticketNumber;

await db.runTransaction(async (transaction) => {

    const counterRef =
        db.collection("system")
          .doc("ticketCounter");

    const counterSnap =
        await transaction.get(counterRef);

    if (!counterSnap.exists) {

        throw new HttpsError(
            "not-found",
            "Ticket counter not found."
        );

    }

    const counter =
        counterSnap.data();

    const nextNumber =
        counter.nextNumber;

    ticketNumber =

        `${counter.prefix}-${counter.year}-${String(nextNumber).padStart(6,"0")}`;

    transaction.update(counterRef, {

        nextNumber: nextNumber + 1

    });

});

const ticketRef =
    db.collection("tickets")
      .doc(ticketNumber);

await ticketRef.set({

    ticketNumber,

    orderId: orderDoc.id,

    paymentReference: paymentData.reference,

    buyer: orderDoc.data().buyer,

    ticket: orderDoc.data().ticket,

    attendees: orderDoc.data().attendees,

    totals: orderDoc.data().totals,

    payment: {

        status: "Paid",

        transactionId: paymentData.id,

        paidAt: FieldValue.serverTimestamp()

    },

    status: "VALID",

    used: false,

checkedInAt: null,

checkedInBy: null,

qrCode: null,

    createdAt: FieldValue.serverTimestamp()

});

await orderDoc.ref.update({

    ticketNumber: ticketNumber,

    "ticket.ticketNumber": ticketNumber,

    "payment.firestoreId": orderDoc.id

});

return {

    success: true,

    orderId: orderDoc.id,

    ticketNumber,

    payment: paymentData

};
    }

);