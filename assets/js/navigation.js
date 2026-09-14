document.addEventListener("DOMContentLoaded", () => {
  const navigation = document.querySelector(".step-navigation");

  if (!navigation) {
    return;
  }

  let lastScrollY = window.scrollY;
  let ticking = false;

  function updateNavigation() {
    const currentScrollY = window.scrollY;

    // At the very top, always show the navigation.
    if (currentScrollY <= 10) {
      navigation.classList.remove("nav-hidden");
      navigation.classList.add("nav-visible");
    }
    // Scrolling down.
    else if (currentScrollY > lastScrollY) {
      navigation.classList.remove("nav-visible");
      navigation.classList.add("nav-hidden");
    }
    // Scrolling up.
    else if (currentScrollY < lastScrollY) {
      navigation.classList.remove("nav-hidden");
      navigation.classList.add("nav-visible");
    }

    lastScrollY = currentScrollY;
    ticking = false;
  }

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        window.requestAnimationFrame(updateNavigation);
        ticking = true;
      }
    },
    { passive: true },
  );

  // Set the initial state.
  updateNavigation();
});
