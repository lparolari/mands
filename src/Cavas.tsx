import React, { useEffect, useRef, useState } from "react";
import * as O from "fp-ts/lib/Option";
import { identity, pipe } from "fp-ts/lib/function";
import { Coord, Position } from "./types";

type CanvasProps = React.DetailedHTMLProps<
  React.CanvasHTMLAttributes<HTMLCanvasElement>,
  HTMLCanvasElement
> & {
  canvasRef: React.RefObject<CanvasEl>;
  render: RenderT;
  width: number;
  height: number;
};
type CanvasRef = React.RefObject<HTMLCanvasElement>;
type CanvasEl = HTMLCanvasElement;
type CanvasCtx = CanvasRenderingContext2D;

type PositionT = Position.Position;
type RenderT = (ctx: CanvasCtx) => (pos: PositionT) => void;

export const clear = (canvasRef: CanvasRef) => {
  pipe(
    getCanvas(canvasRef),
    O.chain(getContext),
    O.chain((ctx) => {
      ctx.clearRect(0, 0, getRect(ctx).right, getRect(ctx).bottom);
      return O.some(ctx);
    })
  );
};

const getRect = (ctx: CanvasCtx) => ctx.canvas.getBoundingClientRect();

const getCanvas = (canvasRef: CanvasRef): O.Option<CanvasEl> =>
  pipe(
    canvasRef,
    O.fromNullable,
    O.chain((ref) => O.fromNullable(ref.current))
  );

const getContext = (canvas: CanvasEl) =>
  O.fromNullable(canvas.getContext("2d"));

export const Canvas = ({
  canvasRef,
  render,
  width,
  height,
  ...props
}: CanvasProps) => {
  const [mousePos, setMousePos] = useState<PositionT>(Position.zero);
  const [leftClick, setLeftClick] = useState(false);

  const getCanvasContext: O.Option<CanvasCtx> = pipe(
    getCanvas(canvasRef),
    O.chain(getContext)
  );

  const renderFromPosition = (position: PositionT) => (
    ctx: CanvasCtx
  ): O.Option<CanvasCtx> => {
    render(ctx)(position);
    return O.some(ctx);
  };

  const renderWithContext = () =>
    pipe(getCanvasContext, O.chain(renderFromPosition(mousePos)));

  const saveMousePos = (clientX: number, clientY: number) => (
    ctx: CanvasCtx
  ): O.Option<PositionT> => {
    const rect = ctx.canvas.getBoundingClientRect();

    const newPosition = Coord.make(clientX - rect.left)(clientY - rect.top);
    const prevPosition = mousePos.current;

    const pos = Position.make(prevPosition)(newPosition);
    setMousePos(pos);

    return O.some(pos);
  };

  useEffect(() => {
    pipe(leftClick, O.fromPredicate(identity), O.chain(renderWithContext));
  }, [mousePos, leftClick]);

  const handleMouseMove = (
    event: React.MouseEvent<HTMLCanvasElement, MouseEvent>
  ): O.Option<PositionT> =>
    pipe(getCanvasContext, O.chain(saveMousePos(event.clientX, event.clientY)));

  const handleMouseDown = (
    event: React.MouseEvent<HTMLCanvasElement, MouseEvent>
  ) => {
    if (event.button === 0) setLeftClick(true);
  };

  const handleMouseUp = (
    event: React.MouseEvent<HTMLCanvasElement, MouseEvent>
  ) => {
    if (event.button === 0) setLeftClick(false);
  };

  const handleMouseEnter = handleMouseMove;

  const handleMouseLeave = () => setLeftClick(false);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ backgroundColor: "white" }}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    />
  );
};
