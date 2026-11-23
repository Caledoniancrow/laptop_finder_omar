import { isFavorite, toggleFavorite } from "./storage.js";

export const CATEGORIES = [
  {
    id: "ultrabook",
    soft: "bg-ultrabook-soft",
    ink: "text-ultrabook",
    border: "border-ultrabook/40",
    label: "Ultrabook",
    hint: "Light, with a long battery for lectures",
    icon: "M5 6.5A1.5 1.5 0 0 1 6.5 5h11A1.5 1.5 0 0 1 19 6.5V15H5z M3 18h18",
  },
  {
    id: "2-in-1",
    soft: "bg-convertible-soft",
    ink: "text-convertible",
    border: "border-convertible/40",
    label: "2-in-1",
    hint: "Touch screen that folds into a tablet",
    icon: "M4 5a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z M20 4v11l-1 3-1-3V4z",
  },
  {
    id: "gaming",
    soft: "bg-gaming-soft",
    ink: "text-gaming",
    border: "border-gaming/40",
    label: "Gaming",
    hint: "Graphics card for games and 3D work",
    icon: "M7 9h10a4 4 0 0 1 4 4v1a3 3 0 0 1-5.2 2L14 14h-4l-1.8 2A3 3 0 0 1 3 14v-1a4 4 0 0 1 4-4z M8 11v3 M6.5 12.5h3 M15.5 12h.01 M17.5 13.5h.01",
  },
  {
    id: "creator",
    soft: "bg-creator-soft",
    ink: "text-creator",
    border: "border-creator/40",
    label: "Creator",
    hint: "Sharp screen and power for design and video",
    icon: "M12 3a9 9 0 1 0 0 18c1.1 0 1.5-.9 1.2-1.7-.4-.9.1-1.8 1.1-1.8H17a4 4 0 0 0 4-4c0-5-4-9.5-9-10.5z M7.5 11h.01 M9.5 7h.01 M14.5 7h.01",
  },
  {
    id: "budget",
    soft: "bg-budget-soft",
    ink: "text-budget",
    border: "border-budget/40",
    label: "Budget",
    hint: "The basics for the lowest price",
    icon: "M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9z M7.5 7.5h.01",
  },
];

export const formatPrice = (price) => `EGP ${price.toLocaleString("en-US")}`;

export const formatStorage = (storageGB) => (storageGB >= 1000 ? `${storageGB / 1000} TB` : `${storageGB} GB`);

export const getCategory = (categoryId) => CATEGORIES.find((category) => category.id === categoryId);

export const getCategoryLabel = (categoryId) => {
  const category = getCategory(categoryId);
  return category ? category.label : categoryId;
};

export const SPEC_ROWS = [
  { key: "price", label: "Price", format: formatPrice, best: "lowest" },
  { key: "brand", label: "Brand", format: (brand) => brand },
  { key: "category", label: "Category", format: getCategoryLabel },
  { key: "cpu", label: "Processor", format: (cpu) => cpu },
  { key: "ramGB", label: "Memory (RAM)", format: (ramGB) => `${ramGB} GB`, best: "highest" },
  { key: "storageGB", label: "Storage", format: formatStorage, best: "highest" },
  { key: "batteryHours", label: "Battery life", format: (hours) => `${hours} hours`, best: "highest" },
  { key: "weightKg", label: "Weight", format: (weightKg) => `${weightKg} kg`, best: "lowest" },
  { key: "screenInches", label: "Screen size", format: (inches) => `${inches} inches` },
];

export const createBatteryMeter = (batteryHours) => {
  const filledCells = Math.min(5, Math.ceil(batteryHours / 4));
  const cells = [1, 2, 3, 4, 5]
    .map((cell) => `<span class="h-3 w-2 rounded-xs ${cell <= filledCells ? "bg-brand" : "bg-line"}"></span>`)
    .join("");
  return `
    <span class="inline-flex items-center gap-2">
      <span class="inline-flex items-center" aria-hidden="true">
        <span class="flex gap-0.5 rounded-md border-2 border-muted p-0.5">${cells}</span>
        <span class="h-2 w-1 rounded-r-sm bg-muted"></span>
      </span>
      <span class="font-bold tabular-nums">${batteryHours} h</span>
    </span>`;
};

export const createFavoriteButton = (laptop, labelOff = "Save", labelOn = "Saved") => {
  const saved = isFavorite(laptop.id);
  return `
    <button type="button" class="btn-quiet group px-3 whitespace-nowrap" data-favorite-id="${laptop.id}" aria-pressed="${saved}">
      <svg class="size-5 fill-none group-aria-pressed:fill-current" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true">
        <path d="M12 20.5s-8-4.6-8-10.4A4.6 4.6 0 0 1 12 7a4.6 4.6 0 0 1 8 3.1c0 5.8-8 10.4-8 10.4z"/>
      </svg>
      <span data-label data-off="${labelOff}" data-on="${labelOn}">${saved ? labelOn : labelOff}</span>
      <span class="sr-only">${laptop.name}</span>
    </button>`;
};

