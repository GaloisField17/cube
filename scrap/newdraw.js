import fs from "fs";

const SVG_NS = "http://www.w3.org/2000/svg";

/**
 * A 2D coordinate.
 *
 * @typedef {Object} Coords
 * @property {number} x - X coordinate.
 * @property {number} y - Y coordinate.
 */

/**
 * A surface defined by its four corner coordinates and center.
 *
 * @typedef {Object} Surface
 * @property {Coords} NW - Northwest corner coordinate.
 * @property {Coords} NE - Northeast corner coordinate.
 * @property {Coords} SE - Southeast corner coordinate.
 * @property {Coords} SW - Southwest corner coordinate.
 * @property {Coords[]} corners - Array containing the surface's four corner coordinates,
 * ordered NW, NE, SE, SW.
 * @property {Coords} center - Center coordinate of the surface.
 */

/**
 * Creates an empty surface with initialized coordinates.
 *
 * @returns {Surface} A surface with all coordinates initialized to zero.
 */
function createSurface() {
  const corners = [
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
  ];

  return {
    NW: corners[0],
    NE: corners[1],
    SE: corners[2],
    SW: corners[3],
    corners,
    center: { x: 0, y: 0 },
  };
}

const Fpos = createSurface();
const Fneg = createSurface();
const Spos = createSurface();
const Sneg = createSurface();
const Bpos = createSurface();
const Bneg = createSurface();
const Rpos = createSurface();
const Rneg = createSurface();
const Mpos = createSurface();
const Mneg = createSurface();
const Lpos = createSurface();
const Lneg = createSurface();
const Upos = createSurface();
const Uneg = createSurface();
const Epos = createSurface();
const Eneg = createSurface();
const Dpos = createSurface();
const Dneg = createSurface();

const surfacesXaxis = [Bneg, Bpos, Sneg, Spos, Fneg, Fpos];

const surfacesYaxis = [Lneg, Lpos, Mneg, Mpos, Rneg, Rpos];

const surfacesZaxis = [Dneg, Dpos, Eneg, Epos, Uneg, Upos];

/**
 * Calculates the center coordinates of a surface.
 *
 * @param {Coords[]} coords - Array of surface vertex coordinates.
 * @returns {Coords} The center coordinates.
 */
function findCenter(coords) {
  const center = coords.reduce(
    (sum, coord) => ({
      x: sum.x + coord.x,
      y: sum.y + coord.y,
    }),
    { x: 0, y: 0 },
  );

  return {
    x: center.x / coords.length,
    y: center.y / coords.length,
  };
}

/**
 * Assigns the corner and center coordinates for a sequence of surfaces.
 *
 * Each surface is positioned diagonally from the previous surface.
 * The offset increases by one-tenth of the surface length for each
 * successive surface.
 *
 * @param {Surface[]} surfaces - Array of surfaces to assign coordinates to.
 * @param {Coords} startCoords - Northwest corner of the first surface.
 * @param {number} sideLength - Width and height of each square surface.
 * @returns {void}
 */
function assignSurfaceCoords(surfaces, startCoords, sideLength) {
  surfaces.forEach((surface, i) => {
    const offset = (Math.ceil(i / 2) * sideLength) / 6;
    const x = startCoords.x - offset;
    const y = startCoords.y + offset;

    surface.NW.x = x;
    surface.NW.y = y;

    surface.NE.x = x + sideLength;
    surface.NE.y = y;

    surface.SE.x = x + sideLength;
    surface.SE.y = y + sideLength;

    surface.SW.x = x;
    surface.SW.y = y + sideLength;

    surface.center = findCenter(surface.corners);
  });
}

/**
 * Assigns the corner and center coordinates to the y-axis surfaces.
 *
 * Each surface is positioned between the corresponding edges of the
 * front and back reference surfaces. The interpolation progresses
 * according to the surface's position in the sequence.
 *
 * @param {Surface} [frontSurface=Fpos] - Front-positive reference surface.
 * @param {Surface} [backSurface=Bneg] - Back-negative reference surface.
 * @returns {void}
 */
