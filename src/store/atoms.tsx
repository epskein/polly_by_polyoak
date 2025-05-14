import { atom } from "jotai"
import type { SavedTemplate } from "../types/inventory"

export const savedTemplatesAtom = atom<SavedTemplate[]>([])

