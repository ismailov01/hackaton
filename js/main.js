let currentPage = 1;

const API = `http://localhost:8050/contactbook?_page=${currentPage}&_limit=3`;

const secondApi = 'http://localhost:8050/contactbook';

let contactName = $('#contact-name')
let contactNumber = $('#contact-number')
let contactLastName = $('#contact-last')
let contactImage = $('#contact-image')
let contactWeekly = $('#contact-weekly')
let contactMonthly = $('#contact-monthly')  
let btnSave = $('.btn-save')
let modal = $('.modal')

//! Create
async function addProduct() {
    let name = contactName.val();
    let number = contactNumber.val();
    let lastName = contactLastName.val();
    let image = contactImage.val()
    let weekly = contactWeekly.val()
    let monthly = contactMonthly.val()
    let product = {
        name, 
        number,
        lastName,
        image,
        weekly,
        monthly,
    };
    try{
        const response = await axios.post(API, product)
        console.log(response);
        Toastify({
            text: response.statusText,
            duration: 3000,
            newWindow: true,
            close: true,
            gravity: "top", // `top` or `bottom`
            position: "left", // `left`, `center` or `right`
            stopOnFocus: true, // Prevents dismissing of toast on hover
            style: {
              background: "linear-gradient(to right, #00b09b, #96c93d)",
            },
          }).showToast();
          modal.modal("hide")
    } catch(e){
        console.log(e);
        Toastify({
            text: e.response.statusText,
            duration: 3000,
            newWindow: true,
            close: true,
            gravity: "top", // `top` or `bottom`
            position: "center", // `left`, `center` or `right`
            stopOnFocus: true, // Prevents dismissing of toast on hover
            style: {
              background: "red",
            },
          }).showToast();
    }
    render(API)
}

btnSave.on('click', addProduct)

//! Read
let list = $('.list')
let prev = $('.prev')
let next = $('.next')


async function render(url) {
    try{
        const response = await axios(url)
        console.log(response.headers.link);
        list.html("")
        response.data.forEach(item => {
            list.append(`
            <div class="card mt-3 mb-3 bg-light" style="width: 20rem;">
                <img style="width: 100%; object-fit: contain; height: 200px;" src=${item.image} class="card-img-top" alt="...">
                <div class="card-body">
                <h5 class="card-title">${item.name}</h5>
                <p class="card-text">${item.lastName}</p>
                <h6>Weekly KPI:<p>${item.weekly}</p></h6>
                <h6>Monthly KPI:<p>${item.monthly}</p></h6>
                <a href="#">${item.number}</a>
                <button id=${item.id} type="button" class="btn btn-secondary edit-btn" data-bs-toggle="modal" data-bs-target="#editModal">
                    Change
                </button>
                <button id=${item.id} type="button" class="btn btn-danger delete-btn">
                    Delete
                </button>
            </div>
        </div>
            `)
        });
        //!Pagination
        let links = response.headers.link.match(/(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])/gim)
        if(!links){
            prev.attr('disabled', 'true')
            next.attr('disabled', 'true')
        } 
        if(links.length === 4) {
            prev.attr('id', links[1])
            next.attr('id', links[2])
            prev.removeAttr('disabled')
            next.removeAttr('disabled')
        } else if(links.length === 3 && currentPage === 1){
            prev.attr('disabled', 'true')
            next.attr('id', links[1])
        } else if(links.length === 3 && currentPage !== 1){
            next.attr('disabled', 'true')
            prev.attr('id', links[1])
        }
    } catch(e) {
        console.log(e);
    }
}

render(API)

next.on('click', (e) => {
    let url = e.target.id 
    render(url)
    currentPage++
})

prev.on('click', (e) => {
    let url = e.target.id
    render(url)
    currentPage--
})



//!Search
let searchInp = $('.inp-search')
searchInp.on('input', (e) => {
    let value = e.target.value
    let url = `${API}&q=${value}`
    render(url)
})


//!Update 
let contactNameEdit = $('#contact-name-edit')
let contactNumberEdit = $('#contact-number-edit')
let contactImageEdit = $('#contact-image-edit')
let contactLastEdit = $('#contact-last-edit')
let contactWeeklyEdit = $('#contact-weekly-edit')
let contactMonthlyEdit = $('#contact-monthly-edit')
let btnSaveEdit = $('.btn-save-edit')


$(document).on('click', ".edit-btn", async (e) => {
    let id = e.target.id
    try {
        const response = await axios(`${secondApi}/${id}`)
        contactNameEdit.val(response.data.name)
        contactLastEdit.val(response.data.lastName)
        contactImageEdit.val(response.data.image)
        contactNumberEdit.val(response.data.number)
        contactWeeklyEdit.val(response.data.weekly)
        contactMonthlyEdit.val(response.data.monthly)
        btnSaveEdit.attr('id', id)
    } catch(e) {
        console.log(e);
    }
})

btnSaveEdit.on('click', async (e) => {
    let id = e.target.id
    let name = contactNameEdit.val()
    let number = contactNumberEdit.val()
    let lastName = contactLastEdit.val()
    let image = contactImageEdit.val()
    let weekly = contactWeeklyEdit.val()
    let monthly = contactMonthlyEdit.val()


     let product = {
         name, 
         number,
         image,
         lastName,
         weekly,
         monthly
     };
     try{
        await axios.patch(`${secondApi}/${id}`, product)
        modal.modal("hide")
        let url = `http://localhost:8050/contactbook?page_=${currentPage}&_limit=3`
        render(url)
     } catch(e) {
         console.log(e);
     }
})


//! Delete
$(document).on('click', '.delete-btn', async (e) => {
     let id = e.target.id
     await axios.delete(`${secondApi}/${id}`)
     render(API)
})