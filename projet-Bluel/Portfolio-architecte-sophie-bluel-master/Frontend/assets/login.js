function userConnexion() {
  const form = document.querySelector(".login-form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.querySelector("#username").value;
    const password = document.querySelector("#password").value;

    try {
      const response = await fetch("http://localhost:5678/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Identifiant ou mot de passe incorrect");
      }
      const data = await response.json();
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.userId);
      window.location.href = "index.html";
    } catch (error) {
      console.log(error);
      alert(error.message);
    }
  });
}
userConnexion();