function assignYaxisSurfaceCoords(frontSurface = Fpos, backSurface = Bneg) {
  surfacesYaxis.forEach((surface, i) => {
    const t = Math.ceil(i / 2) / 3;

    surface.NW =
      i === 0 ? backSurface.NW : lerp(backSurface.NW, backSurface.NE, t);

    surface.NE =
      i === 0 ? frontSurface.NW : lerp(frontSurface.NW, frontSurface.NE, t);

    surface.SE =
      i === 0 ? frontSurface.SW : lerp(frontSurface.SW, frontSurface.SE, t);

    surface.SW =
      i === 0 ? backSurface.SW : lerp(backSurface.SW, backSurface.SE, t);

    surface.corners = [surface.NW, surface.NE, surface.SE, surface.SW];

    surface.center = findCenter(surface.corners);
  });
}

/**
 * Assigns the corner and center coordinates to the z-axis surfaces.
 *
 * Each surface is positioned between the corresponding edges of the
 * front and back reference surfaces. The interpolation progresses
 * according to the surface's position in the sequence.
 *
 * @param {Surface} [frontSurface=Fpos] - Front-positive reference surface.
 * @param {Surface} [backSurface=Bneg] - Back-negative reference surface.
 * @returns {void}
 */
function assignZaxisSurfaceCoords(frontSurface = Fpos, backSurface = Bneg) {
  surfacesZaxis.forEach((surface, i) => {
    const t = Math.ceil(i / 2) / 3;

    surface.NW =
      i === 0 ? frontSurface.SW : lerp(frontSurface.SW, frontSurface.NW, t);

    surface.NE =
      i === 0 ? frontSurface.SE : lerp(frontSurface.SE, frontSurface.NE, t);

    surface.SE =
      i === 0 ? backSurface.SE : lerp(backSurface.SE, backSurface.NE, t);

    surface.SW =
      i === 0 ? backSurface.SW : lerp(backSurface.SW, backSurface.NW, t);

    surface.corners = [surface.NW, surface.NE, surface.SE, surface.SW];

    surface.center = findCenter(surface.corners);
  });
}

/**
 * Draws a polygon surface.
 *
 * @param {Coords[]} coords - Array of polygon vertex coordinates.
 * @param {Object} options - SVG polygon options.
 * @param {string} options.id - SVG element ID.
 * @param {string} options.className - SVG element class.
 * @param {string} options.fill - Fill color.
 * @param {string} options.stroke - Stroke color.
 * @param {number} options.strokeWidth - Stroke width.
 * @param {Object} options.data - Custom data-* attributes.
 * @param {string} [children=""] - Optional SVG child elements to place inside the polygon.
 * @returns {string} SVG polygon element.
 */
function drawSurface(
  coords,
  {
    id = "",
    className = "",
    fill = "none",
    stroke = "black",
    strokeWidth = 3,
    data = {},
  } = {},
  children = "",
) {
  const points = coords.map((coord) => `${coord.x},${coord.y}`).join(" ");

  const dataAttributes = Object.entries(data)
    .map(([key, value]) => `data-${key}="${value}"`)
    .join("\n      ");

  const attributes = [
    id && `id="${id}"`,
    className && `class="${className}"`,
    dataAttributes,
  ]
    .filter(Boolean)
    .join("\n      ");

  return `
    <polygon
      ${attributes}
      points="${points}"
      fill="${fill}"
      stroke="${stroke}"
      stroke-width="${strokeWidth}"
      stroke-linejoin="round"
    >${children}
    </polygon>
  `;
}

/**
 * Finds a coordinate between two coordinates.
 *
 * @param {Coords} a - Starting coordinate.
 * @param {Coords} b - Ending coordinate.
 * @param {number} t - Position between 0 and 1.
 * @returns {Coords} Interpolated coordinate.
 */
