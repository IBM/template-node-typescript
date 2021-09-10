
// tslint:disable
export abstract class LoggerApi {
  abstract log(message: string, context?: object): void;
  abstract info(message: string, context?: object): void;
  abstract debug(message: string, context?: object): void;
  abstract fatal(message: string, context?: object): void;
  abstract warn(message: string, context?: object): void;
  abstract error(message: string, context?: object): void;
  abstract trace(message: string, context?: object): void;
  abstract child(name: string): LoggerApi;
  abstract apply(app: {use: (app: any) => void}): void;
  time(action: string, startTime: number): void {
    const time = Date.now() - startTime;
    this.info(
      `TIMER: ${action} completed in ${time} milliseconds`,
      {
        duration: time,
        action: action,
        type: 'TIMER',
      },
    );
  }
}
