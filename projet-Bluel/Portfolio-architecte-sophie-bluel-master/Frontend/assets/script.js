const WORK_URL = "http://localhost:5678/api/works";
const CATEGORY_URL = "http://localhost:5678/api/categories";

// Check if user is logged in and logout link

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
  categoriesContainer.innerHTML = ""; // Clear existing content

  // Create "All" filter
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
  gallery.innerHTML = ""; // Clear existing content

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

// modal functionality (if needed) can be added here
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
  modalGallery.innerHTML = ""; // Clear existing content

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

    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      console.log("delete id:", work.id);
    });

    figure.appendChild(img);
    figure.appendChild(deleteBtn);
    modalGallery.appendChild(figure);
  });
}

// Initialize the page
async function init() {
  const works = await loadGallery();
  displayWorks(works);
  displayModalGallery(works);
  const categories = await loadCategories();
  displayCategories(categories);
}

init();