function lerp(a, b, t) {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
  };
}

/**
 * Draws an n x m grid on a quadrilateral surface.
 *
 * @param {Coords[]} coords - Four corner coordinates of the surface.
 * @param {Object} options - Grid options.
 * @param {number} options.rows - Number of rows.
 * @param {number} options.cols - Number of columns.
 * @param {string|string[]} options.fill - Fill color for all cells, or an array of cell colors.
 * @param {string} options.stroke - Grid line color.
 * @param {number} options.strokeWidth - Grid line width.
 * @param {string} options.id - SVG element ID.
 * @param {string} options.className - SVG element class.
 * @param {Object} options.data - Custom data-* attributes.
 * @param {string} [children=""] - Optional SVG child elements to place inside every polygon.
 * @returns {string} SVG polygons for the grid.
 */
function drawGrids(
  coords,
  {
    rows = 3,
    cols = 3,
    fill = "none",
    stroke = "black",
    strokeWidth = 3,
    id = "",
    className = "",
    data = {},
  } = {},
  children = "",
) {
  const [topLeft, topRight, bottomRight, bottomLeft] = coords;

  let result = "";

  for (let row = 1; row <= rows; row++) {
    for (let col = 1; col <= cols; col++) {
      const left = (col - 1) / cols;
      const right = col / cols;

      const top = (row - 1) / rows;
      const bottom = row / rows;

      const topLeftPoint = lerp(
        lerp(topLeft, topRight, left),
        lerp(bottomLeft, bottomRight, left),
        top,
      );

      const topRightPoint = lerp(
        lerp(topLeft, topRight, right),
        lerp(bottomLeft, bottomRight, right),
        top,
      );

      const bottomRightPoint = lerp(
        lerp(topLeft, topRight, right),
        lerp(bottomLeft, bottomRight, right),
        bottom,
      );

      const bottomLeftPoint = lerp(
        lerp(topLeft, topRight, left),
        lerp(bottomLeft, bottomRight, left),
        bottom,
      );

      const index = (row - 1) * cols + (col - 1);

      const cellFill = Array.isArray(fill) ? fill[index] : fill;

      const cellId = Array.isArray(id)
        ? id[index]
        : id
          ? `${id}r${row}c${col}`
          : "";

      result += drawSurface(
        [topLeftPoint, topRightPoint, bottomRightPoint, bottomLeftPoint],
        {
          id: cellId,
          className,
          data: {
            ...data,
            row,
            col,
            index,
          },
          fill: cellFill,
          stroke,
          strokeWidth,
        },
        children,
      );
    }
  }

  return result;
}

/**
 * Draws an SVG circle.
 *
 * @param {number} cx - X coordinate of the circle's center.
 * @param {number} cy - Y coordinate of the circle's center.
 * @param {number} r - Radius of the circle.
 * @param {Object} options - SVG circle options.
 * @param {string} options.id - SVG element ID.
 * @param {string} options.className - SVG element class.
 * @param {string} options.fill - Fill color.
 * @param {string} options.stroke - Stroke color.
 * @param {number} options.strokeWidth - Stroke width.
 * @param {Object} options.data - Custom data-* attributes.
 * @param {string} [children=""] - Optional SVG child elements to place inside the circle.
 * @returns {string} SVG circle element.
 */
function drawCircle(
  cx,
  cy,
  r,
  {
    id = "",
    className = "",
    fill = "none",
    stroke = "black",
    strokeWidth = 2,
    data = {},
  } = {},
  children = "",
) {
  const dataAttributes = Object.entries(data)
    .map(([key, value]) => `data-${key}="${value}"`)
    .join("\n      ");

  const attributes = [
    id && `id="${id}"`,
    className && `class="${className}"`,
    dataAttributes,
  ]
    .filter(Boolean)
    .join("\n      ");

  return `
    <circle
      ${attributes}
      cx="${cx}"
      cy="${cy}"
      r="${r}"
      fill="${fill}"
      stroke="${stroke}"
      stroke-width="${strokeWidth}"
    >${children}
    </circle>
  `;
}

