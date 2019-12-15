/* eslint-disable @typescript-eslint/no-unused-expressions */
import yargs from 'yargs';

import { bundle } from './commands/bundle';

yargs
  .usage('Usage: $0 <cmd> [options]')
  .command(bundle)
  .demandCommand()
  .help('help').argv;
