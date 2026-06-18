export interface MenuItem {
  id: string;
  label: string;
  url: string | null;
  parentId: string | null;
  order: number;
  isOpenInNew: boolean;
  isVisible: boolean;
  menuType: string;
  children?: MenuItem[];
}

/** Flat list → nested tree */
export function buildTree(flat: MenuItem[], parentId: string | null = null): MenuItem[] {
  return flat
    .filter(i => i.parentId === parentId)
    .sort((a, b) => a.order - b.order)
    .map(i => ({ ...i, children: buildTree(flat, i.id) }));
}

/** Nested tree → flat list with correct order/parentId */
export function flattenTree(
  nodes: MenuItem[],
  parentId: string | null = null,
  acc: MenuItem[] = [],
): MenuItem[] {
  nodes.forEach((node, idx) => {
    const { children, ...rest } = node;
    acc.push({ ...rest, parentId, order: idx });
    if (children?.length) flattenTree(children, node.id, acc);
  });
  return acc;
}
