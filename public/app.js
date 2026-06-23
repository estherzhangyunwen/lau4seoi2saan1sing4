const requestForm = document.querySelector("#request-form");
const confirmForm = document.querySelector("#confirm-form");
const postForm = document.querySelector("#post-form");
const refreshPostsButton = document.querySelector("#refresh-posts");
const verificationMessage = document.querySelector("#verification-message");
const postMessage = document.querySelector("#post-message");
const postList = document.querySelector("#post-list");
const emailInput = document.querySelector("#email");

function showMessage(element, message, isError = false) {
  element.textContent = message;
  element.style.color = isError ? "#b91c1c" : "#065f46";
}

async function jsonFetch(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const body = await response.json();
  if (!response.ok) {
    throw new Error(body.error || body.errors?.join(" ") || "Request failed.");
  }

  return body;
}

function serializePostForm() {
  const data = new FormData(postForm);
  return Object.fromEntries(data.entries());
}

function renderPosts(posts) {
  if (posts.length === 0) {
    postList.innerHTML = "<li>No listings yet.</li>";
    return;
  }

  postList.innerHTML = posts
    .map(
      (post) => `
      <li>
        <strong>${post.title}</strong><br />
        Area: ${post.preferredArea}<br />
        Budget: ${post.budget}<br />
        Move-in: ${post.moveInMonth}<br />
        Contact: ${post.contact}<br />
        <p>${post.notes}</p>
      </li>
    `,
    )
    .join("");
}

async function loadPosts() {
  const { posts } = await jsonFetch("/api/posts");
  renderPosts(posts);
}

async function updateAuthStatus() {
  const status = await jsonFetch("/api/auth/status");
  postForm.querySelector("button[type='submit']").disabled = !status.verified;
  if (status.verified) {
    showMessage(
      verificationMessage,
      `Verified as ${status.email}. You can publish roommate posts now.`,
    );
  }
}

requestForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const email = emailInput.value.trim();
    const result = await jsonFetch("/api/verification/request", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
    showMessage(
      verificationMessage,
      `Verification code sent. Dev code: ${result.devVerificationCode ?? "Check your email inbox"}`,
    );
  } catch (error) {
    showMessage(verificationMessage, error.message, true);
  }
});

confirmForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const email = emailInput.value.trim();
    const code = document.querySelector("#code").value.trim();
    await jsonFetch("/api/verification/confirm", {
      method: "POST",
      body: JSON.stringify({ email, code }),
    });
    await updateAuthStatus();
  } catch (error) {
    showMessage(verificationMessage, error.message, true);
  }
});

postForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const payload = serializePostForm();
    await jsonFetch("/api/posts", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    showMessage(postMessage, "Post published successfully.");
    postForm.reset();
    await loadPosts();
  } catch (error) {
    showMessage(postMessage, error.message, true);
  }
});

refreshPostsButton.addEventListener("click", async () => {
  await loadPosts();
});

await updateAuthStatus();
await loadPosts();
