const navButtons = document.querySelectorAll(".nav-btn");
const pages = document.querySelectorAll(".page");
const sidebarButtons = document.querySelectorAll(".sidebar-btn");
const exclusivePages = document.querySelectorAll(".exclusive-page");
const backButtons = document.querySelectorAll(".back-btn");
const termsModal = document.getElementById("termsModal");
const termsScroll = document.getElementById("termsScroll");
const termsButtons = document.getElementById("termsButtons");
const agreeButton = document.getElementById("agreeButton");
const ageButton = document.getElementById("ageButton");
const signupButton = document.getElementById("signupButton");
const signupOverlay = document.getElementById("signupOverlay");
const adminModal = document.getElementById("adminModal");
const adminSubmit = document.getElementById("adminSubmit");
const adminCode = document.getElementById("adminCode");
const adminError = document.getElementById("adminError");
const adminContent = document.getElementById("adminContent");
const imagesColumn = document.getElementById("imagesColumn");
const videosColumn = document.getElementById("videosColumn");
const profileImage = document.getElementById("profileImage");
const bannerImage = document.getElementById("bannerImage");
const supportForm = document.getElementById("supportForm");
const supportInputs = [
  document.getElementById("supportName"),
  document.getElementById("supportEmail"),
  document.getElementById("supportDescription"),
];
const supportSubmit = document.getElementById("supportSubmit");
const wordCount = document.getElementById("wordCount");
const deleteModal = document.getElementById("deleteModal");
const deleteYes = document.getElementById("deleteYes");
const deleteNo = document.getElementById("deleteNo");
const fullscreenOverlay = document.getElementById("fullscreenOverlay");
const fullscreenContent = document.getElementById("fullscreenContent");
const collapseButton = document.getElementById("collapseButton");

const storageKeys = {
  profile: "sloanex_profile",
  banner: "sloanex_banner",
  images: "sloanex_images",
  videos: "sloanex_videos",
};

let pendingDelete = null;

const setActivePage = (pageId) => {
  pages.forEach((page) => {
    page.classList.toggle("active", page.id === pageId);
  });
  navButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.target === pageId);
  });
  if (pageId === "admin") {
    checkAdmin();
  } else {
    adminModal.classList.remove("visible");
  }
};

const setExclusivePage = (pageId) => {
  exclusivePages.forEach((page) => {
    page.classList.toggle("active", page.id === pageId);
  });
  sidebarButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.exPage === pageId);
  });
};

navButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    setActivePage(btn.dataset.target);
    if (btn.dataset.target === "exclusive") {
      setExclusivePage("exclusive-main");
    }
  });
});

sidebarButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    setExclusivePage(btn.dataset.exPage);
  });
});

backButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    btn.classList.add("active");
    setTimeout(() => {
      btn.classList.remove("active");
      setExclusivePage(btn.dataset.back);
    }, 200);
  });
});

termsScroll.addEventListener("scroll", () => {
  const atBottom = termsScroll.scrollTop + termsScroll.clientHeight >= termsScroll.scrollHeight - 2;
  if (atBottom) {
    termsButtons.classList.remove("hidden");
  }
});

const checkTermsAccepted = () => {
  if (agreeButton.classList.contains("active") && ageButton.classList.contains("active")) {
    termsModal.classList.remove("visible");
  }
};

[agreeButton, ageButton].forEach((btn) => {
  btn.addEventListener("click", () => {
    btn.classList.add("active");
    checkTermsAccepted();
  });
});

signupButton.addEventListener("click", () => {
  signupOverlay.classList.add("visible");
});

signupOverlay.addEventListener("click", () => {
  signupOverlay.classList.remove("visible");
});

document.addEventListener("click", (event) => {
  if (signupOverlay.classList.contains("visible") && !signupButton.contains(event.target)) {
    signupOverlay.classList.remove("visible");
  }
});

const hashCode = async (value) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(value);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

const ADMIN_HASH = "c31e4e3a7f02bb79479befa7c3b662a8a1b4543406143ada0885a8c6a2f16368";

const unlockAdmin = () => {
  adminModal.classList.remove("visible");
  sessionStorage.setItem("sloanex_admin", "true");
};

const checkAdmin = () => {
  if (sessionStorage.getItem("sloanex_admin") === "true") {
    adminModal.classList.remove("visible");
  } else {
    adminModal.classList.add("visible");
  }
};

