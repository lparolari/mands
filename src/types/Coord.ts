import { rotate as rotatePoint } from "axisly";
import { pipe } from "fp-ts/lib/function";
import { Point } from ".";

export type Coord = { x: number; y: number };

export const make = (x: number) => (y: number): Coord => ({ x: x, y: y });

export const zero = make(0)(0);

export const rotate = (degree: Point.Degree) => (coord: Coord): Coord =>
  pipe(
    coord,
    Point.fromCoord, // adapt coord to point repr
    rotatePoint(degree),
    Point.toCoord
  );
