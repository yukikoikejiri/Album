let searchInput = document.getElementById("searchInput");
let authorListBox = document.getElementById("authorListContainer");
let showAllBtn = document.getElementById("showAll");
let clickedAuthorName = document.getElementById("clickedAuthorNameField");
let container = document.getElementById("dataContainer");
let form = document.getElementById("dataForm");
let resetButton = document.getElementById("resetButton");
let updateButton = document.getElementById("updateButton");
let searchValue = "";
let authorList = "";
let clickedAuthor = "";

//Place the content into the gallery
function createGallery(data) {
  data.forEach(item => {
    container.innerHTML += `
      <div class="card" data-author="${item.author}" data-tags="${item.tags}">
      <div class="image"><img src="${item.image}" alt="${item.alt}"></div>
      <div class="author"><p><strong>${item.author}</strong></p></div>
      <div class="description"><p>${item.description}</p></div>
      <div class="tags"><p>Tags: ${item.tags}</p></div>
      </div>`;
  })
}

//Place the author names into the author list
function createAuthorList(data) {
  authorList = new Set(data.map(item => item.author));
  for (let author of authorList) {
    let authorElem = document.createElement("button");
    authorElem.innerText += author;
    authorListBox.appendChild(authorElem);
  }
}

function resetFilterAndSearch() {
  clickedAuthor = "";
  clickedAuthorName.innerHTML = "";
  searchValue = "";
  searchInput.value = "";
}

function clearAuthorList() {
  while (authorListBox.firstChild) {
    authorListBox.removeChild(authorListBox.firstChild);
  }
  authorList = null;
}

//Dynamic gallery content
//using fetch, send an AJAX GET request
fetch("https://wt.ops.labs.vu.nl/api23/bac2135b/", {
  method: "GET"
})
.then(response => response.json())
.then(data => {
  createGallery(data);
  createAuthorList(data);
})
.catch(error => console.log(error));

//Search field to filter image
searchInput.addEventListener("input", event => {
  searchValue = event.target.value.toLowerCase();
  let cards = document.querySelectorAll(".card");
  cards.forEach(card => {
    let cardAuthor = card.dataset.author.toLowerCase();
    let cardTags = card.dataset.tags.toLowerCase();
    if ((clickedAuthor.toLowerCase() == cardAuthor || clickedAuthor == "") && (cardAuthor.includes(searchValue) || cardTags.includes(searchValue))) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  })
})

//Filterable gallery
//cite: https://www.w3schools.com/howto/howto_js_filter_elements.asp (highly modified)
authorListBox.addEventListener("click", event => {
  if(event.target.matches("button")){
    clickedAuthor = event.target.innerText;
    let cards = document.querySelectorAll('.card');
    cards.forEach(card => {
      let cardAuthor = card.dataset.author.toLowerCase();
      let cardTags = card.dataset.tags.toLowerCase();
      if ((searchValue == "" || cardAuthor.includes(searchValue) || cardTags.includes(searchValue)) && card.dataset.author === clickedAuthor) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });

    //Visually indicate a currently filtered author
    let clickedAuthorBtn = event.target;
    clickedAuthorBtn.style.backgroundColor = "lightgray";
    clickedAuthorName.innerHTML = "Filtered by " + clickedAuthor;

    //Reset the color of the previously selected button
    let authorBtns = authorListBox.querySelectorAll("button");
    authorBtns.forEach(btn => {
      if (btn != clickedAuthorBtn) {
        btn.style.backgroundColor = "";
      }
    });
  }
});

