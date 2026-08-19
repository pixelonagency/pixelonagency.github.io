/** Klaro tip bildirimi paketle gelmiyor — kullandığımız yüzeyi burada tanımlıyoruz. */
declare module 'klaro/dist/klaro-no-css.js' {
  export function setup(config: object): void;
  export function show(config?: object, modal?: boolean): void;
  const klaro: { setup: typeof setup; show: typeof show };
  export default klaro;
}