adminSubmit.addEventListener("click", async () => {
  adminSubmit.classList.add("active");
  const entered = adminCode.value.trim();
  const hashed = await hashCode(entered);
  if (hashed === ADMIN_HASH) {
    adminError.textContent = "";
    unlockAdmin();
  } else {
    adminError.textContent = "Incorrect code.";
  }
  setTimeout(() => adminSubmit.classList.remove("active"), 300);
});

const loadFromStorage = (key, fallback = null) => {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};

const saveToStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const renderProfile = () => {
  const data = loadFromStorage(storageKeys.profile);
  if (data) {
    profileImage.src = data;
    profileImage.parentElement.classList.add("show");
  }
};

const renderBanner = () => {
  const data = loadFromStorage(storageKeys.banner);
  if (data) {
    bannerImage.src = data;
    bannerImage.parentElement.classList.add("show");
  }
};

const createMediaCard = (src, type, clickHandler) => {
  const card = document.createElement("div");
  card.className = "media-card";
  let media;
  if (type === "video") {
    media = document.createElement("video");
    media.src = src;
    media.controls = true;
  } else {
    media = document.createElement("img");
    media.src = src;
    media.alt = "Uploaded";
  }
  card.appendChild(media);
  card.addEventListener("click", () => clickHandler(src, type));
  return card;
};

const renderExclusiveContent = () => {
  imagesColumn.innerHTML = "";
  videosColumn.innerHTML = "";
  const images = loadFromStorage(storageKeys.images, []);
  const videos = loadFromStorage(storageKeys.videos, []);
  images.forEach((src) => {
    imagesColumn.appendChild(createMediaCard(src, "image", openFullscreen));
  });
  videos.forEach((src) => {
    videosColumn.appendChild(createMediaCard(src, "video", openFullscreen));
  });
};

const renderAdminContent = () => {
  adminContent.innerHTML = "";
  const images = loadFromStorage(storageKeys.images, []);
  const videos = loadFromStorage(storageKeys.videos, []);
  const profile = loadFromStorage(storageKeys.profile);
  const banner = loadFromStorage(storageKeys.banner);
  const addAdminCard = (src, type, index) => {
    const card = document.createElement("div");
    card.className = "admin-card";
    let media;
    if (type === "video") {
      media = document.createElement("video");
      media.src = src;
    } else {
      media = document.createElement("img");
      media.src = src;
      media.alt = "Uploaded";
    }
    card.appendChild(media);
    const actions = document.createElement("div");
    actions.className = "admin-actions";
    if (type === "video") {
      const playButton = document.createElement("button");
      playButton.className = "cta";
      playButton.textContent = "Play";
      playButton.addEventListener("click", (event) => {
        event.stopPropagation();
        playButton.classList.add("active");
        media.controls = true;
        media.play();
      });
      actions.appendChild(playButton);
    }
    const deleteButton = document.createElement("button");
    deleteButton.className = "cta";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", (event) => {
      event.stopPropagation();
      deleteButton.classList.add("active");
      pendingDelete = { type, index };
      deleteModal.classList.add("visible");
    });
    actions.appendChild(deleteButton);
    card.appendChild(actions);
    adminContent.appendChild(card);
  };

  if (profile) addAdminCard(profile, "profile", 0);
  if (banner) addAdminCard(banner, "banner", 0);
  images.forEach((src, index) => addAdminCard(src, "image", index));
  videos.forEach((src, index) => addAdminCard(src, "video", index));
};

const openFullscreen = (src, type) => {
  fullscreenContent.innerHTML = "";
  let media;
  if (type === "video") {
    media = document.createElement("video");
    media.src = src;
    media.controls = true;
    media.autoplay = true;
  } else {
    media = document.createElement("img");
    media.src = src;
    media.alt = "Expanded";
  }
  fullscreenContent.appendChild(media);
  fullscreenOverlay.classList.add("visible");
};

collapseButton.addEventListener("click", () => {
  collapseButton.classList.add("active");
  fullscreenOverlay.classList.remove("visible");
  setTimeout(() => collapseButton.classList.remove("active"), 200);
});

const resetDeleteModal = () => {
  deleteYes.checked = false;
  deleteNo.checked = false;
  deleteModal.classList.remove("visible");
};

