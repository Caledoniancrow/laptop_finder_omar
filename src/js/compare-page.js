import { fetchLaptops, findLaptopById } from "./api.js";
import { addToComparison, createCompareTable, removeFromComparison } from "./compare.js";
import { setupHeader, updateSavedCounts } from "./header.js";
import { MAX_COMPARE, getCompareIds, getFavoriteIds } from "./storage.js";
import { getCategory, renderLoadError } from "./ui.js";

const picker = document.querySelector("#compare-picker");
const countText = document.querySelector("#compare-count");
const message = document.querySelector("#compare-message");
const tableWrapper = document.querySelector("#compare-table");

let allLaptops = [];

const findLaptops = (laptopIds) =>
  laptopIds.map((laptopId) => findLaptopById(allLaptops, laptopId)).filter((laptop) => laptop !== undefined);

const showTableSkeleton = () => {
  tableWrapper.setAttribute("aria-busy", "true");
  tableWrapper.innerHTML = `
    <p class="sr-only" role="status">Loading the comparison</p>
    <div class="grid animate-pulse gap-3 p-6 motion-reduce:animate-none" aria-hidden="true">
      <div class="h-24 rounded-lg bg-line"></div>
      <div class="h-6 rounded-sm bg-line"></div>
      <div class="h-6 rounded-sm bg-line"></div>
      <div class="h-6 rounded-sm bg-line"></div>
    </div>`;
};

const showEmptyTable = (text) => {
  tableWrapper.removeAttribute("aria-busy");
  tableWrapper.innerHTML = `<p class="p-6 text-muted">${text}</p>`;
};

const createPickerItem = (laptop, isChosen) => {
  const category = getCategory(laptop.category);
  return `
    <li>
      <label class="flex h-full cursor-pointer items-center gap-3 rounded-xl border-2 border-line p-3 transition hover:border-brand has-checked:border-brand has-checked:bg-soft">
        <input type="checkbox" class="size-5 shrink-0 rounded border-edge text-brand focus:ring-brand" value="${laptop.id}" ${isChosen ? "checked" : ""}>
        <img src="${laptop.image}" alt="" width="400" height="250" class="h-10 w-16 shrink-0 rounded-md ${category.soft} object-contain">
        <span class="text-sm font-bold">${laptop.name}</span>
      </label>
    </li>`;
};

const renderPicker = () => {
  const favorites = findLaptops(getFavoriteIds());
  const comparisonIds = getCompareIds();
  if (favorites.length === 0) {
    picker.innerHTML = `
      <li class="text-muted sm:col-span-2 lg:col-span-3">
        You have no favorites yet. <a href="laptops.html" class="font-bold text-brand underline underline-offset-4">Browse laptops</a> and press Save on the ones you like.
      </li>`;
    return;
  }
  picker.innerHTML = favorites.map((laptop) => createPickerItem(laptop, comparisonIds.includes(laptop.id))).join("");
};

const renderTable = () => {
  const favoriteCount = findLaptops(getFavoriteIds()).length;
  const chosenLaptops = findLaptops(getCompareIds());
  countText.textContent = `${chosenLaptops.length} of ${MAX_COMPARE} chosen`;
  updateSavedCounts();
  if (favoriteCount === 0) {
    showEmptyTable("Nothing to compare yet. Save at least two laptops first.");
  } else if (favoriteCount === 1) {
    showEmptyTable("Save one more laptop to compare it side by side.");
  } else if (chosenLaptops.length < 2) {
    showEmptyTable("Tick at least two laptops above to see them side by side.");
  } else {
    tableWrapper.removeAttribute("aria-busy");
    tableWrapper.innerHTML = createCompareTable(chosenLaptops);
  }
};

picker.addEventListener("change", (event) => {
  const checkbox = event.target;
  const laptopId = Number(checkbox.value);
  if (checkbox.checked && !addToComparison(laptopId)) {
    checkbox.checked = false;
    message.textContent = `You can compare up to ${MAX_COMPARE} laptops. Untick one to add another.`;
    return;
  }
  if (!checkbox.checked) {
    removeFromComparison(laptopId);
  }
  message.textContent = "";
  renderTable();
});

const startCompare = async () => {
  showTableSkeleton();
  try {
    allLaptops = await fetchLaptops();
    renderPicker();
    renderTable();
  } catch (error) {
    countText.textContent = "Not available";
    renderLoadError(tableWrapper, error);
  }
};

setupHeader();
startCompare();
