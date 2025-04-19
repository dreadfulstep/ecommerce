import { Request, Response } from 'express'
import { ensureAuth } from '../../../middleware/ensureAuth'

export const GET = ensureAuth((req: Request, res: Response) => {
  return res.json({
    message: 'Authenticated route',
    user: (req as any).user,
  })
})
