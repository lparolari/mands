import { Coord, Point, Position } from ".";

export type Position = { current: Coord.Coord, prev: Coord.Coord };

export const make = (prev: Coord.Coord) => (current: Coord.Coord): Position => ({ prev: prev, current: current });

export const zero = make(Coord.zero)(Coord.zero);

export const rotate = (degree: Point.Degree) => (position: Position) => make
    (Coord.rotate(degree)(position.prev))
    (Coord.rotate(degree)(position.current))