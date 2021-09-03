/* tslint:disable */
/* eslint-disable */
/**
*/
export class App {
  free(): void;
/**
*/
  constructor();
/**
* @param {number} delta
* @returns {any}
*/
  update(delta: number): any;
/**
* @param {number} x
* @param {number} y
*/
  set_canvas_size(x: number, y: number): void;
/**
* @param {number} x
* @param {number} y
*/
  mouse_move(x: number, y: number): void;
/**
* @param {string} button
*/
  button_pressed(button: string): void;
/**
* @param {string} button
*/
  button_released(button: string): void;
/**
* @param {any} load_info
*/
  image_loaded(load_info: any): void;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_app_free: (a: number) => void;
  readonly app_new: () => number;
  readonly app_update: (a: number, b: number) => number;
  readonly app_set_canvas_size: (a: number, b: number, c: number) => void;
  readonly app_mouse_move: (a: number, b: number, c: number) => void;
  readonly app_button_pressed: (a: number, b: number, c: number) => void;
  readonly app_button_released: (a: number, b: number, c: number) => void;
  readonly app_image_loaded: (a: number, b: number) => void;
  readonly __wbindgen_malloc: (a: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number) => number;
  readonly __wbindgen_free: (a: number, b: number) => void;
}

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
*
* @returns {Promise<InitOutput>}
*/
export default function init (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
