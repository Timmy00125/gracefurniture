// Lets TSX recognize <model-viewer> as a valid JSX element.
// model-viewer is a Web Component, so we declare its shape manually.
// In React 19 the JSX namespace lives at React.JSX (not global JSX).

import type { DetailedHTMLProps, HTMLAttributes, RefAttributes } from "react";

interface ModelViewerJSX {
  src?: string;
  "ios-src"?: string;
  alt?: string;
  ar?: boolean;
  "ar-modes"?: string;
  "ar-scale"?: "auto" | "fixed";
  "ar-placement"?: "floor" | "wall";
  "camera-controls"?: boolean;
  "auto-rotate"?: boolean;
  "auto-rotate-delay"?: number | string;
  "rotation-per-second"?: string;
  "shadow-intensity"?: number | string;
  "shadow-softness"?: number | string;
  exposure?: number | string;
  "environment-image"?: string;
  poster?: string;
  "camera-orbit"?: string;
  "field-of-view"?: string;
  loading?: "auto" | "lazy" | "eager";
  reveal?: "auto" | "interaction" | "manual";
  "interaction-prompt"?: "auto" | "when-focused" | "none";
  "touch-action"?: string;
  "disable-zoom"?: boolean;
}

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": DetailedHTMLProps<
        ModelViewerJSX & HTMLAttributes<HTMLElement> & RefAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}

export {};
