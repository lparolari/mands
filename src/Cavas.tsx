import React, { useEffect, useRef, useState } from "react";
import * as O from "fp-ts/lib/Option"
import * as A from "fp-ts/lib/Array"
import { pipe } from "fp-ts/lib/function";
import { Coord, Position, Point } from "./types"

type CanvasProps = React.DetailedHTMLProps<React.CanvasHTMLAttributes<HTMLCanvasElement>, HTMLCanvasElement>;
type CanvasRef = React.RefObject<HTMLCanvasElement>
type CanvasEl = HTMLCanvasElement;
type CanvasCtx = CanvasRenderingContext2D;

type PositionT = Position.Position;
type CoordT = Coord.Coord;
type DegreeT = Point.Degree;
type Size = Coord.Coord;

const drawPoint = (ctx: CanvasCtx) => (position: PositionT)=> {
    ctx.fillStyle = '#000000'
    ctx.beginPath();
    ctx.moveTo(position.prev.x, position.prev.y);
    ctx.lineTo(position.current.x, position.current.y);
    ctx.stroke()
}

const getRotations = (slices: number): DegreeT[] => pipe(
    A.range(0, slices - 1), 
    A.map((s) => (s * (360/slices))),
);

const toCenterBasis = (s: Size) => ({x, y}: CoordT): CoordT => {
    return Coord.make(x - s.x / 2)(y - s.y / 2);
}

const toMatrixBasis = (s: Size) => ({x, y}: CoordT): CoordT => {
    return Coord.make(x + s.x / 2)(y + s.y / 2);
}

const normalize = (f: (c: CoordT) => CoordT) => (position: PositionT) => Position.make(f(position.prev))(f(position.current))

const getPoints = (containerSize: Size) => (n: number) => (position: PositionT): PositionT[] => {
    const normalization = toCenterBasis(containerSize);
    const normalizationInverse = toMatrixBasis(containerSize);
    return pipe(
        A.zip(getRotations(n), A.replicate(n, normalize(normalization)(position))),
        A.map(([rotation, position]) => Position.rotate(rotation)(position)),
        A.map((position) => normalize(normalizationInverse)(position)),
    )
}

const makeContainerSize = (x: number) => (y: number): Size => ({x: x, y: y})

const getCanvas = (canvasRef: CanvasRef): O.Option<CanvasEl> => O.fromNullable(canvasRef.current);

const getContext = (canvas: CanvasEl) => O.fromNullable(canvas.getContext('2d'));

export const Canvas = (props: CanvasProps) => {
    const canvasRef = useRef<CanvasEl>(null);

    const [position, setPosition] = useState<PositionT>(Position.zero);
    const [isPressed, setPressed] = useState(false);

    console.log(canvasRef);

    useEffect(() => {
        if (isPressed) {
            pipe(
                getCanvas(canvasRef),
                O.chain(getContext),
                O.chain((ctx) => {
                    const rect = ctx.canvas.getBoundingClientRect();
                    const containerSize = makeContainerSize(rect.width)(rect.height);

                    getPoints(containerSize)(8)(position).forEach(drawPoint(ctx))

                    return O.some(ctx);
                })
            )
        }
      }, [position, isPressed] )
  
    const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>): void => {
        pipe(
            getCanvas(canvasRef),
            O.chain(getContext),
            O.chain((ctx) => {
                const rect = ctx.canvas.getBoundingClientRect();

                const newPosition = Coord.make(event.clientX - rect.left)(event.clientY - rect.top);
                const prevPosition = position.current;
                setPosition(Position.make(prevPosition)(newPosition))

                return O.some(ctx);
            }));
    }

    const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
        if (event.button === 0)
            setPressed(true);
    }

    const handleMouseUp = (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
        if (event.button === 0)
            setPressed(false);
    }

    const handleMouseLeave = () => setPressed(false);

    return <p>test</p> || <canvas 
        ref={canvasRef} 
        style={{backgroundColor: "white"}} 
        onMouseMove={handleMouseMove} 
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        {...props} />
}