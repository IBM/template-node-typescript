
export function omit<T = any, U = any>(object: T, toOmit: keyof T | Array<keyof T>): U {
  return Object
    .keys(object)
    .filter(not(isIncluded(toOmit)))
    .reduce((result: U, field: string) => {
      result[field] = object[field];
      return result;
    }, {} as any);
}

function not(func: (value: string) => boolean): (value: string) => boolean {
  return (value: string): boolean => {
    return !func(value);
  }
}

function isIncluded<T>(toOmit: keyof T | Array<keyof T>): (value: string) => boolean {
  const matcher: string[] = (Array.isArray(toOmit) ? toOmit : [toOmit]) as string[];

  return (value: string): boolean => {
    return matcher.includes(value);
  }
}