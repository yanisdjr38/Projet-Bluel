//====Configuration et sélecteurs globaux====//

const WORK_URL = "http://localhost:5678/api/works";
const CATEGORY_URL = "http://localhost:5678/api/categories";
const categoriesContainer = document.querySelector(".categories");
const token = localStorage.getItem("token");

//====Authentification / état connecté====//

// Vérifier le lien de connexion et de déconnexion
function isLoggedIn() {
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

isLoggedIn();

//====API – Récupération des données====//

// Charger et afficher la galerie

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

// Charger et afficher les catégories

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

//====Galerie principale (DOM)====//

// Afficher les œuvres dans la galerie

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

//====Filtres / Catégories====//

// Afficher les catégories sous forme de boutons et dans une liste déroulante

function displayCategories(categories) {
  const categorySelect = document.getElementById("category");
  if (!categorySelect) return;

  categorySelect.innerHTML = "";

  const option = document.createElement("option");
  option.value = "";
  option.textContent = "";
  option.disabled = true;
  option.selected = true;
  categorySelect.appendChild(option);

  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category.id;
    option.textContent = category.name;
    categorySelect.appendChild(option);
  });
}

// rend les boutons actifs

function setActiveButton(activeButton) {
  document.querySelectorAll(".categories button").forEach((btn) => {
    btn.classList.remove("active");
  });
  activeButton.classList.add("active");
}

// "Tous" filter
function createAllFilter() {
  const allFilter = document.createElement("button");
  allFilter.classList.add("category-btn", "active");
  allFilter.textContent = "Tous";

  allFilter.addEventListener("click", () => {
    setActiveButton(allFilter);
    init();
  });
  categoriesContainer.appendChild(allFilter);
}

// Boutons de catégories
function createCategoryButtons(categories) {
  categories.forEach((category) => {
    const button = document.createElement("button");
    button.classList.add("category-btn");
    button.textContent = category.name;

    button.addEventListener("click", async () => {
      setActiveButton(button);

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

//====Modale – Ouverture/Fermeture + Navigation entre vues====//

// modal fonctionnalité
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

// Vue modale
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

//====Modale – Galerie (DOM) + suppression d'œuvre====//

//Modal Galerie

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

    // Ajouter l'événement de suppression

    deleteBtn.addEventListener("click", deleteWork);
    figure.appendChild(img);
    figure.appendChild(deleteBtn);
    modalGallery.appendChild(figure);
  });
}
// Fonction de suppression d'œuvre
function deleteWork(e) {
  const deleteBtn = e.currentTarget;
  const figure = deleteBtn.parentElement;
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
      // Supprimer la figure de la galerie modale
      figure.remove();
      // Rafraîchir également la galerie principale
      init();
    })
    .catch((error) => {
      console.error("Error deleting work:", error);
    });
}

//====Formulaire d’ajout (preview + bouton + envoi)====//

// Fonction Aperçu Image
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

//Toggle Bouton Valider
function toggleSubmitButton() {
  const titleInput = document.getElementById("title").value.trim();
  const categorySelect = document.getElementById("category").value;
  const fileInput = document.getElementById("photo").files.length > 0;
  const submitBtn = document.querySelector(".validate-add");

  if (titleInput && categorySelect && fileInput && submitBtn) {
    submitBtn.disabled = false;
    submitBtn.classList.add("enabled");
  } else {
    submitBtn.disabled = true;
    submitBtn.classList.remove("enabled");
  }
}

// Ajouter une œuvre
function addWork() {
  const addWorkForm = document.getElementById("add-photo-form");
  if (!addWorkForm) return;

  const titleInput = document.getElementById("title");
  const categorySelect = document.getElementById("category");
  const fileInput = document.getElementById("photo");

  [titleInput, categorySelect, fileInput].forEach((input) => {
    input.addEventListener("input", toggleSubmitButton);
    input.addEventListener("change", toggleSubmitButton);
  });

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
    if (file.size > 4 * 1024 * 1024) {
      alert("La taille de l'image ne doit pas dépasser 4 Mo.");
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

      // Réinitialiser le formulaire
      await refreshGalleries();
      resetAddWorkForm();
    } catch (error) {
      console.error("Error adding work:", error);
    }
  });
}

// rafraîchir les galeries après l'ajout d'une œuvre
async function refreshGalleries() {
  const works = await loadGallery();
  displayWorks(works);
  displayModalGallery(works);
}

// réinitialiser le formulaire d'ajout d'œuvre
function resetAddWorkForm() {
  const addWorkForm = document.getElementById("add-photo-form");
  addWorkForm.reset();

  // Reset preview
  const preview = document.querySelector(".preview");
  if (preview) preview.innerHTML = "";

  // Reset selection de la catégorie
  const categorySelect = document.getElementById("category");
  if (categorySelect) categorySelect.selectedIndex = 0;

  // Reset affichage des icônes
  const icon = document.querySelector(".upload-icon");
  const btn = document.querySelector(".upload-btn");
  const instructions = document.querySelector(".photo-instructions");

  if (icon) icon.style.display = "block";
  if (btn) btn.style.display = "block";
  if (instructions) instructions.style.display = "block";

  // Reset bouton de soumission
  const submitBtn = document.querySelector(".validate-add");
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.classList.remove("enabled");
  }
}

addWork();

//====Initialisation (bootstrap)====//

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
