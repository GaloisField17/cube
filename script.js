$(document).ready(function () {
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
});
