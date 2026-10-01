import type { AppDef } from '../core/server.js';
import { APP } from './meta.js';
import { migrations } from './migrations.js';
import { routes } from './routes.js';

export const appDef: AppDef = { ...APP, migrations, routes };
