import { fetchLaptops } from "./api.js";
import { setupHeader, updateSavedCounts } from "./header.js";
import { getFavoriteIds } from "./storage.js";
import {
  CATEGORIES,
  bindFavoriteButtons,
  formatPrice,
  renderLaptopCards,
  renderLoadError,
  renderSkeletons,
} from "./ui.js";

const categoryList = document.querySelector("#category-list");
const picksGrid = document.querySelector("#picks-grid");
const detailsStepLink = document.querySelector("#details-step");

const findCheapest = (laptops) =>
  laptops.reduce((cheapest, laptop) => (laptop.price < cheapest.price ? laptop : cheapest));

const findLongestLasting = (laptops) =>
  laptops.reduce((longest, laptop) => (laptop.batteryHours > longest.batteryHours ? laptop : longest));

const ALL_LAPTOPS_TILE = {
  label: "All laptops",
  hint: "Every category in one list",
  icon: "M4 4h7v7H4z M13 4h7v7h-7z M4 13h7v7H4z M13 13h7v7h-7z",
  soft: "bg-surface",
  ink: "text-strong",
  border: "border-line",
};

const createStatValue = (value, laptop) => `
  <span class="block text-3xl font-extrabold text-strong tabular-nums">${value}</span>
  ${laptop ? `<a href="details.html?id=${laptop.id}" class="text-sm font-bold text-ink underline underline-offset-4 hover:no-underline focus-visible:outline-2 focus-visible:outline-brand">${laptop.name}</a>` : ""}`;

const setStat = (name, html) => {
  document.querySelector(`[data-stat="${name}"]`).innerHTML = html;
};

const showSavedCount = () => {
  setStat("favorites", createStatValue(getFavoriteIds().length));
};

const createCountText = (matches) => {
  if (matches.length === 0) {
    return "No laptops yet";
  }
  return `${matches.length} laptops <span class="block font-normal whitespace-nowrap text-muted">from ${formatPrice(findCheapest(matches).price)}</span>`;
};

const createCategoryTile = (tile, href, countText) => `
  <li>
    <a href="${href}" class="flex h-full flex-col gap-1 rounded-2xl border-2 ${tile.border} ${tile.soft} p-4 text-ink transition duration-200 hover:border-band-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-band-accent motion-safe:hover:-translate-y-0.5">
      <span class="mb-1 grid size-10 place-items-center rounded-xl bg-surface ${tile.ink}">
        <svg class="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="${tile.icon}"/>
        </svg>
      </span>
      <span class="text-lg font-bold">${tile.label}</span>
      <span class="text-sm text-muted">${tile.hint}</span>
      <span class="mt-auto pt-2 text-sm font-bold tabular-nums ${tile.ink}">${countText}</span>
    </a>
  </li>`;

const renderCategories = (laptops) => {
  const categoryTiles = CATEGORIES.map((category) => {
    const countText = laptops
      ? createCountText(laptops.filter((laptop) => laptop.category === category.id))
      : "Counting laptops";
    return createCategoryTile(category, `laptops.html?category=${category.id}`, countText);
  });
  const allCountText = laptops ? createCountText(laptops) : "Counting laptops";
  categoryList.innerHTML = [...categoryTiles, createCategoryTile(ALL_LAPTOPS_TILE, "laptops.html", allCountText)].join("");
};

const loadHome = async () => {
  showSavedCount();
  renderCategories(null);
  renderSkeletons(picksGrid, 3);
  try {
    const laptops = await fetchLaptops();
    const cheapest = findCheapest(laptops);
    const longestLasting = findLongestLasting(laptops);
    const topPicks = [...laptops].sort((a, b) => b.batteryHours - a.batteryHours).slice(0, 3);
    setStat("count", createStatValue(laptops.length));
    setStat("lowest-price", createStatValue(formatPrice(cheapest.price), cheapest));
    setStat("longest-battery", createStatValue(`${longestLasting.batteryHours} hours`, longestLasting));
    renderCategories(laptops);
    renderLaptopCards(picksGrid, topPicks);
    detailsStepLink.href = `details.html?id=${longestLasting.id}`;
  } catch (error) {
    ["count", "lowest-price", "longest-battery"].forEach((name) => setStat(name, createStatValue("Not loaded")));
    renderLoadError(picksGrid, error);
  }
};

setupHeader();
bindFavoriteButtons(picksGrid, () => {
  updateSavedCounts();
  showSavedCount();
});
loadHome();
