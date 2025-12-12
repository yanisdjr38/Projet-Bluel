const WORK_URL = "http://localhost:5678/api/works";
const CATEGORY_URL = "http://localhost:5678/api/categories";
const categoriesContainer = document.querySelector(".categories");

// Check logged in and logout link
function isLoggedIn() {
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
}

const token = localStorage.getItem("token");
isLoggedIn();

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
// Display categories as buttons and in select

function displayCategories(categories) {
  const categorySelect = document.getElementById("category");
  if (!categorySelect) return;

  categorySelect.innerHTML = "";

  //Category select options
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category.id;
    option.textContent = category.name;
    categorySelect.appendChild(option);
  });
}

// "All" filter
function createAllFilter() {
  const allFilter = document.createElement("button");
  allFilter.classList.add("category-btn");
  allFilter.textContent = "Tous";
  allFilter.addEventListener("click", () => init());
  categoriesContainer.appendChild(allFilter);
}

// Category buttons
function createCategoryButtons(categories) {
  categories.forEach((category) => {
    const button = document.createElement("button");
    button.classList.add("category-btn");
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

//affichage des boutons de catégories
function renderFilters(categories) {
  categoriesContainer.innerHTML = "";
  createAllFilter();
  createCategoryButtons(categories);
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

// Display works in gallery

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
function initModal() {
  const modalContainer = document.querySelector(".modal-container");
  const modalTriggers = document.querySelectorAll(".modal-trigger");

  modalTriggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      modalContainer.classList.toggle("active");
    });
  });
}

initModal();

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

    deleteBtn.addEventListener("click", deleteWork);
    figure.appendChild(img);
    figure.appendChild(deleteBtn);
    modalGallery.appendChild(figure);
  });
}
// Delete work function
function deleteWork() {
  const workId = deleteBtn.dataset.id;
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
}
// Modal View
function toggleModalView() {
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
}

toggleModalView();

// Fonction Preview Image
function previewImage() {
  const fileInput = document.getElementById("photo");
  const preview = document.querySelector(".preview");
  const icon = document.querySelector(".upload-icon");
  const btn = document.querySelector(".upload-btn");
  const instructions = document.querySelector(".photo-instructions");

  fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];

    if (!file) return;

    preview.innerHTML = `<img src="${URL.createObjectURL(
      file
    )}" alt="preview">`;
    preview.style.display = "flex";

    icon.style.display = "none";
    btn.style.display = "none";
    instructions.style.display = "none";
  });
}

previewImage();

// Add Work Functionality
function addWork() {
  const addWorkForm = document.getElementById("add-photo-form");
  if (!addWorkForm) return;

  addWorkForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const rawFormData = new FormData(e.currentTarget);

    const title = rawFormData.get("title")?.trim();
    const category = rawFormData.get("category");
    const file = rawFormData.get("photo");

    if (!title || !category || !file) {
      alert("Veuillez remplir tous les champs.");
      return;
    }

    if (file.type !== "image/jpeg" && file.type !== "image/png") {
      alert("S'il vous plaît, ajoutez une image au format JPG ou PNG.");
      return;
    }

    const apiFormData = new FormData();
    apiFormData.append("title", title);
    apiFormData.append("category", Number(category));
    apiFormData.append("image", file);

    try {
      const response = await fetch(WORK_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: apiFormData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Reset form
      await refreshGalleries();
      resetAddWorkForm();
    } catch (error) {
      console.error("Error adding work:", error);
    }
  });
}

// refresh galleries after adding a work
async function refreshGalleries() {
  const works = await loadGallery();
  displayWorks(works);
  displayModalGallery(works);
}

// reset add work form
function resetAddWorkForm() {
  const addWorkForm = document.getElementById("add-photo-form");
  addWorkForm.reset();

  addWorkForm.reset();

  const preview = document.querySelector(".preview");
  if (preview) {
    preview.innerHTML = "";
  }
}

addWork();

// Initialize
async function init() {
  const works = await loadGallery();
  displayWorks(works);
  displayModalGallery(works);

  const categories = await loadCategories();
  displayCategories(categories);
  renderFilters(categories);
}

init();
