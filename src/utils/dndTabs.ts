import type { TabItem } from "../types";

export const reorder = (
  list: TabItem[],
  startIndex: number,
  endIndex: number
): TabItem[] => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};
