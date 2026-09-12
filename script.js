$(document).ready(function () {
  /*
   * -------------------------------------------------------
   * Cube animation handling
   * -------------------------------------------------------
   */

  const cubes = document.querySelectorAll(
    '.roofpig[id$="-play"], .roofpig[id$="-repeat"]',
  );

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        const element = entry.target;
        const cubeId = element.id;

        for (const id in CubeAnimation.by_id) {
          const cube = CubeAnimation.by_id[id];

          if (cube.dom.div[0] === element) {
            if (entry.isIntersecting) {
              // Cube enters viewport
              if (cubeId.endsWith("-repeat")) {
                cube.button_click("repeat");
                cube.button_click("play");
              } else if (cubeId.endsWith("-play")) {
                cube.button_click("play");
              }
            } else {
              // Cube leaves viewport
              cube.button_click("pause");
            }

            break;
          }
        }
      });
    },
    {
      threshold: 0.3,
    },
  );

  cubes.forEach(function (cube) {
    observer.observe(cube);
  });

  /*
   * -------------------------------------------------------
   * Scroll-direction navigation
   * -------------------------------------------------------
   *
   * Navigation behavior:
   *
   * - Page loads with navigation visible.
   * - Scroll down → navigation hides.
   * - Scroll up → navigation appears.
   * - Reach the top → navigation is visible normally.
   *
   * The navigation uses position: sticky in CSS, so it
   * remains in the document flow and does not cause the
   * page to jump when it appears/disappears.
   */

  const navigation = document.querySelector(".step-navigation");

  if (navigation) {
    let lastScrollY = window.scrollY;
    const scrollThreshold = 10;

    window.addEventListener(
      "scroll",
      function () {
        const currentScrollY = window.scrollY;
        const scrollDifference = currentScrollY - lastScrollY;

        /*
         * At the very top of the page, make sure the
         * navigation is visible.
         */
        if (currentScrollY <= 0) {
          navigation.classList.remove("nav-hidden");
          navigation.classList.add("nav-visible");

          lastScrollY = currentScrollY;
          return;
        }

        /*
         * Ignore tiny movements so the navigation doesn't
         * flicker from small changes in scroll position.
         */
        if (Math.abs(scrollDifference) < scrollThreshold) {
          return;
        }

        /*
         * Scrolling upward → show navigation.
         */
        if (scrollDifference < 0) {
          navigation.classList.remove("nav-hidden");
          navigation.classList.add("nav-visible");
        } else {

        /*
         * Scrolling downward → hide navigation.
         */
          navigation.classList.remove("nav-visible");
          navigation.classList.add("nav-hidden");
        }

        lastScrollY = currentScrollY;
      },
      { passive: true },
    );
  }
});
