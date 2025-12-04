export function slugify(input: string) {
  return input
    .toLocaleLowerCase("tr-TR")
    .trim()
    .replace(/[^a-z0-9ğüşöçıİıçşöğ\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
