import React, { useRef, useState } from "react";
import { Canvas, clear } from "./Cavas";
import { Coord, Position, Point } from "./types"
import * as A from "fp-ts/lib/Array"
import { pipe } from "fp-ts/lib/function";

type Props = {
    defaultWidth?: number;
    defaultHeight?: number;
    defaultPens?: number;
    defaultPenColor?: string;
}

type CanvasCtx = CanvasRenderingContext2D;
type CanvasEl = HTMLCanvasElement;

type PositionT = Position.Position;
type CoordT = Coord.Coord;
type DegreeT = Point.Degree;
type Size = Coord.Coord;

const drawPoint = (ctx: CanvasCtx) => (penColor: string) => (position: PositionT) => {
    ctx.strokeStyle = penColor;
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

export const Mandala = ({defaultWidth = 450, defaultHeight = 450, defaultPens = 8, defaultPenColor = "#000000"}: Props) => {
    const canvasRef = useRef<CanvasEl>(null);

    const [width, setWidth] = useState(defaultWidth);
    const [height, setHeight] = useState(defaultHeight);
    const [pens, setPens] = useState(8);
    const [penColor, setPenColor] = useState(defaultPenColor);

    const points = getPoints(makeContainerSize(width)(height))(pens)

    const render = (ctx: CanvasCtx) => (pos: PositionT) => {
        points(pos).forEach(drawPoint(ctx)(penColor))
    }

    const handleResetDefaults = () => {
        setWidth(defaultWidth);
        setHeight(defaultHeight);
        setPens(defaultPens);
        setPenColor(defaultPenColor);
    }

    return <div style={{ display: "flex", flex: 1, flexDirection: "row"}}>
        <div style={{ flex: 1, textAlign: "center", padding: 20, }}>
            <p>Click on the box below and start drawing. You can tweak some parameters 
                on the right-hand side panel. <br />
                You can also <b>save</b> the image by right-clicking on canvas and
                hitting the "Save image as" option.</p>
        </div>
        <div style={{ flex: 1.5, justifyContent: "center", padding: 20, }}>
            <Canvas canvasRef={canvasRef} render={render} width={width} height={height} />
        </div>
        <div style={{ flex: 1, flexDirection:"column", padding: 20 }}>
            <div style={{ flex: 1, flexDirection: "row" }}>
                <p>Controls</p>
                <button onClick={() => clear(canvasRef)}>Clear canvas</button>
                <button onClick={handleResetDefaults}>Reset to defaults</button>
            </div>
            
            <div style={{ flex: 2, flexDirection: "column", marginTop: 30 }}>
                <p>Set the number of pens</p>
                <input type="number" value={pens} onChange={(e) => setPens(Number.parseInt(e.target.value))} />
            </div>

            <div style={{ flex: 1, flexDirection: "column",  marginTop: 30 }}>
                <p>Set canvas width and heigth</p>
                <input type="number" value={width} onChange={(e) => setWidth(Number.parseInt(e.target.value))} />
                <input type="number" value={height} onChange={(e) => setHeight(Number.parseInt(e.target.value))} />
            </div>

            <div style={{ flex: 1, flexDirection: "column",  marginTop: 30 }}>
                <p>Pen color</p>
                <input type="color" value={penColor} onChange={(e) => setPenColor(e.target.value)} />
            </div>
        </div>
    </div>
}
