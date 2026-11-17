export type Point = { x: number; y: number };
export type Rect = Point & { w: number; h: number };

export const worldSize = { w: 1440, h: 1140 };
export const spawn = { x: 300, y: 399 };
const radius = 10;
const stride = 16;

export type Sector = { id: string; rect: Rect; northDoor: boolean };

export const sectors: Sector[] = [
  { id: 'gateway', rect: { x: 140, y: 88, w: 368, h: 280 }, northDoor: false },
  { id: 'control', rect: { x: 552, y: 88, w: 368, h: 280 }, northDoor: false },
  { id: 'chemistry', rect: { x: 964, y: 88, w: 368, h: 280 }, northDoor: false },
  { id: 'water-lab', rect: { x: 964, y: 456, w: 368, h: 264 }, northDoor: true },
  { id: 'power', rect: { x: 552, y: 456, w: 368, h: 264 }, northDoor: true },
  { id: 'greenhouse', rect: { x: 140, y: 456, w: 368, h: 264 }, northDoor: true },
  { id: 'climate', rect: { x: 140, y: 808, w: 368, h: 264 }, northDoor: true },
  { id: 'evolution', rect: { x: 552, y: 808, w: 368, h: 264 }, northDoor: true },
  { id: 'finale', rect: { x: 964, y: 808, w: 368, h: 264 }, northDoor: true },
];

export const halls: Rect[] = [
  { x: 62, y: 368, w: 1302, h: 88 },
  { x: 62, y: 368, w: 78, h: 528 },
  { x: 62, y: 720, w: 1302, h: 88 },
];

export function contains(rect: Rect, point: Point) {
  return point.x >= rect.x && point.x <= rect.x + rect.w && point.y >= rect.y && point.y <= rect.y + rect.h;
}

export function distance(a: Point, b: Point) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function local(sector: Sector, x: number, y: number): Point {
  return { x: sector.rect.x + x, y: sector.rect.y + y };
}

export function door(sector: Sector) {
  return local(sector, sector.rect.w / 2, sector.northDoor ? 0 : sector.rect.h);
}

export function doorApproach(sector: Sector) {
  const point = door(sector);
  return { x: point.x, y: point.y + (sector.northDoor ? -30 : 30) };
}

export function sectorAt(point: Point) {
  return sectors.find(sector => contains(sector.rect, point));
}

export function fixtures(sector: Sector): Rect[] {
  return [{ ...local(sector, 26, 42), w: 46, h: 29 }, { ...local(sector, 296, 42), w: 46, h: 29 }];
}

export function makeWalkable(openSectors: readonly string[]) {
  const open = sectors.filter(sector => openSectors.includes(sector.id));
  const floors = [
    ...halls,
    ...open.map(({ rect }) => ({ x: rect.x + 8, y: rect.y + 8, w: rect.w - 16, h: rect.h - 16 })),
    ...open.map(sector => {
      const center = door(sector);
      return { x: center.x - 36, y: center.y - 14, w: 72, h: 28 };
    }),
  ];
  const obstacles = open.flatMap(fixtures);
  return (point: Point) => {
    const corners = [-radius, radius].flatMap(dx => [-radius, radius].map(dy => ({ x: point.x + dx, y: point.y + dy })));
    return corners.every(corner => floors.some(rect => contains(rect, corner)) && !obstacles.some(rect => contains(rect, corner)));
  };
}

export function segmentClear(a: Point, b: Point, walkable: (point: Point) => boolean) {
  const samples = Math.max(1, Math.ceil(distance(a, b) / 6));
  for (let i = 1; i <= samples; i++) {
    const fraction = i / samples;
    if (!walkable({ x: a.x + (b.x - a.x) * fraction, y: a.y + (b.y - a.y) * fraction })) return false;
  }
  return true;
}

export function findPath(start: Point, target: Point, walkable: (point: Point) => boolean): Point[] | null {
  if (!walkable(start) || !walkable(target)) return null;
  if (segmentClear(start, target, walkable)) return [target];

  const cols = Math.ceil(worldSize.w / stride);
  const rows = Math.ceil(worldSize.h / stride);
  const coordinates = (index: number): Point => ({ x: (index % cols) * stride, y: Math.floor(index / cols) * stride });
  const nodesNear = (point: Point) => {
    const x = Math.round(point.x / stride);
    const y = Math.round(point.y / stride);
    const nodes: number[] = [];
    for (let row = Math.max(0, y - 1); row <= Math.min(rows - 1, y + 1); row++) {
      for (let column = Math.max(0, x - 1); column <= Math.min(cols - 1, x + 1); column++) {
        const index = row * cols + column;
        if (segmentClear(point, coordinates(index), walkable)) nodes.push(index);
      }
    }
    return nodes.sort((a, b) => distance(point, coordinates(a)) - distance(point, coordinates(b)));
  };
  const goals = new Set(nodesNear(target));
  const startNodes = nodesNear(start);
  const queue = [...startNodes];
  const previous = new Int32Array(rows * cols).fill(-2);
  for (const node of startNodes) previous[node] = -1;
  for (let i = 0; i < queue.length; i++) {
    const node = queue[i];
    if (goals.has(node)) {
      const path = [target];
      for (let scan = node; scan !== -1; scan = previous[scan]) path.push(coordinates(scan));
      return path.reverse();
    }
    const column = node % cols;
    const row = Math.floor(node / cols);
    const neighbors = [column > 0 ? node - 1 : -1, column < cols - 1 ? node + 1 : -1,
      row > 0 ? node - cols : -1, row < rows - 1 ? node + cols : -1];
    for (const next of neighbors) {
      if (next < 0 || previous[next] !== -2 || !segmentClear(coordinates(node), coordinates(next), walkable)) continue;
      previous[next] = node;
      queue.push(next);
    }
  }
  return null;
}
