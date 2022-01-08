import bodyParser from 'body-parser';
import { Router, Request } from 'express';
import * as jwt from 'jsonwebtoken';
import * as config from '../config';
import { Schema } from '../../shared/utils';
import {
  User, IUser, createUser,
  Posting, IPosting
} from '../models';

export function useToken<T>(request: Request<{}, {}, T>): string[] {
  const authorization = request.headers.authorization;
  if (!authorization) {
    throw new Error('invalid authorization');
  } else {
    return authorization.split(/\s+/);
  }
}

export function apiRouter() {
  const router = Router();
  router.use(bodyParser.json());

  router.post('/api/@me', async (req: Request<{}, {}, { email: string, password: string, remember: boolean }>, res) => {
    const userSchema = new Schema({
      email: 'string',
      password: 'string',
      remember: 'boolean'
    });

    if (userSchema.validate(req.body)) {
      try {
        const user = await User.login(req.body.email, req.body.password);

        const token = jwt.sign({
          user_id: user.user_id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          password: user.password
        }, config.JWT_SECRET);

        res.status(200).send({ message: 'ok', token: token, remember: req.body.remember });
      } catch (error) {
        console.error(error);
        res.status(400).send({ message: 'invalid credentials' });
      }
    } else {
      res.status(400).send({ message: 'invalid parameters' });
    }
  });

  router.post('/api/users', async (req: Request<{}, {}, IUser>, res) => {
    const newUserSchema = new Schema({
      firstName: 'string',
      lastName: 'string',
      password: 'string',
      email: 'string',
    });

    if (newUserSchema.validate(req.body)) {
      try {
        const user = await new User(
          req.body.firstName,
          req.body.lastName,
          req.body.email,
          req.body.password
        ).save();

        res.status(200).send({ message: 'ok' });
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'server failure' });
      }
    } else {
      res.status(400).send({ message: 'failure' });
    }
  });

  router.get('/api/@me/postings', async (req, res) => {
    try {
      const [_, token] = useToken(req);
      const user = createUser(<IUser>jwt.verify(token, config.JWT_SECRET));

      try {
        const postings = await user.fetchPostings();
        res.send({ postings: postings });
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'internal server error' });
      }
    } catch (error) {
      console.error(error);
      res.status(400).send({ message: 'invalid authorization token' });
    }
  });

  router.post('/api/postings/', async (req: Request<{}, {}, IPosting>, res) => {
    try {
      const [_, token] = useToken(req);
      const user = createUser(<User>jwt.verify(token, config.JWT_SECRET));
      const schema = new Schema({
        title: 'string',
        description: 'string'
      });

      if (schema.validate(req.body)) {
        try {
          const posting = await new Posting(user, req.body.title, req.body.description).save();
          console.log(posting);
          res.status(200).send({ message: 'ok' });
        } catch (error) {
          console.error(error);
          res.status(500).send({ message: 'internal server error' });
        }
      } else {
        res.status(400).send({ message: 'invalid data format' });
      }
    } catch (error) {

    }
  });

  return router;
}
