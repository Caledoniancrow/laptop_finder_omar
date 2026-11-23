import { fetchLaptops, findLaptopById } from "./api.js";
import { addToComparison, removeFromComparison } from "./compare.js";
import { setupHeader, updateSavedCounts } from "./header.js";
import { MAX_COMPARE, getCompareIds } from "./storage.js";
import {
  SPEC_ROWS,
  bindFavoriteButtons,
  createBatteryMeter,
  createFavoriteButton,
  formatPrice,
  formatStorage,
  getCategory,
  renderLoadError,
  renderMessage,
  setToggleState,
} from "./ui.js";

const detailsRoot = document.querySelector("#details-root");
const pageTitle = document.querySelector("#page-title");
const pageSubtitle = document.querySelector("#page-subtitle");
const crumbCurrent = document.querySelector("#crumb-current");

const DETAIL_ROWS = [...SPEC_ROWS, { key: "id", label: "Catalogue ID", format: (laptopId) => `#${laptopId}` }];

const renderDetailsSkeleton = () => {
  detailsRoot.setAttribute("aria-busy", "true");
  detailsRoot.innerHTML = `
    <p class="sr-only" role="status">Loading the laptop</p>
    <div class="grid animate-pulse gap-8 motion-reduce:animate-none lg:grid-cols-2" aria-hidden="true">
      <div class="aspect-8/5 rounded-3xl bg-sunken"></div>
      <div class="space-y-4">
        <div class="h-8 w-28 rounded-full bg-line"></div>
        <div class="h-12 w-52 rounded-sm bg-line"></div>
        <div class="h-40 rounded-xl bg-line"></div>
        <div class="flex gap-3">
          <div class="h-11 w-44 rounded-full bg-line"></div>
          <div class="h-11 w-44 rounded-full bg-line"></div>
        </div>
      </div>
    </div>`;
};

const showMissing = (title, text) => {
  pageTitle.textContent = "Laptop not found";
  crumbCurrent.textContent = "Not found";
  pageSubtitle.textContent = "Pick a laptop from the catalogue to see its details.";
  renderMessage(detailsRoot, {
    title,
    text,
    actionHTML: `<a href="laptops.html" class="btn-action">Browse all laptops</a>`,
  });
};

const createQuickFacts = (laptop) => `
  <dl class="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line">
    <div class="bg-surface p-4">
      <dt class="text-sm text-muted">Battery life</dt>
      <dd class="mt-1">${createBatteryMeter(laptop.batteryHours)}</dd>
    </div>
    <div class="bg-surface p-4">
      <dt class="text-sm text-muted">Weight</dt>
      <dd class="mt-1 font-bold tabular-nums">${laptop.weightKg} kg</dd>
    </div>
    <div class="bg-surface p-4">
      <dt class="text-sm text-muted">Memory</dt>
      <dd class="mt-1 font-bold tabular-nums">${laptop.ramGB} GB</dd>
    </div>
    <div class="bg-surface p-4">
      <dt class="text-sm text-muted">Storage</dt>
      <dd class="mt-1 font-bold tabular-nums">${formatStorage(laptop.storageGB)}</dd>
    </div>
  </dl>`;

const createCompareButton = (laptop) => {
  const inComparison = getCompareIds().includes(laptop.id);
  return `
    <button type="button" id="compare-button" class="btn-action aria-pressed:bg-strong" aria-pressed="${inComparison}">
      <svg class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true">
        <path d="M3 6h7v12H3z M14 6h7v12h-7z"/>
      </svg>
      <span data-label data-off="Add to comparison" data-on="In comparison">${inComparison ? "In comparison" : "Add to comparison"}</span>
    </button>`;
};

const createSpecRow = (laptop, row) => `
  <tr>
    <th scope="row" class="w-2/5 px-4 py-3 align-top text-sm font-normal text-muted">${row.label}</th>
    <td class="px-4 py-3 font-bold tabular-nums">${row.format(laptop[row.key])}</td>
  </tr>`;

