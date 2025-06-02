import type { IconType } from "react-icons";

export interface TabItem {
  id: string;
  title: string;
  to: string;
  icon: IconType;
  pinned: boolean;
}
