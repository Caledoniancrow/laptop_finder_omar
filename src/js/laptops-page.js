import { fetchLaptops } from "./api.js";
import { setupHeader, updateSavedCounts } from "./header.js";
import {
  CATEGORIES,
  bindFavoriteButtons,
  formatPrice,
  renderLaptopCards,
  renderLoadError,
  renderMessage,
  renderSkeletons,
} from "./ui.js";

const searchInput = document.querySelector("#search-input");
const categoryFilter = document.querySelector("#category-filter");
const priceFilter = document.querySelector("#price-filter");
const priceOutput = document.querySelector("#price-output");
const ramFilter = document.querySelector("#ram-filter");
const sortSelect = document.querySelector("#sort-select");
const resetButton = document.querySelector("#reset-filters");
const resultCount = document.querySelector("#result-count");
const laptopGrid = document.querySelector("#laptop-grid");

let allLaptops = [];

const fillCategoryOptions = () => {
  const categoryOptions = CATEGORIES.map((category) => `<option value="${category.id}">${category.label}</option>`);
  categoryFilter.innerHTML = [`<option value="all">All categories</option>`, ...categoryOptions].join("");
};

const setupPriceRange = (laptops) => {
  const prices = laptops.map((laptop) => laptop.price);
  priceFilter.min = Math.floor(Math.min(...prices) / 1000) * 1000;
  priceFilter.max = Math.ceil(Math.max(...prices) / 1000) * 1000;
  priceFilter.value = priceFilter.max;
  priceFilter.disabled = false;
};

const readFilters = () => ({
  query: searchInput.value.trim().toLowerCase(),
  category: categoryFilter.value,
  maxPrice: Number(priceFilter.value),
  minRam: Number(ramFilter.value),
});

const matchesFilters = (laptop, filters) => {
  const matchesSearch =
    laptop.name.toLowerCase().includes(filters.query) || laptop.brand.toLowerCase().includes(filters.query);
  const matchesCategory = filters.category === "all" || laptop.category === filters.category;
  return matchesSearch && matchesCategory && laptop.price <= filters.maxPrice && laptop.ramGB >= filters.minRam;
};

const sortLaptops = (laptops, sortValue) => {
  if (sortValue === "default") {
    return laptops;
  }
  const [key, direction] = sortValue.split("-");
  return [...laptops].sort((first, second) =>
    direction === "asc" ? first[key] - second[key] : second[key] - first[key],
  );
};

const applyFilters = () => {
  const filters = readFilters();
  const matches = allLaptops.filter((laptop) => matchesFilters(laptop, filters));
  const sortedLaptops = sortLaptops(matches, sortSelect.value);
  priceOutput.textContent = `Up to ${formatPrice(filters.maxPrice)}`;
  resultCount.textContent = `Showing ${sortedLaptops.length} of ${allLaptops.length} laptops`;
  if (sortedLaptops.length === 0) {
    renderMessage(laptopGrid, {
      title: "No laptop matches these filters",
      text: "Try a higher maximum price, a smaller memory size or a different search word.",
      actionHTML: `<button type="button" class="btn-action" data-reset>Reset filters</button>`,
    });
    return;
  }
  renderLaptopCards(laptopGrid, sortedLaptops);
};

const resetFilters = () => {
  searchInput.value = "";
  categoryFilter.value = "all";
  priceFilter.value = priceFilter.max;
  ramFilter.value = "0";
  sortSelect.value = "default";
  applyFilters();
};

const applyCategoryFromUrl = () => {
  const params = new URLSearchParams(window.location.search);
  const categoryId = params.get("category");
  if (CATEGORIES.some((category) => category.id === categoryId)) {
    categoryFilter.value = categoryId;
  }
};

const bindFilterEvents = () => {
  searchInput.addEventListener("input", applyFilters);
  priceFilter.addEventListener("input", applyFilters);
  [categoryFilter, ramFilter, sortSelect].forEach((control) => {
    control.addEventListener("change", applyFilters);
  });
  resetButton.addEventListener("click", resetFilters);
  laptopGrid.addEventListener("click", (event) => {
    if (event.target.closest("[data-reset]")) {
      resetFilters();
    }
  });
};

const startCatalogue = async () => {
  fillCategoryOptions();
  renderSkeletons(laptopGrid, 6);
  try {
    allLaptops = await fetchLaptops();
    setupPriceRange(allLaptops);
    applyCategoryFromUrl();
    bindFilterEvents();
    applyFilters();
  } catch (error) {
    resultCount.textContent = "No laptops to show";
    priceOutput.textContent = "Not available";
    renderLoadError(laptopGrid, error);
  }
};

setupHeader();
bindFavoriteButtons(laptopGrid, updateSavedCounts);
startCatalogue();
