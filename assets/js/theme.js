document.addEventListener("DOMContentLoaded", function () {
  const themeButtons = document.querySelectorAll(".theme-button");
  const savedTheme = localStorage.getItem("theme") || "default";

  setTheme(savedTheme);

  themeButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      setTheme(button.dataset.theme);
    });
  });

  function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);

    themeButtons.forEach(function (button) {
      button.classList.toggle("theme-current", button.dataset.theme === theme);
    });
  }
});