//Reset filtering
showAllBtn.addEventListener("click", () => {
  let cards = document.querySelectorAll('.card');
  cards.forEach(card => {
    let cardAuthor = card.dataset.author.toLowerCase();
    let cardTags = card.dataset.tags.toLowerCase();
    if (searchValue == "" || cardAuthor.includes(searchValue) || cardTags.includes(searchValue)) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
  let authorBtns = authorListBox.querySelectorAll("button");
  authorBtns.forEach(btn => {
    btn.style.backgroundColor = "";
  });
  let clickedAuthorName = document.getElementById("clickedAuthorNameField");
  clickedAuthorName.innerHTML = "";
  clickedAuthor = "";
});

//Single page form submit
//using AJAX for sending the form data to the server in JSON
//the submitted form data is posted in JSON to the server using an AJAX POST (fetch) request and dynamically added to your HTML gallery using the DOM. 
form.addEventListener("submit", e => {
  e.preventDefault();
  let authorValue = form.author.value;
  let altValue = form.alt.value;
  let tagsValue = form.tags.value;
  let imageValue = form.image.value;
  let descriptionValue = form.description.value;

  //Form validation
  if (!authorValue || !altValue || !tagsValue || !imageValue || !descriptionValue) {
  alert("All fields are required!");
  return;
  };

  let newData = {
    author: authorValue,
    alt: altValue,
    tags: tagsValue,
    image: imageValue,
    description: descriptionValue
  };
  fetch("https://wt.ops.labs.vu.nl/api23/bac2135b/",
  {
    method: "POST",
    body: JSON.stringify(newData),
    headers: { "Content-Type": "application/json" }
  })
  .then(response => response.json())
  .then(data => {
    let newItemId = data.id;
    fetch("https://wt.ops.labs.vu.nl/api23/bac2135b/", {
      method: "GET"
    })
    .then(response => response.json())
    .then(data => {
    
      //Place the content into the gallery
      container.innerHTML = ``;
      createGallery(data);

      //Reset and place the author list
      clearAuthorList();  
      createAuthorList(data);

      //Delete values in the form
      form.author.value = "";
      form.alt.value = "";
      form.tags.value = "";
      form.image.value = "";
      form.description.value = "";

      resetFilterAndSearch();

      modal.style.display = "none";
      alert("Data has been successfully added!");
    });
  });
});

//Reset and update buttons
//This button should reset the database associated with your key, by using AJAX to send an HTTP GET request to (eventListener used)
resetButton.addEventListener("click", e => {
  fetch("https://wt.ops.labs.vu.nl/api23/bac2135b/reset", {
    method: "GET"
  })
  .then(() => {
    fetch("https://wt.ops.labs.vu.nl/api23/bac2135b/", {
      method: "GET"
    })
    .then(response => response.json())
    .then(data => {
      //Place the content into the gallery
      container.innerHTML = ``;
      createGallery(data);

      //Reset and place the author list
      clearAuthorList();
      createAuthorList(data);
      
      resetFilterAndSearch();
    }); 
  });
  alert("Data has been successfully reset!");
});

updateButton.addEventListener("click", e => {
  fetch("https://wt.ops.labs.vu.nl/api23/bac2135b/", {
    method: "GET"
  })
  .then(response => response.json())
  .then(data => {
    //Reset the gallery and place the content into it
    container.innerHTML = ``
    createGallery(data);

    //Reset and place the author list
    clearAuthorList();
    createAuthorList(data);

    resetFilterAndSearch();
  });
  alert("Data has been successfully updated!");
});


//Hide my form using a modal
//cite:https://www.w3schools.com/howto/howto_css_modals.asp (.onclick altered to use .addEventListener instead)
//Get the modal
let modal = document.getElementById("myModal");

//Get the button that opens the modal
let openBtn = document.getElementById("myBtn");

//Get the button that closes the modal
let cancelBtn = document.getElementById("cancelBtn");

//Get the <span> element that closes the modal
let span = document.getElementsByClassName("close")[0];

//When the user clicks on the button, open the modal
openBtn.addEventListener("click", () => {
    modal.style.display = "block";
})

//When the user clicks on the button, close the modal
cancelBtn.addEventListener("click", () => {
  modal.style.display = "none";
})

//When the user clicks on <span> (x), close the modal
span.addEventListener("click", () => {
    modal.style.display = "none";
})

//When the user clicks anywhere outside of the modal, close it
window.addEventListener("click", (event) => {
    if (event.target == modal) {
        modal.style.display = "none";
      }
})

//One time page refresh after first page load
window.onload = function() {
    if(!window.location.hash) {
        window.location = window.location + '#loaded';
        window.location.reload();
    }
}
