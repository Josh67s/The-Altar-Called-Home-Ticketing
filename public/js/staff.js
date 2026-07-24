import{

protectPage,
logout

}from "./auth.js";

import {

initializeLayout

}from "./layout.js";

import{

openModal,

closeModal,

registerModal

}from "./components/modal.js";

import{

showAlert

}from "./utils/alerts.js";

import{

db,
collection,
getDocs,
functions,
    httpsCallable
}from "./firebase-config.js";

const createStaffCallable =
httpsCallable(    functions, 
"createStaff"
);

const toggleStaffCallable =
httpsCallable(functions,
"toggleStaff"
);

const updateStaffCallable =
httpsCallable(functions,
"updateStaff"
);

const resetPasswordCallable =
httpsCallable(functions,
"resetStaffPassword"
);

const deleteStaffCallable =
httpsCallable(functions,
"deleteStaff"
);

protectPage("admin");

let allStaff = [];
let filteredStaff = [];
let currentPage = 1;
const rowsPerPage = 10;

const searchInput =
document.getElementById("searchStaff");

const roleFilter =
document.getElementById("roleFilter");

const statusFilter =
document.getElementById("statusFilter");

window.onUserReady = async ()=>{

    initializeLayout();

    await loadStaff();

};

searchInput.addEventListener(
    "input",
    filterStaff
);

roleFilter.addEventListener(
    "change",
    filterStaff
);

statusFilter.addEventListener(
    "change",
    filterStaff
);

function showAddStaffModal(){

const modal =
document.getElementById("staffModal");

const body =
document.getElementById("staffModalBody");

body.innerHTML = `

<h2>Add New Staff</h2>

<form id="staffForm" class="staff-form">

<div>

<label>Full Name</label>

<input
type="text"
id="staffName"
required>

</div>

<div>

<label>Email Address</label>

<input
type="email"
id="staffEmail"
required>

</div>

<div>

<label>Phone Number</label>

<input
type="tel"
id="staffPhone"
required>

</div>

<div>

<label>Role</label>

<select id="staffRole">

<option value="admin">Admin</option>

<option value="usher">Check-in Officer</option>

</select>

</div>

<div>

<label>Temporary Password</label>

<input
type="password"
id="staffPassword"
required
minlength="6"
placeholder="Minimum 6 characters">

</div>

<div style="display:flex;gap:15px;margin-top:20px;">

<button
type="submit"
id="createStaffBtn"
class="goldBtn staff-btn-gold">

Create Staff

</button>

<button
type="button"
id="cancelStaff"
class="goldBtn staff-btn-gray">

Cancel

</button>

</div>

</form>

`;

modal.style.display="flex";

const createStaffBtn =
document.getElementById("createStaffBtn");

document
.getElementById("cancelStaff")
.onclick = ()=>{

modal.style.display="none";

};

document
.getElementById("staffForm")
.onsubmit = async (e)=>{

    e.preventDefault();

    try{

        createStaffBtn.disabled = true;

        createStaffBtn.textContent =
        "Creating Staff...";

        const password =
document.getElementById("staffPassword")
.value
.trim();

if(password.length < 6){

    showAlert(

        "Temporary password must be at least 6 characters.",

        "error"

    );

    return;

}

        await createStaffCallable({

            fullName:
            document.getElementById("staffName").value,

            email:
            document.getElementById("staffEmail").value,

            phone:
            document.getElementById("staffPhone").value,

            password:
            document.getElementById("staffPassword").value,

            role:
            document.getElementById("staffRole").value

        });

        showAlert(
"Staff account created successfully."
);

document
.getElementById("staffModal")
.style.display="none";

await loadStaff();

    }catch(error){

        console.error(error);

        showAlert(error.message, "error");

    }finally{

        createStaffBtn.disabled = false;

        createStaffBtn.textContent =
        "Create Staff";

    }

};

}

document
.getElementById("addStaffBtn")
.onclick = showAddStaffModal;

document
.getElementById("closeStaffModal")
.onclick = ()=>{

document
.getElementById("staffModal")
.style.display="none";

};

window.addEventListener("click",(e)=>{

const modal =
document.getElementById("staffModal");

if(e.target===modal){

modal.style.display="none";

}

});

async function loadStaff(){

    const snapshot = await getDocs(collection(db,"staff"));

    allStaff = [];

    snapshot.forEach(doc=>{

        allStaff.push({

            id: doc.id,

            ...doc.data()

        });

    });

    filteredStaff = [...allStaff];

    updateStatistics();

    renderTable();

}