const renderLaptop = (laptop) => {
  const category = getCategory(laptop.category);
  document.title = `${laptop.name} | Student Laptop Finder`;
  pageTitle.textContent = laptop.name;
  crumbCurrent.textContent = laptop.name;
  pageSubtitle.textContent = `${category.label} laptop by ${laptop.brand}`;
  detailsRoot.removeAttribute("aria-busy");
  detailsRoot.innerHTML = `
    <div class="grid gap-8 lg:grid-cols-2 lg:items-start">
      <div class="rounded-3xl ${category.soft} p-6 sm:p-10">
        <img src="${laptop.image}" alt="Illustration of the ${laptop.name}" width="400" height="250" class="mx-auto aspect-8/5 w-full max-w-xl object-contain">
      </div>
      <div>
        <p class="inline-flex rounded-full border-2 ${category.border} bg-surface px-3 py-1 text-sm font-bold ${category.ink}">${category.label}</p>
        <p class="mt-5 text-sm text-muted">Price</p>
        <p class="text-4xl font-extrabold text-strong tabular-nums">${formatPrice(laptop.price)}</p>
        ${createQuickFacts(laptop)}
        <div class="mt-6 flex flex-wrap gap-3">
          ${createFavoriteButton(laptop, "Save to favorites", "Saved to favorites")}
          ${createCompareButton(laptop)}
        </div>
        <p id="details-message" class="mt-3 min-h-6 text-sm font-bold" role="status"></p>
      </div>
    </div>
    <div class="mt-12 grid gap-10 lg:grid-cols-[1fr_1.2fr]">
      <section aria-labelledby="about-title">
        <h2 id="about-title" class="text-2xl font-extrabold tracking-tight">About this laptop</h2>
        <div class="prose prose-lg mt-4 text-ink">
          <p>${laptop.description}</p>
        </div>
      </section>
      <section aria-labelledby="specs-title">
        <h2 id="specs-title" class="text-2xl font-extrabold tracking-tight">Full specifications</h2>
        <div class="mt-4 overflow-hidden rounded-2xl border border-line bg-surface">
          <table class="w-full text-left">
            <caption class="sr-only">Every specification of the ${laptop.name}</caption>
            <tbody class="divide-y divide-line">${DETAIL_ROWS.map((row) => createSpecRow(laptop, row)).join("")}</tbody>
          </table>
        </div>
      </section>
    </div>`;
};

const showDetailsMessage = (text, isWarning = false) => {
  const message = document.querySelector("#details-message");
  message.textContent = text;
  message.classList.toggle("text-alert", isWarning);
};

const bindDetailButtons = (laptop) => {
  const compareButton = document.querySelector("#compare-button");
  const favoriteButton = document.querySelector("[data-favorite-id]");

  bindFavoriteButtons(detailsRoot, (laptopId, saved) => {
    const inComparison = getCompareIds().includes(laptopId);
    setToggleState(compareButton, inComparison);
    if (!saved) {
      showDetailsMessage("Removed from your favorites and the comparison.");
    } else if (inComparison) {
      showDetailsMessage("Saved to your favorites and added to the comparison.");
    } else {
      showDetailsMessage("Saved to your favorites.");
    }
    updateSavedCounts();
  });

  compareButton.addEventListener("click", () => {
    if (compareButton.getAttribute("aria-pressed") === "true") {
      removeFromComparison(laptop.id);
      setToggleState(compareButton, false);
      showDetailsMessage("Removed from the comparison. It is still in your favorites.");
    } else if (addToComparison(laptop.id)) {
      setToggleState(compareButton, true);
      setToggleState(favoriteButton, true);
      showDetailsMessage("Added to the comparison and saved to your favorites.");
    } else {
      showDetailsMessage(`The comparison already has ${MAX_COMPARE} laptops. Remove one on the compare page first.`, true);
    }
    updateSavedCounts();
  });
};

const startDetails = async () => {
  const params = new URLSearchParams(window.location.search);
  const idText = params.get("id");
  if (!idText) {
    showMissing("No laptop was chosen", "This page shows one laptop at a time. Open a laptop from the catalogue to see its full specifications.");
    return;
  }
  renderDetailsSkeleton();
  try {
    const laptops = await fetchLaptops();
    const laptopId = Number(idText);
    const laptop = findLaptopById(laptops, laptopId);
    if (!laptop) {
      const reason = Number.isInteger(laptopId)
        ? `No laptop in the catalogue has the ID ${laptopId}. The link may be old or mistyped.`
        : "The link does not contain a valid laptop ID.";
      showMissing("We could not find that laptop", reason);
      return;
    }
    renderLaptop(laptop);
    bindDetailButtons(laptop);
  } catch (error) {
    pageSubtitle.textContent = "The laptop could not be loaded.";
    renderLoadError(detailsRoot, error);
  }
};

setupHeader();
startDetails();
