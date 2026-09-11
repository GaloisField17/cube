const cube = document.getElementById("cube");
const polygons = [...cube.querySelectorAll(".cube-face")];

const CENTER_X = 390;
const CENTER_Y = 330;

const cameraDistance = 500;

function rotateX(point, angle) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  return {
    x: point.x,
    y: point.y * cos - point.z * sin,
    z: point.y * sin + point.z * cos,
  };
}

function rotateY(point, angle) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  return {
    x: point.x * cos + point.z * sin,
    y: point.y,
    z: -point.x * sin + point.z * cos,
  };
}

function project(point) {
  const scale = cameraDistance / (cameraDistance - point.z);

  return {
    x: CENTER_X + point.x * scale,
    y: CENTER_Y + point.y * scale,
  };
}

function getPoints(polygon) {
  return polygon.dataset.points
    .trim()
    .split(" ")
    .map((point) => {
      const [x, y, z] = point.split(",").map(Number);

      return { x, y, z };
    });
}

function getDepth(points) {
  return points.reduce((sum, point) => sum + point.z, 0) / points.length;
}

function render(angle) {
  const rendered = polygons.map((polygon) => {
    const originalPoints = getPoints(polygon);

    const rotatedPoints = originalPoints.map((point) => {
      let result = rotateX(point, angle * 0.55);
      result = rotateY(result, angle);

      return result;
    });

    const projectedPoints = rotatedPoints.map(project);

    polygon.setAttribute(
      "points",
      projectedPoints.map((point) => `${point.x},${point.y}`).join(" "),
    );

    return {
      polygon,
      depth: getDepth(rotatedPoints),
    };
  });

  rendered
    .sort((a, b) => a.depth - b.depth)
    .forEach(({ polygon }) => {
      cube.appendChild(polygon);
    });
}

function animate(time) {
  const angle = time * 0.001;

  render(angle);

  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
