const savedTheme = localStorage.getItem("theme") || "light";
setTheme(savedTheme);

function setLikeTheme(img, hasLiked) {
  if (savedTheme === "dark") {
    img.src = hasLiked ? "/img/unliked.svg" : "/img/liked.svg";
  } else if (savedTheme === "light") {
    img.src = hasLiked ? "/img/unliked2.svg" : "/img/liked2.svg";
  }
  return img.src;
}

function likeQuote(id, elementId) {
  let likedQuotes = getLikedQuotes();
  const hasLiked = likedQuotes.includes(id);

  fetch(`/like/${id}`, {
    method: "POST",
    body: JSON.stringify({ action: hasLiked ? "unlike" : "like" }),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        document.getElementById(elementId).textContent = data.likes;
        const img = document.getElementById(`likesImg-${id}`);
        if (img) {
          img.src = setLikeTheme(img, hasLiked);
          console.log(img.src);
        }
        if (hasLiked) {
          removeLikedQuote(id);
        } else {
          saveLikedQuote(id);
        }
      } else {
        console.error("Failed to update likes:", data.message);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function getLikedQuotes() {
  return JSON.parse(localStorage.getItem("likedQuotes")) || [];
}

function saveLikedQuote(id) {
  let likedQuotes = getLikedQuotes();
  if (!likedQuotes.includes(id)) {
    likedQuotes.push(id);
    localStorage.setItem("likedQuotes", JSON.stringify(likedQuotes));
  }
}

function removeLikedQuote(id) {
  let likedQuotes = getLikedQuotes();
  likedQuotes = likedQuotes.filter((quoteId) => quoteId !== id);
  localStorage.setItem("likedQuotes", JSON.stringify(likedQuotes));
}

function infoAboutQuote(id) {
  fetch(`/quote/${id}`, { method: "POST" })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        window.location.href = `/quote/${id}`;
      } else {
        console.error("Failed to load info:", data.message);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

document.addEventListener("DOMContentLoaded", () => {
  const themeSwitcher = document.getElementById("themeSwitcher");

  if (themeSwitcher) {
    themeSwitcher.addEventListener("click", userMode);
  }
});

function setTheme(theme) {
  const root = document.documentElement;
  const modeIcon = document.getElementById("mode_icon");
  const imgAdd = document.getElementById("img_add");
  const info = document.getElementsByClassName("info_icon");
  const likeImgs = document.querySelectorAll("[id^=likesImg-]");

  if (theme === "light") {
    root.style.setProperty("--textColor", "#333333");
    root.style.setProperty("--bgColorHeader", "#ffffff");
    root.style.setProperty("--bgColorBody", "#f9f9f9");
    root.style.setProperty("--secTextColor", "#555555");
    root.style.setProperty("--borderBottomHeader", "#28a745 0.3vh solid");
    root.style.setProperty("--bgColorBtn", "#28a745");
    root.style.setProperty("--tagBorder", "0.0625rem solid #dddddd");
    root.style.setProperty("--tagChecked", "#28a745");
    root.style.setProperty("--cardColor", "#ffffff");
    root.style.setProperty("--secCardColor", "#f9f9f9");
    root.style.setProperty("--btnHover", "#218838");

    if (modeIcon) {
      modeIcon.src = "/img/moon.svg";
    }
    if (imgAdd) {
      imgAdd.src = "/img/turtle.jpg";
    }
    Array.from(info).forEach(icon => {
      icon.src = "/img/info2.svg";
    });

    localStorage.setItem("theme", "light");

    likeImgs.forEach(img => {
      const id = img.id.split("-")[1];
      const hasLiked = getLikedQuotes().includes(id);
      setLikeTheme(img, hasLiked);
    });

  } else {
    root.style.setProperty("--textColor", "#ffffff");
    root.style.setProperty("--bgColorHeader", "#333333");
    root.style.setProperty("--bgColorBody", "#222222");
    root.style.setProperty("--secTextColor", "#ff6347");
    root.style.setProperty("--borderBottomHeader", "#ff6347 0.3vh solid");
    root.style.setProperty("--bgColorBtn", "#ff6347");
    root.style.setProperty("--tagBorder", "0.0625rem solid #444444");
    root.style.setProperty("--tagChecked", "#ff6347");
    root.style.setProperty("--cardColor", "#1a1a1a");
    root.style.setProperty("--secCardColor", "#121212");
    root.style.setProperty("--btnHover", "#ff6347");

    if (modeIcon) {
      modeIcon.src = "/img/sun.svg";
    }
    if (imgAdd) {
      imgAdd.src = "/img/addImg.png";
    }
    Array.from(info).forEach(icon => {
      icon.src = "/img/info.svg";
    });

    localStorage.setItem("theme", "dark");
    likeImgs.forEach(img => {
      const id = img.id.split("-")[1]; // Extract the id part
      const hasLiked = getLikedQuotes().includes(id);
      setLikeTheme(img, hasLiked);
    });
  }
}

function userMode() {
  const currentTheme = localStorage.getItem("theme") || "light";
  setTheme(currentTheme === "light" ? "dark" : "light");
}
