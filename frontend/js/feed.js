document.addEventListener("DOMContentLoaded", async () => {
  requireAuth();
  setupNavigation();
  setupCreatePost();
  await loadSidebarUser();
  await loadPosts();
});

function setupNavigation() {
  const user = getUser();

  document.querySelectorAll("[data-profile-link]").forEach((link) => {
    if (user?.username) {
      link.href = `profile.html?username=${encodeURIComponent(user.username)}`;
    }
  });

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
  }
}

async function loadSidebarUser() {
  try {
    const user = await apiFetch("/users/me");

    document.getElementById("sidebarAvatar").src = avatarPath(user.avatar);
    document.getElementById("sidebarName").textContent = user.name;
    document.getElementById("sidebarUsername").textContent = `@${user.username}`;
    document.getElementById("sidebarBio").textContent = user.bio || "Saturn user";
  } catch (error) {
    showToast(error.message);
  }
}

function setupCreatePost() {
  const form = document.getElementById("createPostForm");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const content = document.getElementById("postContent").value;
    const image = document.getElementById("postImage").value;

    if (!content.trim()) return;

    try {
      await apiFetch("/posts", {
        method: "POST",
        body: JSON.stringify({ content, image })
      });

      form.reset();
      showToast("Post published.");
      await loadPosts();
    } catch (error) {
      showToast(error.message);
    }
  });
}

async function loadPosts() {
  const feed = document.getElementById("feed");

  try {
    const posts = await apiFetch("/posts");

    if (!posts.length) {
      feed.innerHTML = `
        <div class="card empty-state">
          <h3>No posts yet</h3>
          <p>Be the first person to post something on Saturn.</p>
        </div>
      `;
      return;
    }

    feed.innerHTML = posts.map(renderPost).join("");

    document.querySelectorAll("[data-like]").forEach((button) => {
      button.addEventListener("click", handleLike);
    });

    document.querySelectorAll("[data-comments]").forEach((button) => {
      button.addEventListener("click", async () => {
        const id = button.dataset.comments;
        const box = document.getElementById(`comments-${id}`);
        box.classList.toggle("hidden");

        if (!box.classList.contains("hidden")) {
          await loadComments(id);
        }
      });
    });

    document.querySelectorAll("[data-comment-form]").forEach((form) => {
      form.addEventListener("submit", handleComment);
    });

    document.querySelectorAll("[data-delete-post]").forEach((button) => {
      button.addEventListener("click", handleDeletePost);
    });
  } catch (error) {
    feed.innerHTML = `<div class="card empty-state">${escapeHtml(error.message)}</div>`;
  }
}

function renderPost(post) {
  const currentUser = getUser();
  const isMine = currentUser && Number(currentUser.id) === Number(post.user_id);

  return `
    <article class="card post">
      <div class="post-header">
        <a class="user-meta" href="profile.html?username=${encodeURIComponent(post.username)}">
          <img class="avatar" src="${avatarPath(post.avatar)}" alt="Avatar">
          <div>
            <strong>${escapeHtml(post.name)}</strong>
            <div class="username">@${escapeHtml(post.username)}</div>
          </div>
        </a>
        <div>
          <div class="post-time">${escapeHtml(post.created_at)}</div>
          ${isMine ? `<button class="action-btn" data-delete-post="${post.id}" title="Delete post"><i class="fa-solid fa-trash"></i></button>` : ""}
        </div>
      </div>

      <div class="post-text">${escapeHtml(post.content)}</div>

      ${post.image ? `<img class="post-image" src="${escapeHtml(post.image)}" alt="Post image">` : ""}

      <div class="post-actions">
        <button class="action-btn ${post.liked_by_me ? "liked" : ""}" data-like="${post.id}">
          <i class="fa-${post.liked_by_me ? "solid" : "regular"} fa-heart"></i>
          <span>${post.like_count}</span>
        </button>
        <button class="action-btn" data-comments="${post.id}">
          <i class="fa-regular fa-comment"></i>
          <span>${post.comment_count}</span>
        </button>
      </div>

      <div id="comments-${post.id}" class="comments hidden">
        <div class="comments-list" id="comments-list-${post.id}"></div>
        <form class="comment-input-row" data-comment-form="${post.id}">
          <input class="input" name="comment" placeholder="Write a comment..." required>
          <button class="btn btn-primary" type="submit">Send</button>
        </form>
      </div>
    </article>
  `;
}

async function handleLike(event) {
  const button = event.currentTarget;
  const postId = button.dataset.like;

  try {
    const data = await apiFetch(`/likes/${postId}`, { method: "POST" });
    const icon = button.querySelector("i");
    const count = button.querySelector("span");

    button.classList.toggle("liked", data.liked);
    icon.className = data.liked ? "fa-solid fa-heart" : "fa-regular fa-heart";
    count.textContent = data.like_count;
  } catch (error) {
    showToast(error.message);
  }
}

async function handleComment(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const postId = form.dataset.commentForm;
  const input = form.querySelector("input[name='comment']");

  try {
    await apiFetch("/comments", {
      method: "POST",
      body: JSON.stringify({
        post_id: postId,
        comment: input.value
      })
    });

    input.value = "";
    await loadComments(postId);
    showToast("Comment added.");
  } catch (error) {
    showToast(error.message);
  }
}

async function loadComments(postId) {
  const target = document.getElementById(`comments-list-${postId}`);

  try {
    const comments = await apiFetch(`/comments/post/${postId}`);

    if (!comments.length) {
      target.innerHTML = `<div class="muted">No comments yet.</div>`;
      return;
    }

    target.innerHTML = comments.map((comment) => `
      <div class="comment">
        <img class="avatar small" src="${avatarPath(comment.avatar)}" alt="Avatar">
        <div class="comment-content">
          <strong>${escapeHtml(comment.name)}</strong>
          <div class="muted">@${escapeHtml(comment.username)}</div>
          <div>${escapeHtml(comment.comment)}</div>
        </div>
      </div>
    `).join("");
  } catch (error) {
    target.innerHTML = `<div class="muted">${escapeHtml(error.message)}</div>`;
  }
}

async function handleDeletePost(event) {
  const postId = event.currentTarget.dataset.deletePost;

  if (!confirm("Delete this post?")) return;

  try {
    await apiFetch(`/posts/${postId}`, { method: "DELETE" });
    showToast("Post deleted.");
    await loadPosts();
  } catch (error) {
    showToast(error.message);
  }
}
