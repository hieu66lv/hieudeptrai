export interface Channel {
  id: string;
  name: string;
  link: string;
  category: string;
  logo?: string;
  views: number;
  order: number;
}

export type Category = 'all' | 'general' | 'sports' | 'news' | 'entertainment' | 'kids' | 'music';

export interface CategoryInfo {
  value: Category;
  label: string;
  icon: string;
  color: string;
}

export const CATEGORIES: CategoryInfo[] = [
  { value: 'all', label: 'Tất Cả', icon: 'LayoutGrid', color: 'indigo' },
  { value: 'general', label: 'Tổng Hợp', icon: 'Tv', color: 'blue' },
  { value: 'sports', label: 'Thể Thao', icon: 'Trophy', color: 'emerald' },
  { value: 'news', label: 'Tin Tức', icon: 'Newspaper', color: 'sky' },
  { value: 'entertainment', label: 'Giải Trí', icon: 'Gamepad2', color: 'amber' },
  { value: 'kids', label: 'Trẻ Em', icon: 'Baby', color: 'pink' },
  { value: 'music', label: 'Âm Nhạc', icon: 'Music', color: 'purple' },
];
