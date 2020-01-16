
// tslint:disable
export abstract class LoggerApi {
  abstract log(message: any, ...args: any): void;
  abstract info(message: any, ...args: any): void;
  abstract debug(message: any, ...args: any): void;
  abstract fatal(message: any, ...args: any): void;
  abstract warn(message: any, ...args: any): void;
  abstract error(message: any, ...args: any): void;
  abstract trace(message: any, ...args: any): void;
  abstract child(name: string): LoggerApi;
  abstract apply(app: {use: (app: any) => void}): void;
  time(action: string, startTime: number): void {
    const time = Date.now() - startTime;
    this.info(
      {
        duration: time,
        action: action,
        type: 'TIMER',
      },
      `TIMER: ${action} completed in ${time} milliseconds`,
    );
  }
}
