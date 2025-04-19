import { Request, Response } from 'express'

interface Users {
    [key: string]: { name: string }
}

const users: Users = {
    "123": { name: "Bob" }
}

export function ensureAuth(handler: (req: Request, res: Response) => any) {
  return function (req: Request, res: Response) {
    const authHeader = req.headers['authorization'] as string | undefined

    if (!authHeader) {
      return res.status(401).json({
        error: { message: 'You are not authorized to access this route.', code: 'UNAUTHORIZED' },
      })
    }

    (req as any).user = users[authHeader]

    return handler(req, res)
  }
}
