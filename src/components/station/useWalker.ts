import { useEffect, useRef, useState } from 'react';
import { distance, findPath, spawn, worldSize } from '../../engine/map';
import type { Point } from '../../engine/map';

type Direction = 'up' | 'down' | 'left' | 'right';
const keys: Record<string, Direction> = {
  ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
  w: 'up', s: 'down', a: 'left', d: 'right',
};

export function useWalker({ start, walkable, paused, onSettle, onInteract }: {
  start: Point;
  walkable: (point: Point) => boolean;
  paused: boolean;
  onSettle: (point: Point) => void;
  onInteract: (point: Point) => void;
}) {
  const viewport = useRef<HTMLDivElement>(null);
  const world = useRef<HTMLDivElement>(null);
  const avatar = useRef<HTMLDivElement>(null);
  const point = useRef(start);
  const route = useRef<Point[]>([]);
  const held = useRef(new Map<string, Direction>());
  const handlers = useRef({ onSettle, onInteract });
  const [location, setLocation] = useState(start);
  const [waypoint, setWaypoint] = useState<Point | null>(null);

  useEffect(() => { handlers.current = { onSettle, onInteract }; }, [onSettle, onInteract]);
  useEffect(() => {
    if (!walkable(point.current)) {
      point.current = spawn;
      route.current = [];
      setWaypoint(null);
      setLocation(spawn);
      handlers.current.onSettle(spawn);
    }
  }, [walkable]);

  function travel(target: Point) {
    if (paused) return false;
    const path = findPath(point.current, target, walkable);
    if (!path) return false;
    held.current.clear();
    route.current = path;
    setWaypoint(target);
    return true;
  }

  function nudge(direction: Direction) {
    const here = point.current;
    const dx = direction === 'left' ? -32 : direction === 'right' ? 32 : 0;
    const dy = direction === 'up' ? -32 : direction === 'down' ? 32 : 0;
    travel({ x: here.x + dx, y: here.y + dy });
  }

  function pad(direction: Direction, pressed: boolean) {
    if (paused) return;
    const key = `pad-${direction}`;
    if (pressed) {
      route.current = [];
      setWaypoint(null);
      held.current.set(key, direction);
    } else held.current.delete(key);
  }

  useEffect(() => {
    const stop = () => {
      held.current.clear();
      route.current = [];
      setWaypoint(null);
    };
    if (paused) stop();
    function keyDown(event: KeyboardEvent) {
      if (paused || event.ctrlKey || event.metaKey || event.altKey) return;
      const target = event.target;
      if (target instanceof HTMLElement && (target.matches('input,select,textarea') || target.isContentEditable)) return;
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      if (key === 'e') {
        event.preventDefault();
        if (!event.repeat) {
          stop();
          handlers.current.onInteract(point.current);
        }
        return;
      }
      if (key === 'Escape') stop();
      const direction = keys[key];
      if (!direction) return;
      event.preventDefault();
      route.current = [];
      setWaypoint(null);
      held.current.set(key, direction);
    }
    function keyUp(event: KeyboardEvent) {
      held.current.delete(event.key.length === 1 ? event.key.toLowerCase() : event.key);
    }
    window.addEventListener('keydown', keyDown);
    window.addEventListener('keyup', keyUp);
    window.addEventListener('blur', stop);
    return () => {
      window.removeEventListener('keydown', keyDown);
      window.removeEventListener('keyup', keyUp);
      window.removeEventListener('blur', stop);
    };
  }, [paused]);

  useEffect(() => {
    const stage = viewport.current;
    const canvas = world.current;
    const player = avatar.current;
    if (!stage || !canvas || !player) return;
    const canvasSize = { w: stage.clientWidth, h: stage.clientHeight };
    const resize = new ResizeObserver(() => {
      canvasSize.w = stage.clientWidth;
      canvasSize.h = stage.clientHeight;
    });
    resize.observe(stage);
    let request = 0;
    let lastTime = 0;
    let lastRender = 0;
    let wasMoving = false;
    let lastPoint = point.current;
    const settle = () => {
      const here = point.current;
      if (distance(lastPoint, here) < 1) return;
      lastPoint = here;
      handlers.current.onSettle(here);
    };
    function frame(now: number) {
      const time = lastTime ? Math.min((now - lastTime) / 1000, 0.04) : 0;
      lastTime = now;
      const previous = point.current;
      let moveX = 0;
      let moveY = 0;
      const directions = new Set(held.current.values());
      const manual = directions.size > 0;
      if (!paused && manual) {
        const x = Number(directions.has('right')) - Number(directions.has('left'));
        const y = Number(directions.has('down')) - Number(directions.has('up'));
        const length = Math.hypot(x, y) || 1;
        moveX = x * 206 * time / length;
        moveY = y * 206 * time / length;
      } else if (!paused && route.current.length) {
        const next = route.current[0];
        const length = distance(previous, next);
        const step = Math.min(length, 338 * time);
        if (length > 0) {
          moveX = (next.x - previous.x) * step / length;
          moveY = (next.y - previous.y) * step / length;
        }
        if (step === length) {
          route.current.shift();
          if (!route.current.length) setWaypoint(null);
        }
      }

      if (moveX || moveY) {
        const both = { x: previous.x + moveX, y: previous.y + moveY };
        const xOnly = { x: both.x, y: previous.y };
        const yOnly = { x: previous.x, y: both.y };
        if (walkable(both)) point.current = both;
        else if (walkable(xOnly) && moveX) point.current = xOnly;
        else if (walkable(yOnly) && moveY) point.current = yOnly;
        else if (!manual) {
          route.current = [];
          setWaypoint(null);
        }
      }
      const position = point.current;
      const moving = distance(previous, position) > 0.01;
      if (!canvas || !player) return;
      const cameraX = Math.min(Math.max(position.x - canvasSize.w * 0.45, 0), Math.max(0, worldSize.w - canvasSize.w));
      const cameraY = Math.min(Math.max(position.y - canvasSize.h * 0.56, 0), Math.max(0, worldSize.h - canvasSize.h));
      canvas.style.transform = `translate3d(-${cameraX}px, -${cameraY}px, 0)`;
      player.style.setProperty('--x', `${position.x}px`);
      player.style.setProperty('--y', `${position.y}px`);
      if (moving !== wasMoving) {
        player.dataset.walking = String(moving);
        if (!moving) settle();
      }
      if (moving && moveX) player.dataset.facing = moveX > 0 ? 'right' : 'left';
      if ((moving && now - lastRender > 40) || moving !== wasMoving) {
        lastRender = now;
        setLocation(position);
      }
      wasMoving = moving;
      request = requestAnimationFrame(frame);
    }
    request = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(request);
      resize.disconnect();
      settle();
    };
  }, [paused, walkable]);

  return { viewport, world, avatar, point, location, waypoint, travel, pad, nudge };
}
