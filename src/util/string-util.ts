
export function parseCsvString(value: string, defaultValue?: string): string[] {
  if (value) {
    return value.split(',').map(v => v.trim());
  }

  return defaultValue ? [defaultValue] : [];
}
