// Use the Express server for API requests in both modes:
// 1) Live Server: http://127.0.0.1:5500/frontend/...
// 2) Express:    http://localhost:5000/...
const API_BASE = window.location.port === "5500"
  ? "http://localhost:5000/api"
  : "/api";

function getToken() {
  return localStorage.getItem("saturn_token");
}

function getUser() {
  try {
    return JSON.parse(localStorage.getItem("saturn_user")) || null;
  } catch {
    return null;
  }
}

function setAuth(data) {
  localStorage.setItem("saturn_token", data.token);
  localStorage.setItem("saturn_user", JSON.stringify(data.user));
}

function clearAuth() {
  localStorage.removeItem("saturn_token");
  localStorage.removeItem("saturn_user");
}

async function apiFetch(url, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  const token = getToken();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong.");
  }

  return data;
}

function requireAuth() {
  if (!getToken()) {
    window.location.href = "login.html";
  }
}

function logout() {
  clearAuth();
  window.location.href = "login.html";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function showToast(message) {
  let toast = document.querySelector(".toast");

  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => toast.classList.remove("show"), 2200);
}

function avatarPath(avatar) {
  return avatar || "images/logoimg.png";
}
