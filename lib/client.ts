import { Server } from "./server"
import { serializeFunc, deserializeResult } from "./utils"

export function Client<T extends object>(server: Server<T>): T {
  return new Proxy({}, {
    get(a, name: string) {
      return function (...args: any[]) {
        const input = serializeFunc({ name, args })
        const response = server.handle(input)
        return deserializeResult(response)
      }
    },
  }) as T
}
