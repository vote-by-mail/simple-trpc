import { Handler } from './handler'
import { DEFAULT_PATH, deserializeResult, serializeFunc } from './utils'

export function Client<T extends object>(connector: Connector): T {
  return new Proxy({}, {
    get(a, name: string) {
      return async (...args: any[]) => {
        const input = serializeFunc({ name, args })
        const output = await connector(input)
        return deserializeResult(output).result
      }
    },
  }) as T
}

// connectors connect to server
export type Connector = (text: string) => Promise<string>

export function directConnector<T extends object>(handler: Handler<T>): Connector {
  return handler.handle.bind(handler)
}

function joinPath(x: string, y: string): string {
  // Don't want to include path module so do this manaully
  if (x.substr(-1) === '/' && y[0] === '/') {
    return x + y.substr(1)
  } else if (x.substr(-1) !== '/' && y[0] !== '/') {
    return x + '/' + y
  } else {
    return x + y
  }
}

export function httpConnector(url: string, path: string = DEFAULT_PATH): Connector {
  const fetch = (typeof window === 'undefined') ? require('node-fetch') : window.fetch
  return async (input: string) => {
    const response = await fetch(joinPath(url, path), {
      body: input,
      headers: { 'Content-Type': 'text/plain' },
      method: 'post',
    })
    return response.text()
  }
}