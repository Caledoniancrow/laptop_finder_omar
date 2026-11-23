import { MAX_COMPARE, addFavorite, getCompareIds, saveCompareIds } from "./storage.js";
import { SPEC_ROWS, getCategory } from "./ui.js";

export const addToComparison = (laptopId) => {
  const comparisonIds = getCompareIds();
  if (comparisonIds.includes(laptopId)) {
    return true;
  }
  if (comparisonIds.length >= MAX_COMPARE) {
    return false;
  }
  saveCompareIds([...comparisonIds, laptopId]);
  addFavorite(laptopId);
  return true;
};

export const removeFromComparison = (laptopId) => {
  saveCompareIds(getCompareIds().filter((comparisonId) => comparisonId !== laptopId));
};

export const findBestValue = (laptops, row) => {
  const values = laptops.map((laptop) => laptop[row.key]);
  return row.best === "lowest" ? Math.min(...values) : Math.max(...values);
};

const createHeaderCell = (laptop) => `
  <th scope="col" class="min-w-44 border-b border-line p-3 text-left align-bottom font-normal">
    <img src="${laptop.image}" alt="" width="400" height="250" class="aspect-8/5 w-full rounded-lg ${getCategory(laptop.category).soft} object-contain p-1">
    <a href="details.html?id=${laptop.id}" class="mt-2 block font-bold text-ink underline-offset-4 hover:text-brand hover:underline focus-visible:outline-2 focus-visible:outline-brand">${laptop.name}</a>
  </th>`;

const createValueCell = (laptop, row, bestValue) => {
  const isBest = laptop[row.key] === bestValue;
  const bestTag = isBest ? `<span class="ml-1 rounded-full bg-brand px-2 py-0.5 text-xs font-bold text-brand-ink">Best</span>` : "";
  return `<td class="border-b border-line p-3 tabular-nums ${isBest ? "bg-soft font-bold text-strong" : ""}">${row.format(laptop[row.key])}${bestTag}</td>`;
};

export const createCompareTable = (laptops) => {
  const bodyRows = SPEC_ROWS.map((row) => {
    const bestValue = row.best ? findBestValue(laptops, row) : null;
    const cells = laptops.map((laptop) => createValueCell(laptop, row, bestValue)).join("");
    return `
      <tr>
        <th scope="row" class="sticky left-0 z-10 border-b border-line bg-surface p-3 text-left font-bold">${row.label}</th>
        ${cells}
      </tr>`;
  }).join("");

  return `
    <table class="w-full border-collapse text-sm">
      <caption class="sr-only">Side-by-side specifications of ${laptops.length} laptops. The best value in each row is marked Best.</caption>
      <thead>
        <tr>
          <th scope="col" class="sticky left-0 z-10 min-w-28 border-b border-line bg-surface p-3 text-left align-bottom">Specification</th>
          ${laptops.map(createHeaderCell).join("")}
        </tr>
      </thead>
      <tbody>${bodyRows}</tbody>
    </table>`;
};
