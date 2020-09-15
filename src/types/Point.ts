import { Point as AxislyPoint, Degree as AsxislyDegree } from "axisly";
import { Coord } from ".";

export const fromCoord = ({x, y}: Coord.Coord): Point => [x, y];

export const toCoord = ([x, y]: Point): Coord.Coord => {
    // We check whether the returned type is a simple number as we do not
    // want to treat other mathematical number types.

    const xv = x.valueOf();
    const yv = y.valueOf();

    if (typeof xv !== "number") throw Error(`Number type ${typeof xv} is not supported`);
    if (typeof yv !== "number") throw Error(`Number type ${typeof yv} is not supported`);

    return Coord.make(xv)(yv)
};

export type Point = AxislyPoint;

export type Degree = AsxislyDegree;