export const createLaptopCard = (laptop, labelOff = "Save", labelOn = "Saved") => {
  const category = getCategory(laptop.category) ?? { label: laptop.category, soft: "bg-sunken", ink: "text-ink" };
  return `
  <article class="laptop-card">
    <div class="relative overflow-hidden rounded-xl ${category.soft}">
      <img src="${laptop.image}" alt="" width="400" height="250" loading="lazy" class="aspect-8/5 w-full object-contain p-3">
      <span class="absolute top-3 left-3 rounded-full bg-surface px-2.5 py-1 text-xs font-bold ${category.ink}">${category.label}</span>
    </div>
    <p class="mt-4 text-sm text-muted">${laptop.brand}</p>
    <h3 class="text-lg leading-snug font-bold text-balance">${laptop.name}</h3>
    <p class="mt-2 text-2xl font-extrabold tabular-nums">${formatPrice(laptop.price)}</p>
    <dl class="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line text-sm">
      <div class="col-span-2 bg-surface px-3 py-2">
        <dt class="text-muted">Processor</dt>
        <dd class="font-bold">${laptop.cpu}</dd>
      </div>
      <div class="bg-surface px-3 py-2">
        <dt class="text-muted">Memory</dt>
        <dd class="font-bold tabular-nums">${laptop.ramGB} GB</dd>
      </div>
      <div class="bg-surface px-3 py-2">
        <dt class="text-muted">Storage</dt>
        <dd class="font-bold tabular-nums">${formatStorage(laptop.storageGB)}</dd>
      </div>
      <div class="bg-surface px-3 py-2">
        <dt class="text-muted">Weight</dt>
        <dd class="font-bold tabular-nums">${laptop.weightKg} kg</dd>
      </div>
      <div class="bg-surface px-3 py-2">
        <dt class="text-muted">Screen</dt>
        <dd class="font-bold tabular-nums">${laptop.screenInches} in</dd>
      </div>
    </dl>
    <div class="mt-3 flex items-center justify-between text-sm">
      <span class="text-muted">Battery life</span>
      ${createBatteryMeter(laptop.batteryHours)}
    </div>
    <div class="mt-auto flex flex-wrap gap-2 pt-4">
      <a href="details.html?id=${laptop.id}" class="btn-action flex-1 px-3 whitespace-nowrap">View details<span class="sr-only"> of ${laptop.name}</span></a>
      ${createFavoriteButton(laptop, labelOff, labelOn)}
    </div>
  </article>`;
};

const createSkeletonCard = () => `
  <div class="laptop-card pointer-events-none animate-pulse motion-reduce:animate-none" aria-hidden="true">
    <div class="aspect-8/5 rounded-xl bg-sunken"></div>
    <div class="mt-4 h-4 w-1/4 rounded-sm bg-line"></div>
    <div class="mt-2 h-6 w-3/4 rounded-sm bg-line"></div>
    <div class="mt-3 h-8 w-2/5 rounded-sm bg-line"></div>
    <div class="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line">
      <div class="col-span-2 h-14 bg-surface"></div>
      <div class="h-14 bg-surface"></div>
      <div class="h-14 bg-surface"></div>
      <div class="h-14 bg-surface"></div>
      <div class="h-14 bg-surface"></div>
    </div>
    <div class="mt-3 h-5 w-1/2 self-end rounded-sm bg-line"></div>
    <div class="mt-auto flex gap-2 pt-4">
      <div class="h-11 flex-1 rounded-full bg-line"></div>
      <div class="h-11 w-24 rounded-full bg-line"></div>
    </div>
  </div>`;

export const renderSkeletons = (container, count) => {
  container.setAttribute("aria-busy", "true");
  container.innerHTML = `<p class="sr-only" role="status">Loading laptops</p>${Array.from({ length: count }, createSkeletonCard).join("")}`;
};

export const renderLaptopCards = (container, laptops, labelOff, labelOn) => {
  container.removeAttribute("aria-busy");
  container.innerHTML = laptops.map((laptop) => createLaptopCard(laptop, labelOff, labelOn)).join("");
};

export const renderMessage = (container, { title, text, actionHTML = "", role = "status" }) => {
  container.removeAttribute("aria-busy");
  container.innerHTML = `
    <div class="col-span-full rounded-2xl border-2 border-dashed border-line bg-surface p-6 sm:p-8" role="${role}">
      <p class="text-xl font-bold">${title}</p>
      <p class="mt-2 max-w-prose text-muted">${text}</p>
      ${actionHTML ? `<div class="mt-5 flex flex-wrap gap-3">${actionHTML}</div>` : ""}
    </div>`;
};

export const renderLoadError = (container, error) => {
  renderMessage(container, {
    title: "The laptop list did not load",
    text: `Open the site from a local server such as VS Code Live Server, then try again. Pages opened straight from the folder cannot use fetch(). Details: ${error.message}`,
    actionHTML: `<button type="button" class="btn-action" data-retry>Try again</button>`,
    role: "alert",
  });
  container.querySelector("[data-retry]").addEventListener("click", () => window.location.reload());
};

export const setToggleState = (button, isOn) => {
  const label = button.querySelector("[data-label]");
  button.setAttribute("aria-pressed", String(isOn));
  label.textContent = isOn ? label.dataset.on : label.dataset.off;
};

export const bindFavoriteButtons = (container, onChange) => {
  container.addEventListener("click", (event) => {
    const button = event.target.closest("[data-favorite-id]");
    if (!button) {
      return;
    }
    const laptopId = Number(button.dataset.favoriteId);
    const saved = toggleFavorite(laptopId);
    setToggleState(button, saved);
    onChange(laptopId, saved);
  });
};
