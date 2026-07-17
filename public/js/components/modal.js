export function openModal(modal){

    modal.classList.add("show");

    document.body.style.overflow="hidden";

}

export function closeModal(modal){

    modal.classList.remove("show");

    document.body.style.overflow="auto";

}

export function registerModal(modal){

    modal.addEventListener("click",(e)=>{

        if(e.target===modal){

            closeModal(modal);

        }

    });

}