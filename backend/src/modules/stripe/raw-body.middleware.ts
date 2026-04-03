import { Injectable, NestMiddleware, RawBodyRequest } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as bodyParser from 'body-parser';

@Injectable()
export class RawBodyMiddleware implements NestMiddleware {
  use(req: RawBodyRequest<Request>, res: Response, next: NextFunction) {
    bodyParser.raw({ type: 'application/json' })(req, res, (err) => {
      if (err) {
        return next(err);
      }
      next();
    });
  }
}
