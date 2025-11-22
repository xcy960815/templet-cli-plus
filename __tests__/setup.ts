// 测试环境设置文件
// 在这里可以配置全局的测试设置，如 mock、环境变量等

// Mock console 方法以避免测试时输出过多信息
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}

// 设置测试环境变量
process.env.NODE_ENV = 'test'
