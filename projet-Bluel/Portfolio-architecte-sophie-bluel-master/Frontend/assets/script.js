const WORK_URL = "http://localhost:5678/api/works";
const CATEGORY_URL = "http://localhost:5678/api/categories";

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
  function createAllFilter() {
    const allFilter = document.createElement("button");
    allFilter.classList.add("category-btn");
    allFilter.textContent = "Tous";
    allFilter.addEventListener("click", () => init());
    categoriesContainer.appendChild(allFilter);
  }
  createAllFilter();

  // Category buttons
  function createCategoryButtons() {
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
  createCategoryButtons();
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
function toggleModal() {
  const modalContainer = document.querySelector(".modal-container");
  const modalTriggers = document.querySelectorAll(".modal-trigger");

  modalTriggers.forEach((trigger) => {
    trigger.addEventListener("click", toggleModal);
  });

  function toggleModal() {
    modalContainer.classList.toggle("active");
  }
}

toggleModal();

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
    deleteBtn.addEventListener("click", deleteWork);
    figure.appendChild(img);
    figure.appendChild(deleteBtn);
    modalGallery.appendChild(figure);
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
    const title = document.getElementById("title").value.trim();
    const category = Number(document.getElementById("category").value);
    const imageFile = document.getElementById("photo").files[0];

    if (!title || !category || !imageFile) {
      console.error("Please provide title, category and image");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("category", category);
    formData.append("image", imageFile);

    try {
      const response = await fetch(WORK_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Refresh galleries
      const works = await loadGallery();
      displayWorks(works);
      displayModalGallery(works);
      // Reset form
      addWorkForm.reset();
      document.querySelector(".preview").innerHTML = "";
    } catch (error) {
      console.error("Error adding work:", error);
    }
  });
}

addWork();

// Initialize
async function init() {
  const works = await loadGallery();
  displayWorks(works);
  displayModalGallery(works);
  const categories = await loadCategories();
  displayCategories(categories);
}

init();
