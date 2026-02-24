/**
 * Extend JSX so R3F primitives (mesh, group, etc.) are typed.
 * @see node_modules/@react-three/fiber/dist/declarations/src/three-types.d.ts
 */
import type { ThreeElements } from "@react-three/fiber";

declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

export {};
