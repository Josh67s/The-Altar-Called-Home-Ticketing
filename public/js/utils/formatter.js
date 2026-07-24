export function formatCurrency(amount){

    return "₦" +
    Number(amount || 0)
    .toLocaleString();

}

export function formatTicketName(type){

    switch(type){

        case "premium":
            return "Premium Access";

        case "standard":
            return "Standard Access";

        default:
            return "Regular Access";

    }

}

export function formatStatus(status){

    return status || "-";

}