/**
 * Creates an SVG document.
 *
 * @param {number} width - SVG width.
 * @param {number} height - SVG height.
 * @param {number} [xmin=50] - Minimum X coordinate of the viewport.
 * @param {number} [ymin=50] - Minimum Y coordinate of the viewport.
 * @param {string[]} content - SVG elements to include.
 * @returns {string} SVG document.
 */
function svg(width, height, xmin = 50, ymin = 50, ...content) {
  return `
<svg
    xmlns="${SVG_NS}"
    width="${width}"
    height="${height}"
    viewBox="${xmin} ${ymin} ${width} ${height}"
>
    <rect id="trigger" x="${xmin}" y="${ymin}" width="${width}" height="${height}" fill="#ffffff"/>
    ${content.join("")}
</svg>
`.trim();
}

const childrenString = "";

const childrenStringPos = `<animateTransform
  attributeName="transform"
  type="rotate"
  from="0 360 360"
  to="-360 360 360"
  dur="20s"
  begin="0s; trigger.click"
  fill="freeze"
/>

`;

const childrenStringNeg = `<animateTransform
  attributeName="transform"
  type="rotate"
  from="0 380 340"
  to="-360 380 340"
  dur="20s"
  begin="0s; trigger.click"
  fill="freeze"
/>

`;

const childrenStringGrid = `<animateTransform
  attributeName="transform"
  type="rotate"
  from="0 370 350"
  to="-360 370 350"
  dur="20s"
  begin="0s; trigger.click"
  fill="freeze"
/>

`;

// ─────────────────────────────────────────────
// Draw images
// ─────────────────────────────────────────────

assignSurfaceCoords(surfacesXaxis, { x: 360, y: 240 }, 120);
assignYaxisSurfaceCoords();
assignZaxisSurfaceCoords();
const coreCoords = findCenter([
  Lneg.center,
  Rpos.center,
  Upos.center,
  Dneg.center,
]);

const surfaceSvg = svg(
  600,
  600,
  coreCoords.x - 600 / 2,
  coreCoords.y - 600 / 2,
  drawSurface(Fneg.corners, {}, childrenStringNeg),
  drawSurface(Fpos.corners, {}, childrenStringPos),
  // drawGrids(
  //   [Fneg.NW, Fneg.NE, Fpos.NE, Fpos.NW],
  //   { rows: 1, cols: 3 },
  //   childrenStringGrid,
  // ),
  // drawGrids(
  //   [Fneg.SW, Fneg.SE, Fpos.SE, Fpos.SW],
  //   { rows: 1, cols: 3 },
  //   childrenStringGrid,
  // ),
  // drawGrids(
  //   [Fneg.NW, Fneg.SW, Fpos.SW, Fpos.NW],
  //   { rows: 1, cols: 3 },
  //   childrenStringGrid,
  // ),
  // drawGrids(
  //   [Fneg.NE, Fneg.SE, Fpos.SE, Fpos.NE],
  //   { rows: 1, cols: 3 },
  //   childrenStringGrid,
  // ),
);

// ─────────────────────────────────────────────
// Save images
// ─────────────────────────────────────────────

fs.mkdirSync("scrap/svgs", { recursive: true });

fs.writeFileSync("scrap/svgs/circle5.svg", surfaceSvg);

console.log("Generated scrap/svgs/circle5.svg");

console.log(
  findCenter([
    findCenter([Fneg.NW, Fneg.NE, Fpos.NE, Fpos.NW]),
    findCenter([Fneg.SW, Fneg.SE, Fpos.SE, Fpos.SW]),
    findCenter([Fneg.NW, Fneg.SW, Fpos.SW, Fpos.NW]),
    findCenter([Fneg.NE, Fneg.SE, Fpos.SE, Fpos.NE]),
  ]),
);
console.log(Fneg.NE);
console.log(Fpos.NE);
