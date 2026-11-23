import { fetchLaptops, findLaptopById } from "./api.js";
import { setupHeader, updateSavedCounts } from "./header.js";
import { clearFavorites, getFavoriteIds } from "./storage.js";
import {
  bindFavoriteButtons,
  formatPrice,
  renderLaptopCards,
  renderLoadError,
  renderMessage,
  renderSkeletons,
} from "./ui.js";

const favoritesGrid = document.querySelector("#favorites-grid");
const summary = document.querySelector("#favorites-summary");
const countOutput = document.querySelector("#favorites-count");
const totalOutput = document.querySelector("#favorites-total");
const averageOutput = document.querySelector("#favorites-average");
const clearButton = document.querySelector("#clear-favorites");

let allLaptops = [];

const getSavedLaptops = () =>
  getFavoriteIds()
    .map((laptopId) => findLaptopById(allLaptops, laptopId))
    .filter((laptop) => laptop !== undefined);

const showTotals = (laptops) => {
  const totalPrice = laptops.reduce((sum, laptop) => sum + laptop.price, 0);
  const averagePrice = Math.round(totalPrice / laptops.length);
  countOutput.textContent = laptops.length;
  totalOutput.textContent = formatPrice(totalPrice);
  averageOutput.textContent = formatPrice(averagePrice);
};

const renderFavorites = () => {
  const savedLaptops = getSavedLaptops();
  summary.classList.toggle("hidden", savedLaptops.length === 0);
  if (savedLaptops.length === 0) {
    renderMessage(favoritesGrid, {
      title: "You have not saved any laptops yet",
      text: "Press Save on any laptop card or details page, and it will wait for you here.",
      actionHTML: `<a href="laptops.html" class="btn-action">Browse all laptops</a>`,
    });
    return;
  }
  showTotals(savedLaptops);
  renderLaptopCards(favoritesGrid, savedLaptops, "Save", "Remove");
};

const startFavorites = async () => {
  renderSkeletons(favoritesGrid, 3);
  try {
    allLaptops = await fetchLaptops();
    renderFavorites();
  } catch (error) {
    renderLoadError(favoritesGrid, error);
  }
};

clearButton.addEventListener("click", () => {
  const savedCount = getFavoriteIds().length;
  if (window.confirm(`Remove all ${savedCount} saved laptops from your favorites?`)) {
    clearFavorites();
    updateSavedCounts();
    renderFavorites();
  }
});

setupHeader();
bindFavoriteButtons(favoritesGrid, () => {
  updateSavedCounts();
  renderFavorites();
});
startFavorites();
