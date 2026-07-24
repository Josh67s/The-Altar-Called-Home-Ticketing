export function showAlert(message, type="success"){

    let toast =
    document.getElementById("appToast");

    if(!toast){

        toast =
        document.createElement("div");

        toast.id="appToast";

        document.body.appendChild(toast);

    }

    toast.className =
    `toast ${type}`;

    toast.textContent =
    message;

    toast.classList.add("show");

    setTimeout(()=>{

        toast.classList.remove("show");

    },3000);

}