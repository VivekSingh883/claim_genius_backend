import { httpServer } from './server';
import config from './src/config/index';

import logger from './src/utils/logger';

httpServer.listen(config.port, () => {
  logger.info(`Server running on port ${config.port} in ${config.env} mode`);
});
