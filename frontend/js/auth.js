document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");

  if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const message = document.getElementById("loginMessage");
      message.className = "message hidden";

      const login = document.getElementById("login").value;
      const password = document.getElementById("password").value;

      try {
        const data = await apiFetch("/auth/login", {
          method: "POST",
          body: JSON.stringify({ login, password })
        });

        setAuth(data);
        window.location.href = "index.html";
      } catch (error) {
        message.textContent = error.message;
        message.className = "message error";
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const message = document.getElementById("registerMessage");
      message.className = "message hidden";

      const payload = {
        name: document.getElementById("name").value,
        username: document.getElementById("username").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value
      };

      try {
        const data = await apiFetch("/auth/register", {
          method: "POST",
          body: JSON.stringify(payload)
        });

        setAuth(data);
        window.location.href = "index.html";
      } catch (error) {
        message.textContent = error.message;
        message.className = "message error";
      }
    });
  }
});
