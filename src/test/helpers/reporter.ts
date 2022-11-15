import { DisplayProcessor, SpecReporter, StacktraceOption } from 'jasmine-spec-reporter';
import CustomReporter = jasmine.CustomReporter;
import JasmineStartedInfo = jasmine.JasmineStartedInfo;

class CustomProcessor extends DisplayProcessor {
  public displayJasmineStarted(info: JasmineStartedInfo, log: string): string {
    return `TypeScript ${log}`;
  }
}

jasmine.getEnv().clearReporters();
jasmine.getEnv().addReporter(
  new SpecReporter({
    spec: {
      displayStacktrace: StacktraceOption.NONE
    },
    customProcessors: [CustomProcessor]
  }) as CustomReporter
);
