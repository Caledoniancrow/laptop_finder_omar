const savedTheme = localStorage.getItem("laptop-finder:theme");

if (savedTheme === JSON.stringify("performance")) {
  document.documentElement.dataset.theme = "performance";
}
