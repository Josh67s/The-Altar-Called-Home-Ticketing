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

return response.data;