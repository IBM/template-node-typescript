export class HelloWorldService {
  greeting(name: string = 'World'): string {
    return `Hello, ${name}!`;
  }
}
