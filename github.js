// Elements
const searchingDiv = document.getElementById("searching");
const usernameInput = document.getElementById("username-input");
const searchBtn = document.getElementById("search-btn");
const avatarImg = document.getElementById("avatar");
const usernameText = document.getElementById("username");
const reposText = document.getElementById("repos");
const followersText = document.getElementById("followers");
const followingText = document.getElementById("following");
const companyText = document.getElementById("company");
const locationText = document.getElementById("location");
const bioText = document.getElementById("bio");
const profileLink = document.getElementById("profile-link");
const errorMsg = document.getElementById("error-msg");
const reposList = document.getElementById("repos-list");
const totalStarsText = document.getElementById("total-stars");
const totalForksText = document.getElementById("total-forks");
const ctx = document.getElementById("languageChart").getContext("2d");

let languageChart = null;

// Fallback avatar
const fallbackAvatar = "https://avatars.githubusercontent.com/u/583231?v=4";

// Fade helpers
function showData(elements) {
  elements.forEach(el => el.style.opacity = 1);
}

function hideData(elements) {
  elements.forEach(el => el.style.opacity = 0);
}

// Helper: calculate language distribution
function getLanguageStats(repos) {
  const langCount = {};
  repos.forEach(repo => {
    if(repo.language) langCount[repo.language] = (langCount[repo.language] || 0) + 1;
  });
  return langCount;
}

// Fetch GitHub user
async function getUsers(user) {
  if (!user) return alert("Please enter a GitHub username");

  searchingDiv.style.display = "flex";
  errorMsg.style.display = "none";

  hideData([
    avatarImg, usernameText, reposText, followersText, followingText,
    companyText, locationText, bioText, totalStarsText, totalForksText
  ]);
  reposList.innerHTML = "";

  searchBtn.disabled = true;
  usernameInput.disabled = true;

  try {
    // Fetch user
    const resUser = await fetch(`https://api.github.com/users/${user}`);
    if(!resUser.ok) throw new Error("User not found");
    const dataUser = await resUser.json();

    // Fetch repos
    const resRepos = await fetch(`https://api.github.com/users/${user}/repos?sort=pushed&per_page=10`);
    const reposData = await resRepos.json();

    // Update avatar
    avatarImg.src = dataUser.avatar_url || fallbackAvatar;

    // Update main details
    usernameText.textContent = dataUser.login || "-";
    reposText.textContent = dataUser.public_repos ?? "-";
    followersText.textContent = dataUser.followers ?? "-";
    followingText.textContent = dataUser.following ?? "-";

    // Other details
    companyText.textContent = dataUser.company || "-";
    locationText.textContent = dataUser.location || "-";
    bioText.textContent = dataUser.bio || "-";

    // Profile link
    profileLink.href = dataUser.html_url || "#";

    // Badges
    const totalStars = reposData.reduce((sum, r) => sum + r.stargazers_count, 0);
    const totalForks = reposData.reduce((sum, r) => sum + r.forks_count, 0);
    totalStarsText.textContent = totalStars;
    totalForksText.textContent = totalForks;

    // Top repos
    reposData.slice(0, 5).forEach(repo => {
      const card = document.createElement("div");
      card.classList.add("repo-card");
      card.innerHTML = `
        <a href="${repo.html_url}" target="_blank" style="flex:1">${repo.name}</a>
        <span>⭐ ${repo.stargazers_count} | 🍴 ${repo.forks_count}</span>
      `;
      reposList.appendChild(card);
    });

    // Language Chart
    const langStats = getLanguageStats(reposData);
    const labels = Object.keys(langStats);
    const data = Object.values(langStats);

    if(languageChart) languageChart.destroy();

    languageChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          label: 'Languages',
          data: data,
          backgroundColor: [
            '#ff6384','#36a2eb','#ffce56','#4bc0c0','#9966ff','#ff9f40','#c9cbcf'
          ]
        }]
      },
      options: { responsive:true, plugins: { legend: { position: 'bottom' } } }
    });

    showData([
      avatarImg, usernameText, reposText, followersText, followingText,
      companyText, locationText, bioText, totalStarsText, totalForksText
    ]);

  } catch(err) {
    console.error(err);
    errorMsg.textContent = err.message;
    errorMsg.style.display = "block";

    avatarImg.src = fallbackAvatar;
    usernameText.textContent = "-";
    reposText.textContent = "-";
    followersText.textContent = "-";
    followingText.textContent = "-";
    companyText.textContent = "-";
    locationText.textContent = "-";
    bioText.textContent = "-";
    totalStarsText.textContent = "-";
    totalForksText.textContent = "-";
    reposList.innerHTML = "";
    profileLink.href = "#";

    if(languageChart) languageChart.destroy();
  } finally {
    searchingDiv.style.display = "none";
    searchBtn.disabled = false;
    usernameInput.disabled = false;
  }
}

// Event listeners
searchBtn.addEventListener("click", () => {
  const user = usernameInput.value.trim();
  getUsers(user);
});

usernameInput.addEventListener("keydown", (e) => {
  if(e.key === "Enter"){
    const user = usernameInput.value.trim();
    getUsers(user);
  }
});