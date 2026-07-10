export function createItemId() {
  return `item-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}
