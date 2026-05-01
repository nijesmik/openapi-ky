/**
 * `Omit` that distributes over union members.
 *
 * TypeScript's built-in `Omit<T, K>` does NOT distribute when `T` is a union:
 * it computes `keyof T` (intersection of member keys) once, losing each
 * member's specific shape. `DistributiveOmit` wraps the operation in a
 * `T extends unknown` conditional, which TypeScript distributes over the
 * union, applying `Omit` per member.
 *
 * @example
 * ```ts
 * type A = { x: number; y: string };
 * type B = { x: number; z: boolean };
 *
 * type Plain = Omit<A | B, "x">;
 * // → { } (only common keys minus "x")
 *
 * type Distributed = DistributiveOmit<A | B, "x">;
 * // → { y: string } | { z: boolean }
 * ```
 */
export type DistributiveOmit<T, K extends keyof never> = T extends unknown ? Omit<T, K> : never;
