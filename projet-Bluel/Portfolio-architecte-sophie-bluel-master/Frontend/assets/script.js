const API_URL = "http://localhost:5678/api/works";

async function loadGallery() {
  try {
    const response = await fetch(API_URL);
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

async function initGallery() {
  const works = await loadGallery();
  displayWorks(works);
}

initGallery();
