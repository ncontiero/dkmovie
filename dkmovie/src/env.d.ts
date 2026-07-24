declare module "*.css";

declare module "*.svg" {
  const content: string;
  export default content;
}

type OrientationLockType =
  | "any"
  | "landscape"
  | "landscape-primary"
  | "landscape-secondary"
  | "natural"
  | "portrait"
  | "portrait-primary"
  | "portrait-secondary";
interface ScreenOrientation extends EventTarget {
  lock: (orientation: OrientationLockType) => Promise<void>;
}
