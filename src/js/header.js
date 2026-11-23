import { getCompareIds, getFavoriteIds, getTheme, saveTheme } from "./storage.js";

export const updateSavedCounts = () => {
  const favoriteCount = getFavoriteIds().length;
  const compareCount = getCompareIds().length;
  document.querySelectorAll("[data-favorites-count]").forEach((badge) => {
    badge.textContent = favoriteCount;
  });
  document.querySelectorAll("[data-compare-count]").forEach((badge) => {
    badge.textContent = compareCount;
  });
};

const applyTheme = (theme) => {
  document.documentElement.dataset.theme = theme;
  document.querySelectorAll("[data-theme-choice]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.themeChoice === theme));
  });
};

const setupThemeSwitch = () => {
  applyTheme(getTheme());
  document.querySelectorAll("[data-theme-choice]").forEach((button) => {
    button.addEventListener("click", () => {
      saveTheme(button.dataset.themeChoice);
      applyTheme(button.dataset.themeChoice);
    });
  });
};

const setupMenuToggle = () => {
  const menuButton = document.querySelector("#menu-toggle");
  const siteNav = document.querySelector("#site-nav");

  const setMenuOpen = (isOpen) => {
    menuButton.setAttribute("aria-expanded", String(isOpen));
    siteNav.classList.toggle("hidden", !isOpen);
  };

  menuButton.addEventListener("click", () => {
    setMenuOpen(menuButton.getAttribute("aria-expanded") !== "true");
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") {
      setMenuOpen(false);
      menuButton.focus();
    }
  });
};

export const setupHeader = () => {
  setupThemeSwitch();
  setupMenuToggle();
  updateSavedCounts();
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
      window.location.reload();
    }
  });
};
