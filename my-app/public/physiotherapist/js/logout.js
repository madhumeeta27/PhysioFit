// Importing Firebase authentication (adjust based on your Firebase setup)
import { getAuth } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";

const auth = getAuth();

// Handle logout functionality
async function handleLogout() {
  try {
    await auth.signOut();
    window.location.href = "/login";
    console.log("User logged out successfully!");
  } catch (error) {
    console.error("Error logging out:", error.message);
  }
}

// Attach event listener once DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", handleLogout);
  }
});
