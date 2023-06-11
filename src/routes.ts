import { Router } from 'express';

import HelloWorldController from './app/controllers/HelloWorldController';

const routes = Router();

routes.get('/', HelloWorldController.index);

export default routes;
