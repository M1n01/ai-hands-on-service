require('@testing-library/jest-dom');

const { getComputedStyle } = window;
window.getComputedStyle = (elt) => getComputedStyle(elt);
window.HTMLElement.prototype.scrollIntoView = () => {};

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

window.ResizeObserver = ResizeObserver;

// Web APIのグローバルオブジェクトを定義
global.Request = class Request {
  constructor(input, init = {}) {
    this.url = input;
    this.method = init.method || 'GET';
    this.body = init.body;
  }

  async json() {
    return JSON.parse(this.body);
  }
};

// モックされたNextResponseを作成
const mockNextResponse = {
  json: (body, init = {}) => {
    const response = new Response(JSON.stringify(body), {
      ...init,
      headers: { 'Content-Type': 'application/json' },
    });
    Object.defineProperty(response, 'status', {
      value: init.status || 200,
    });
    return response;
  },
};

// next/serverのモジュールモック
jest.mock('next/server', () => ({
  NextResponse: mockNextResponse,
}));

// Response, Headersのモック
global.Response = class Response {
  constructor(body, init = {}) {
    this._body = body;
    this.status = init.status || 200;
    this.statusText = init.statusText || '';
    this.headers = new Headers(init.headers);
  }

  async json() {
    return typeof this._body === 'string' ? JSON.parse(this._body) : this._body;
  }
};

global.Headers = class Headers {
  constructor(init = {}) {
    this._headers = new Map(Object.entries(init));
  }

  get(name) {
    return this._headers.get(name);
  }

  set(name, value) {
    this._headers.set(name, value);
  }
};