function updateStatistics(){

    document.getElementById("totalStaff").textContent =
        allStaff.length;

    document.getElementById("totalAdmins").textContent =
        allStaff.filter(
            s => s.role === "admin"
        ).length;

    document.getElementById("totalOfficers").textContent =
        allStaff.filter(
            s => s.role === "usher"
        ).length;

    document.getElementById("activeStaff").textContent =
        allStaff.filter(
            s => s.active === true
        ).length;

}

function renderTable(){

    const tbody =
    document.getElementById("staffBody");

    tbody.innerHTML = "";

    if(filteredStaff.length === 0){

        tbody.innerHTML = `

        <tr>

            <td colspan="6">

                No staff found.

            </td>

        </tr>

        `;

        return;

    }

    const start =
        (currentPage - 1) * rowsPerPage;

    const end =
        start + rowsPerPage;

    const page =
        filteredStaff.slice(start,end);

    page.forEach(staff=>{

        tbody.innerHTML += `

        <tr>

            <td>${staff.fullName || staff.name || "-"}</td>

            <td>${staff.email}</td>

            <td>${staff.role}</td>

            <td>

                ${staff.active
                    ? '<span class="valid">Active</span>'
                    : '<span class="used">Inactive</span>'}

            </td>

            <td>

                ${staff.lastLogin?.toDate

?staff.lastLogin.toDate().toLocaleString("en-NG",{

    dateStyle:"medium",

    timeStyle:"short"

})

:

"-"}

            </td>

            <td>

                <button
                    class="viewBtn"
                    data-id="${staff.id}">

                    View

                </button>

            </td>

        </tr>

        `;

    });

    const showingStart =
filteredStaff.length===0
?0
:start+1;

const showingEnd =
Math.min(
end,
filteredStaff.length
);

document.getElementById("staffPageInfo").textContent =
`Showing ${showingStart}-${showingEnd} of ${filteredStaff.length}`;
}

function filterStaff(){

    const keyword =
    searchInput.value
    .trim()
    .toLowerCase();

    const role =
    roleFilter.value;

    const status =
    statusFilter.value;

    filteredStaff =
    allStaff.filter(staff=>{

        const fullName =
        (staff.fullName || "")
        .toLowerCase();

        const email =
        (staff.email || "")
        .toLowerCase();

        const matchesSearch =

            fullName.includes(keyword)

            ||

            email.includes(keyword);

        let matchesRole = true;

        if(role !== "all"){

            matchesRole =

            (staff.role || "")
            .toLowerCase() === role;

        }

        let matchesStatus = true;

        if(status !== "all"){

            const currentStatus =

            staff.active

            ?

            "active"

            :

            "inactive";

            matchesStatus =
            currentStatus === status;

        }

        return (

            matchesSearch &&

            matchesRole &&

            matchesStatus

        );

    });

    currentPage = 1;

    renderTable();

}

document.getElementById("prevBtn").addEventListener("click", () => {

    if(currentPage > 1){

        currentPage--;

        renderTable();

    }

});

document.getElementById("nextBtn").addEventListener("click", () => {

    const totalPages = Math.ceil(filteredStaff.length / rowsPerPage);

    if(currentPage < totalPages){

        currentPage++;

        renderTable();

    }

});

document.addEventListener("click", async (e)=>{

    if(!e.target.classList.contains("viewBtn")) return;

    const id = e.target.dataset.id;

    await openStaff(id);

});

