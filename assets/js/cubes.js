function setupCubeAnimations() {
  // Wait until Roofpig has initialized.
  if (!window.CubeAnimation?.by_id) {
    requestAnimationFrame(setupCubeAnimations);
    return;
  }

  const elements = document.querySelectorAll(
    '.roofpig[id$="-play"], .roofpig[id$="-repeat"]',
  );

  // Map each DOM element directly to its Roofpig animation.
  const cubeMap = new Map();

  for (const id in CubeAnimation.by_id) {
    const cube = CubeAnimation.by_id[id];

    if (cube.dom?.div?.[0]) {
      cubeMap.set(cube.dom.div[0], cube);
    }
  }

  // If not all cubes have been initialized yet, try again.
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
          // "-repeat" cubes automatically repeat.
          if (element.id.endsWith("-repeat")) {
            cube.button_click("repeat");
          }

          // Start the animation.
          cube.button_click("play");
        } else {
          // Pause when the cube leaves the viewport.
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
