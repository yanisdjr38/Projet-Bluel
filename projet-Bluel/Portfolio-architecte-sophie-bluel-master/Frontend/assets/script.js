const WORK_URL = "http://localhost:5678/api/works";
const CATEGORY_URL = "http://localhost:5678/api/categories";

// Check logged in and logout link

const token = localStorage.getItem("token");
const loginLink = document.getElementById("login-link");

if (token) {
  document.body.classList.add("logged");
  if (loginLink) {
    loginLink.querySelector("li").textContent = "logout";
    loginLink.href = "#";
    loginLink.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      window.location.reload();
    });
  }
}
// Load and display categories

async function loadCategories() {
  try {
    const response = await fetch(CATEGORY_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const categories = await response.json();
    return categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

function displayCategories(categories) {
  const categoriesContainer = document.querySelector(".categories");
  const categorySelect = document.getElementById("category");
  categoriesContainer.innerHTML = "";
  categorySelect.innerHTML = "";

  //Category select options
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category.id;
    option.textContent = category.name;
    categorySelect.appendChild(option);
  });

  // "All" filter
  const allFilter = document.createElement("button");
  allFilter.textContent = "Tous";
  allFilter.addEventListener("click", () => init());
  categoriesContainer.appendChild(allFilter);

  categories.forEach((category) => {
    const button = document.createElement("button");
    button.textContent = category.name;
    button.addEventListener("click", async () => {
      const works = await loadGallery();
      const filteredWorks = works.filter(
        (work) => work.categoryId === category.id
      );
      displayWorks(filteredWorks);
    });
    categoriesContainer.appendChild(button);
  });
}
// Load and display gallery

async function loadGallery() {
  try {
    const response = await fetch(WORK_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const works = await response.json();
    return works;
  } catch (error) {
    console.error("Error fetching works:", error);
    return [];
  }
}

function displayWorks(works) {
  const gallery = document.querySelector(".gallery");
  gallery.innerHTML = "";

  works.forEach((work) => {
    const figure = document.createElement("figure");
    const img = document.createElement("img");
    img.src = work.imageUrl;
    img.alt = work.title;

    const caption = document.createElement("figcaption");
    caption.textContent = work.title;

    figure.appendChild(img);
    figure.appendChild(caption);
    gallery.appendChild(figure);
  });
}

// modal functionality
const modalContainer = document.querySelector(".modal-container");
const modalTriggers = document.querySelectorAll(".modal-trigger");

modalTriggers.forEach((trigger) => {
  trigger.addEventListener("click", toggleModal);
});

function toggleModal() {
  modalContainer.classList.toggle("active");
}

//Modal Gallery

function displayModalGallery(works) {
  const modalGallery = document.querySelector(".modal-gallery");
  modalGallery.innerHTML = "";

  works.forEach((work) => {
    const figure = document.createElement("figure");
    figure.classList.add("modal-figure");

    const img = document.createElement("img");
    img.src = work.imageUrl;
    img.alt = work.title;

    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("delete-btn");
    deleteBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
    deleteBtn.dataset.id = work.id;
    // Delete work functionality
    deleteBtn.addEventListener("click", (e) => {
      const workId = e.currentTarget.dataset.id;
      fetch(`${WORK_URL}/${workId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          // Remove the figure from the modal gallery
          figure.remove();
          // Also refresh the main gallery
          init();
        })
        .catch((error) => {
          console.error("Error deleting work:", error);
        });
    });
    //Add work to modal gallery

    figure.appendChild(img);
    figure.appendChild(deleteBtn);
    modalGallery.appendChild(figure);
  });
}

// Modal View

const galleryView = document.querySelector(".modal-gallery-view");
const addView = document.querySelector(".modal-add-view");
const openAddBtn = document.querySelector(".open-add-view");
const backToGalleryBtn = document.querySelector(".back-to-gallery");

// Aller sur la vue "Ajouter une photo"
openAddBtn.addEventListener("click", () => {
  galleryView.classList.add("hidden");
  addView.classList.remove("hidden");
});

// Revenir sur la vue "Galerie"
backToGalleryBtn.addEventListener("click", () => {
  addView.classList.add("hidden");
  galleryView.classList.remove("hidden");
});

// Fonction Preview Image

const fileInput = document.getElementById("photo");
const preview = document.querySelector(".preview");
const icon = document.querySelector(".upload-icon");
const btn = document.querySelector(".upload-btn");
const instructions = document.querySelector(".photo-instructions");

fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];

  if (!file) return;

  preview.innerHTML = `<img src="${URL.createObjectURL(file)}" alt="preview">`;
  preview.style.display = "flex";

  icon.style.display = "none";
  btn.style.display = "none";
  instructions.style.display = "none";
});

// Initialize
async function init() {
  const works = await loadGallery();
  displayWorks(works);
  displayModalGallery(works);
  const categories = await loadCategories();
  displayCategories(categories);
}

init();
