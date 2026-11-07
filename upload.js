const loginPanel = document.querySelector("#login-panel");
const uploadPanel = document.querySelector("#upload-panel");
const loginForm = document.querySelector("#login-form");
const loginError = document.querySelector("#login-error");
const uploadForm = document.querySelector("#upload-form");
const statusBox = document.querySelector("#upload-status");
const fileInput = document.querySelector("#files");

function signedIn() {
  loginPanel.classList.add("hidden");
  uploadPanel.classList.remove("hidden");
}
function signedOut() {
  loginPanel.classList.remove("hidden");
  uploadPanel.classList.add("hidden");
}
loginForm.addEventListener("submit", async event => {
  event.preventDefault();
  loginError.textContent = "";
  const password = document.querySelector("#password").value;
  const response = await fetch("/api/auth/login", {
    method:"POST", headers:{"Content-Type":"application/json"},
    body:JSON.stringify({password})
  });
  if (!response.ok) {
    loginError.textContent = "Sign-in failed. Check your password.";
    return;
  }
  loginForm.reset();
  signedIn();
});
uploadForm.addEventListener("submit", async event => {
  event.preventDefault();
  statusBox.textContent = "";
  const files = Array.from(fileInput.files || []);
  if (!files.length) return;
  if (files.length > 2) {
    statusBox.textContent = "Choose no more than two files at a time.";
    return;
  }
  for (const file of files) {
    if (file.size > 4 * 1024 * 1024) {
      statusBox.textContent = `${file.name} is larger than 4 MB.`;
      return;
    }
  }
  for (const file of files) {
    statusBox.textContent = `Uploading ${file.name}…`;
    const response = await fetch("/api/upload", {
      method:"POST",
      headers:{"Content-Type":"application/octet-stream","X-File-Name":encodeURIComponent(file.name)},
      body:file
    });
    if (response.status === 401) {
      signedOut();
      statusBox.textContent = "Your session expired. Sign in again.";
      return;
    }
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      statusBox.textContent = error.error || `Could not upload ${file.name}.`;
      return;
    }
  }
  uploadForm.reset();
  statusBox.textContent = "Upload complete. Your files are stored privately.";
});
fetch("/api/files").then(response => {
  if (response.ok) signedIn();
  else signedOut();
}).catch(signedOut);
