/** Physical edge of the flat blank the flap attaches to (center base spans x ∈ [-W/2,W/2], y ∈ [0,L]). */
export type BoxTrayEdge = "south" | "north" | "west" | "east";

export interface BoxTraySideRow {
  id: string;
  edge: BoxTrayEdge;
  /** Height of the side (inches), perpendicular to the base in the flat layout — the “return” length. */
  flangeHeightIn: number;
  /** Signed bend °: positive tips the flap toward +Z (outward); negative toward −Z. */
  angleDeg: number;
  /** When set, this return continues from the free edge of the parent row (same edge); UI nests under that side. */
  parentId?: string | null;
  /** Optional hem on the free edge of this fold (only meaningful on leaf folds). */
  hemType?: "none" | "open" | "closed";
  /** Hem size (in). */
  hemSizeIn?: number;
}
