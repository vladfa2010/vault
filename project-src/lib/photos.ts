export const PHOTOS = [
  "1731635793329-0fdd79d179db",
  "1752350434967-29fe9a749b37",
  "1706560382811-dd7d0282c904",
  "1756992293716-b843700b5ab0",
  "1660399618104-53cf6b33339f",
  "1770492727730-05cb5ff3e90a",
  "1776662958125-893f153f592a",
  "1785403241855-f887b4eecf31",
  "1785403241660-b8ac924e9142",
  "1785403241652-5289a59f6f86",
] as const;

export type PhotoId = (typeof PHOTOS)[number];

export function photoUrl(id: PhotoId, size: number): string {
  return `https://images.unsplash.com/photo-${id}?w=${size}&h=${size}&q=75&auto=format&fit=crop`;
}

export function photoSrc(id: PhotoId, w: number, h: number): string {
  return `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&q=80&auto=format&fit=crop`;
}