deleteYes.addEventListener("change", () => {
  if (!pendingDelete) return;
  if (pendingDelete.type === "profile") {
    localStorage.removeItem(storageKeys.profile);
  } else if (pendingDelete.type === "banner") {
    localStorage.removeItem(storageKeys.banner);
  } else {
    const key = pendingDelete.type === "image" ? storageKeys.images : storageKeys.videos;
    const items = loadFromStorage(key, []);
    items.splice(pendingDelete.index, 1);
    saveToStorage(key, items);
  }
  pendingDelete = null;
  resetDeleteModal();
  profileImage.parentElement.classList.remove("show");
  bannerImage.parentElement.classList.remove("show");
  renderProfile();
  renderBanner();
  renderExclusiveContent();
  renderAdminContent();
});

deleteNo.addEventListener("change", () => {
  pendingDelete = null;
  resetDeleteModal();
});

const setupUploaders = () => {
  const uploadCards = document.querySelectorAll(".upload-card");
  uploadCards.forEach((card) => {
    const input = card.querySelector("input");
    const dropZone = card.querySelector(".drop-zone");
    const progressBar = card.querySelector(".progress-bar");
    const progressText = card.querySelector(".progress-text");
    const timer = card.querySelector(".timer");
    let timerInterval;

    const resetProgress = () => {
      progressBar.style.width = "0%";
      progressText.textContent = "0%";
      progressText.style.color = "var(--purple)";
      timer.textContent = "0s";
      clearInterval(timerInterval);
      let seconds = 0;
      timerInterval = setInterval(() => {
        seconds += 1;
        timer.textContent = `${seconds}s`;
      }, 1000);
    };

    const completeProgress = () => {
      progressBar.style.width = "100%";
      progressText.textContent = "Complete";
      progressText.style.color = "var(--green)";
      clearInterval(timerInterval);
    };

    const handleFiles = (files) => {
      if (!files.length) return;
      resetProgress();
      const uploadType = card.dataset.upload;
      const fileArray = Array.from(files);
      let completed = 0;
      fileArray.forEach((file) => {
        const reader = new FileReader();
        reader.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.min(99, Math.round((event.loaded / event.total) * 100));
            progressBar.style.width = `${percent}%`;
            progressText.textContent = `${percent}%`;
          }
        };
        reader.onload = (event) => {
          completed += 1;
          if (uploadType === "profile") {
            saveToStorage(storageKeys.profile, event.target.result);
            renderProfile();
          } else if (uploadType === "banner") {
            saveToStorage(storageKeys.banner, event.target.result);
            renderBanner();
          } else if (uploadType === "images") {
            const images = loadFromStorage(storageKeys.images, []);
            images.push(event.target.result);
            saveToStorage(storageKeys.images, images);
          } else if (uploadType === "videos") {
            const videos = loadFromStorage(storageKeys.videos, []);
            videos.push(event.target.result);
            saveToStorage(storageKeys.videos, videos);
          }
          if (completed === fileArray.length) {
            completeProgress();
            renderExclusiveContent();
            renderAdminContent();
          }
        };
        reader.readAsDataURL(file);
      });
    };

    dropZone.addEventListener("click", () => input.click());
    dropZone.addEventListener("dragover", (event) => {
      event.preventDefault();
      dropZone.classList.add("active");
    });
    dropZone.addEventListener("dragleave", () => dropZone.classList.remove("active"));
    dropZone.addEventListener("drop", (event) => {
      event.preventDefault();
      dropZone.classList.remove("active");
      handleFiles(event.dataTransfer.files);
    });
    input.addEventListener("change", () => handleFiles(input.files));
  });
};

const updateSupportButton = () => {
  const allFilled = supportInputs.every((input) => input.value.trim().length > 0);
  supportSubmit.disabled = !allFilled;
};

supportInputs.forEach((input) => {
  input.addEventListener("input", () => {
    updateSupportButton();
    const words = supportInputs[2].value.trim().split(/\s+/).filter(Boolean).length;
    if (words > 200) {
      const trimmed = supportInputs[2].value.trim().split(/\s+/).slice(0, 200).join(" ");
      supportInputs[2].value = trimmed;
    }
    const currentWords = supportInputs[2].value.trim().split(/\s+/).filter(Boolean).length;
    wordCount.textContent = `${currentWords} / 200 words`;
  });
});

supportForm.addEventListener("submit", () => {
  supportSubmit.classList.add("active");
});

const init = () => {
  setActivePage("home");
  setExclusivePage("exclusive-main");
  renderProfile();
  renderBanner();
  renderExclusiveContent();
  renderAdminContent();
  setupUploaders();
  updateSupportButton();
};

init();
