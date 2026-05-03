import type { Options as KyOptions } from "ky";

/** @internal */
export type PathParams = Record<string, boolean | number | string>;

/** @internal */
export type Options = KyOptions & { params?: PathParams };
