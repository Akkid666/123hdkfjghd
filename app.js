const loginPanel = document.querySelector("#login-panel");
const filesPanel = document.querySelector("#files-panel");
const loginForm = document.querySelector("#login-form");
const loginError = document.querySelector("#login-error");
const listError = document.querySelector("#list-error");
const fileList = document.querySelector("#file-list");
const logout = document.querySelector("#logout");

function showSignedIn() {
  loginPanel.classList.add("hidden");
  filesPanel.classList.remove("hidden");
  logout.classList.remove("hidden");
  loadFiles();
}
function showSignedOut() {
  loginPanel.classList.remove("hidden");
  filesPanel.classList.add("hidden");
  logout.classList.add("hidden");
}
async function loadFiles() {
  fileList.innerHTML = '<p class="muted">Loading…</p>';
  listError.textContent = "";
  const response = await fetch("/api/files");
  if (response.status === 401) return showSignedOut();
  if (!response.ok) {
    fileList.innerHTML = "";
    listError.textContent = "Could not load files.";
    return;
  }
  const data = await response.json();
  fileList.innerHTML = "";
  if (!data.files.length) {
    fileList.innerHTML = '<p class="muted">No files uploaded yet.</p>';
    return;
  }
  for (const file of data.files) {
    const row = document.createElement("div");
    row.className = "file";
    const info = document.createElement("div");
    const name = document.createElement("div");
    name.className = "file-name";
    name.textContent = file.name;
    const meta = document.createElement("div");
    meta.className = "file-meta";
    const date = file.uploadedAt ? new Date(file.uploadedAt).toLocaleString() : "";
    meta.textContent = `${formatSize(file.size)}${date ? " · " + date : ""}`;
    info.append(name, meta);
    const link = document.createElement("a");
    link.className = "button download";
    link.textContent = "Download";
    link.href = `/api/download?pathname=${encodeURIComponent(file.pathname)}`;
    row.append(info, link);
    fileList.append(row);
  }
}
function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
loginForm.addEventListener("submit", async event => {
  event.preventDefault();
  loginError.textContent = "";
  const password = document.querySelector("#password").value;
  const response = await fetch("/api/auth/login", {
    method: "POST", headers: {"Content-Type":"application/json"},
    body: JSON.stringify({password})
  });
  if (!response.ok) {
    loginError.textContent = "Sign-in failed. Check your password.";
    return;
  }
  loginForm.reset();
  showSignedIn();
});
logout.addEventListener("click", async () => {
  await fetch("/api/auth/logout", {method:"POST"});
  showSignedOut();
});
fetch("/api/files").then(response => {
  if (response.ok) showSignedIn();
  else showSignedOut();
}).catch(showSignedOut);
