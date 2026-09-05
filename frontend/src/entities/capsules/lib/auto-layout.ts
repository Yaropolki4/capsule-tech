import type { PlacedCapsuleItem } from "../model/types";

type LayoutTransform = Omit<PlacedCapsuleItem, "clothesId">;

// Лёгкий разброс по углу, чтобы авто-расставленные вещи выглядели как живая
// раскладка, а не ровная сетка.
const ROTATION_JITTER_DEG = [-6, 5, -4, 6, -5, 4];

// Раскладки под типичный размер капсулы (3-4 вещи) — подобраны вручную под
// CAPSULE_ITEM_BASE_SIZE_RATIO (0.35 ширины канваса на вещь), чтобы вещи не
// перекрывали друг друга.
const PRESETS: Record<number, { x: number; y: number }[]> = {
  1: [{ x: 0.5, y: 0.5 }],
  2: [
    { x: 0.32, y: 0.5 },
    { x: 0.68, y: 0.5 },
  ],
  3: [
    { x: 0.3, y: 0.28 },
    { x: 0.7, y: 0.28 },
    { x: 0.5, y: 0.7 },
  ],
  4: [
    { x: 0.28, y: 0.26 },
    { x: 0.72, y: 0.26 },
    { x: 0.28, y: 0.7 },
    { x: 0.72, y: 0.7 },
  ],
};

function gridPositions(count: number): { x: number; y: number }[] {
  const columns = Math.ceil(Math.sqrt(count));
  const rows = Math.ceil(count / columns);

  return Array.from({ length: count }, (_, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);

    return {
      x: (column + 0.5) / columns,
      y: (row + 0.5) / rows,
    };
  });
}

/** Позиции/трансформы для count вещей на канвасе капсулы, без наложения. */
export function computeAutoLayout(count: number): LayoutTransform[] {
  if (count <= 0) return [];

  const positions = PRESETS[count] ?? gridPositions(count);
  // Сетка на 5+ вещей плотнее пресетов — чуть уменьшаем каждую вещь, чтобы
  // между ними оставался видимый зазор.
  const scale = count > 4 ? 0.8 : 1;

  return positions.map((position, index) => ({
    x: position.x,
    y: position.y,
    rotation: ROTATION_JITTER_DEG[index % ROTATION_JITTER_DEG.length],
    scale,
    zIndex: index,
  }));
}
