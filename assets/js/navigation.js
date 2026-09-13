const navigation = document.querySelector(".step-navigation");

if (navigation) {
  let lastScrollY = window.scrollY;
  const scrollThreshold = 10;

  window.addEventListener(
    "scroll",
    function () {
      const currentScrollY = window.scrollY;
      const scrollDifference = currentScrollY - lastScrollY;

      if (currentScrollY <= 0) {
        navigation.classList.remove("nav-hidden");
        navigation.classList.add("nav-visible");

        lastScrollY = currentScrollY;
        return;
      }

      if (Math.abs(scrollDifference) < scrollThreshold) {
        return;
      }

      if (scrollDifference < 0) {
        navigation.classList.remove("nav-hidden");
        navigation.classList.add("nav-visible");
      } else {
        navigation.classList.remove("nav-visible");
        navigation.classList.add("nav-hidden");
      }

      lastScrollY = currentScrollY;
    },
    { passive: true },
  );
}
