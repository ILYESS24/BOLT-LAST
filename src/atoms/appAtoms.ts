import { atom } from "jotai";
import type { App } from "@/lib/schemas";

// Atoms simples pour éviter les erreurs de signature
export const appsAtom = atom<App[]>([]);
export const isLoadingAtom = atom<boolean>(false);
export const errorAtom = atom<string | null>(null);
export const selectedAppIdAtom = atom<string | null>(null);
export const currentAppAtom = atom<App | null>(null);
export const previewModeAtom = atom<"code" | "preview" | "split">("split");
export const selectedVersionIdAtom = atom<string | null>(null);
export const appOutputAtom = atom<string>("");
export const previewPanelKeyAtom = atom<number>(0);
export const versionsListAtom = atom<any[]>([]);

// Export du type App
export type { App };