async function openStaff(id){

    const staff = allStaff.find(

        s => s.id === id

    );

    if(!staff) return;

    const modal =

    document.getElementById("staffModal");

    const body =

    document.getElementById("staffModalBody");

    body.innerHTML = `

    <h2>Staff Details</h2>

    <div class="staff-details">

        <p>

            <strong>Name</strong><br>

            ${staff.fullName || staff.name || "-"}

        </p>

        <p>

            <strong>Email</strong><br>

            ${staff.email}

        </p>

        <p>

            <strong>Phone</strong><br>

            ${staff.phone || "-"}

        </p>

        <p>

            <strong>Role</strong><br>

            ${staff.role}

        </p>

        <p>

            <strong>Status</strong><br>

            ${staff.active ? "Active" : "Inactive"}

        </p>

        <p>

            <strong>Last Login</strong><br>

            ${
                staff.lastLogin?.toDate

?staff.lastLogin.toDate().toLocaleString("en-NG",{

    dateStyle:"medium",

    timeStyle:"short"

})

:

"-"
            }

        </p>

    </div>

    <div class="staff-actions">

        <button
        id="editStaffBtn"
        class="goldBtn staff-btn-gold">

        ✏ Edit

        </button>

        <button
        id="toggleStaffBtn"
        class="goldBtn staff-btn-gray">

        ${
            staff.active
            ? "Deactivate"
            : "Activate"
        }

        </button>

        <button
id="resetPasswordBtn"
class="goldBtn staff-btn-blue">

🔑 Reset Password

</button>

        <button
        id="deleteStaffBtn"
        class="dangerBtn">

        🗑 Delete

        </button>

    </div>

    `;

    modal.style.display = "flex";

    document
.getElementById("toggleStaffBtn")
.onclick = async ()=>{

    try{

        await toggleStaffCallable({

            uid: staff.id,

            active: !staff.active

        });

        showAlert(

            staff.active

            ?

            "Staff deactivated."

            :

            "Staff activated.",

            "success"

        );

        modal.style.display="none";

        await loadStaff();

    }

    catch(error){

        console.error(error);

        showAlert(

            error.message,

            "error"

        );

    }

};

document
.getElementById("resetPasswordBtn")
.onclick = async ()=>{

    if(

        !confirm(

            "Reset this staff member's password?"

        )

    ) return;

    try{

        await resetPasswordCallable({

            uid: staff.id

        });

        showAlert(

            "A new password has been emailed to the staff member.",

            "success"

        );

    }

    catch(error){

        console.error(error);

        showAlert(

            error.message,

            "error"

        );

    }

};

document
.getElementById("editStaffBtn")
.onclick = ()=>{

    const body =
    document.getElementById("staffModalBody");

    body.innerHTML = `

    <h2>Edit Staff</h2>

    <form id="editStaffForm">

        <label>

            Full Name

        </label>

        <input
        id="editName"
        value="${staff.fullName || staff.name || ""}">

        <label>

            Phone

        </label>

        <input
        id="editPhone"
        value="${staff.phone || ""}">

        <label>

            Role

        </label>

        <select id="editRole">

            <option
            value="admin"
            ${staff.role==="admin"?"selected":""}>

            Admin

            </option>

            <option
            value="usher"
            ${staff.role==="usher"?"selected":""}>

            Check-in Officer

            </option>

        </select>

        <br><br>

        <button
        class="goldBtn">

        Save Changes

        </button>

    </form>

    `;

    document
    .getElementById("editStaffForm")
    .onsubmit = async(e)=>{

        e.preventDefault();

        try{

            await updateStaffCallable({

                uid: staff.id,

                fullName:
                document.getElementById("editName").value,

                phone:
                document.getElementById("editPhone").value,

                role:
                document.getElementById("editRole").value

            });

            showAlert(

                "Staff updated successfully.",

                "success"

            );

            modal.style.display="none";

            await loadStaff();

        }

        catch(error){

            console.error(error);

            showAlert(

                error.message,

                "error"

            );

        }

    };

};

document
.getElementById("deleteStaffBtn")
.onclick = ()=>{

    const body =
    document.getElementById("staffModalBody");

    body.innerHTML = `

    <div class="delete-confirm">

        <h2>

            Delete Staff Member

        </h2>

        <p>

            This action cannot be undone.

        </p>

        <hr>

        <p>

            <strong>Name:</strong>

            ${staff.fullName}

        </p>

        <p>

            <strong>Email:</strong>

            ${staff.email}

        </p>

        <p>

            <strong>Role:</strong>

            ${staff.role}

        </p>

        <div
        style="display:flex;gap:15px;margin-top:25px;">

            <button

            id="cancelDelete"

            class="greenBtn">

            Cancel

            </button>

            <button

            id="confirmDelete"

            class="dangerBtn">

            Delete Staff

            </button>

        </div>

    </div>

    `;

    document
    .getElementById("cancelDelete")
    .onclick = ()=>{

        closeModal(modal);

    };

    document
    .getElementById("confirmDelete")
    .onclick = async ()=>{

        try{

            await deleteStaffCallable({

                uid: staff.id

            });

            showAlert(

                "Staff deleted successfully.",

                "success"

            );

            closeModal(modal);

            await loadStaff();

        }

        catch(error){

            console.error(error);

            showAlert(

                error.message,

                "error"

            );

        }

    };

};

}