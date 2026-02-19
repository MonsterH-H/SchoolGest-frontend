// Fix for TypeScript configuration issues with test matchers`ndeclare const expect: any;`n`nimport { StatusLabelPipe } from './status-label.pipe';

describe('StatusLabelPipe', () => {
  it('create an instance', () => {
    const pipe = new StatusLabelPipe();
    expect(pipe).toBeTruthy();
  });
});


