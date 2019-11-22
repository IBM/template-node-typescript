
export function timer<T>(value: T, timer: number): Promise<T> {
  return new Promise<T>(resolve => {
    setTimeout(() => {
      resolve(value);
    }, timer);
  })
}
