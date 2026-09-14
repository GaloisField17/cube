(function () {
  function setupCubeAnimations() {
    if (!window.CubeAnimation?.by_id) {
      requestAnimationFrame(setupCubeAnimations);
      return;
    }

    const elements = document.querySelectorAll(
      '.roofpig[id$="-play"], .roofpig[id$="-repeat"]',
    );

    if (!elements.length) {
      return;
    }

    const cubeMap = new Map();

    for (const id in CubeAnimation.by_id) {
      const cube = CubeAnimation.by_id[id];

      if (cube.dom?.div?.[0]) {
        cubeMap.set(cube.dom.div[0], cube);
      }
    }

    // Roofpig may still be initializing individual cubes.
    if (cubeMap.size < elements.length) {
      requestAnimationFrame(setupCubeAnimations);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const element = entry.target;
          const cube = cubeMap.get(element);

          if (!cube) {
            return;
          }

          if (entry.isIntersecting) {
            if (element.id.endsWith("-repeat")) {
              cube.button_click("repeat");
            }

            cube.button_click("play");
          } else {
            cube.button_click("pause");
          }
        });
      },
      {
        threshold: 0.3,
      },
    );

    elements.forEach((element) => {
      observer.observe(element);
    });
  }

  setupCubeAnimations();
})();
