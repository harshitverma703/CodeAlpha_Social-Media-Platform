document.addEventListener("DOMContentLoaded", async () => {
  requireAuth();

  const params = new URLSearchParams(window.location.search);
  const username = params.get("username");

  if (!username) {
    const me = await apiFetch("/users/me");
    window.location.href = `profile.html?username=${encodeURIComponent(me.username)}`;
    return;
  }

  document.getElementById("logoutBtn").addEventListener("click", logout);

  try {
    const user = await apiFetch(`/users/by/${encodeURIComponent(username)}`);
    renderProfile(user);
    await loadProfilePosts(user.id);

    const followBtn = document.getElementById("followBtn");
    if (Number(user.id) !== Number(getUser().id)) {
      followBtn.classList.remove("hidden");
      followBtn.textContent = user.is_following ? "Following" : "Follow";
      followBtn.addEventListener("click", async () => {
        try {
          const data = await apiFetch(`/follows/${user.id}`, { method: "POST" });
          followBtn.textContent = data.following ? "Following" : "Follow";
          const followers = document.getElementById("followersCount");
          followers.textContent = Number(followers.textContent) + (data.following ? 1 : -1);
        } catch (error) {
          showToast(error.message);
        }
      });
    } else {
      document.getElementById("editBtn").classList.remove("hidden");
      document.getElementById("editBtn").addEventListener("click", editProfile);
    }
  } catch (error) {
    document.getElementById("profileContent").innerHTML =
      `<div class="card empty-state">${escapeHtml(error.message)}</div>`;
  }
});

function renderProfile(user) {
  document.getElementById("profileAvatar").src = avatarPath(user.avatar);
  document.getElementById("profileName").textContent = user.name;
  document.getElementById("profileUsername").textContent = `@${user.username}`;
  document.getElementById("profileBio").textContent = user.bio || "No bio yet.";
  document.getElementById("postsCount").textContent = user.posts_count;
  document.getElementById("followersCount").textContent = user.followers_count;
  document.getElementById("followingCount").textContent = user.following_count;

  const current = getUser();
  const profileLink = document.getElementById("homeProfileLink");
  profileLink.href = `profile.html?username=${encodeURIComponent(current.username)}`;

  document.getElementById("logoutBtn").addEventListener("click", logout);
}

async function loadProfilePosts(userId) {
  const container = document.getElementById("profilePosts");

  try {
    const posts = await apiFetch(`/posts/user/${userId}`);

    if (!posts.length) {
      container.innerHTML = `
        <div class="card empty-state">
          <h3>No posts yet</h3>
          <p>This profile has not posted anything.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = posts.map((post) => `
      <article class="card post">
        <div class="post-header">
          <div class="user-meta">
            <img class="avatar" src="${avatarPath(post.avatar)}" alt="Avatar">
            <div>
              <strong>${escapeHtml(post.name)}</strong>
              <div class="username">@${escapeHtml(post.username)}</div>
            </div>
          </div>
          <div class="post-time">${escapeHtml(post.created_at)}</div>
        </div>
        <div class="post-text">${escapeHtml(post.content)}</div>
        ${post.image ? `<img class="post-image" src="${escapeHtml(post.image)}" alt="Post image">` : ""}
        <div class="post-actions">
          <span class="action-btn"><i class="fa-regular fa-heart"></i> ${post.like_count}</span>
          <span class="action-btn"><i class="fa-regular fa-comment"></i> ${post.comment_count}</span>
        </div>
      </article>
    `).join("");
  } catch (error) {
    container.innerHTML = `<div class="card empty-state">${escapeHtml(error.message)}</div>`;
  }
}

async function editProfile() {
  try {
    const current = await apiFetch("/users/me");
    const name = prompt("Your name:", current.name);
    if (name === null) return;
    const bio = prompt("Your bio:", current.bio || "");
    if (bio === null) return;

    await apiFetch("/users/me", {
      method: "PUT",
      body: JSON.stringify({ name, bio })
    });

    showToast("Profile updated.");
    setTimeout(() => window.location.reload(), 600);
  } catch (error) {
    showToast(error.message);
  }
}
