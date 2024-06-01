interface Item {
  index: string;
  isFolder?: boolean;
  children: string[];
  data: string;
}

export function convertPathsToItems(paths: string[]): Record<string, Item> {
  const items: Record<string, Item> = {};
  const parentMap = new Map<string, string>();

  // Create items and build parent-child relationships
  for (const path of paths) {
    const parts = path.split("/");
    let currentItem: Item | null = null;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const index = parts.slice(0, i + 1).join("/");

      if (!items[index]) {
        items[index] = {
          index,
          children: [],
          data: part,
        };
      }

      if (currentItem) {
        if (!currentItem.children.includes(index)) {
          currentItem.children.push(index);
        }
      }

      currentItem = items[index];
      parentMap.set(index, i > 0 ? parts.slice(0, i).join("/") : "root");
    }
  }

  // Set isFolder property based on children
  for (const item of Object.values(items)) {
    if (item.children.length > 0) {
      item.isFolder = true;
    }
  }

  // Set root item
  items.root = {
    index: "root",
    isFolder: true,
    children: [],
    data: "Root item",
  };

  // Add root children
  Array.from(parentMap.entries()).forEach(([childIndex, parentIndex]) => {
    if (parentIndex === "root") {
      items.root.children.push(childIndex);
    }
  });

  return items;
}
