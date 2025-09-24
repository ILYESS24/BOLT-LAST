import { atom } from "jotai";

// Atoms simples pour éviter les erreurs de signature
export const selectedFileAtom = atom<string | null>(null);
export const selectedComponentAtom = atom<string | null>(null);
export const previewModeAtom = atom<"code" | "preview" | "split">("split");
export const isPreviewOpenAtom = atom<boolean>(false);
export const selectedComponentPreviewAtom = atom<string | null>(null);