const Promise = require('bluebird');
const fs = require('fs');
const path = require('path');
const glob = require('glob').sync;
const _ = require('lodash');
const Args = require('args');
const os = require('os');
const cluster = require('cluster');
const chalk = require('chalk');
const utils = require('../core/utils');
const Config = require('../config');
const Microservix = require('../core');
const mongoose = require('mongoose');
const {db} = require('../config');

const stopSignals = [
  'SIGHUP',
  'SIGINT',
  'SIGQUIT',
  'SIGILL',
  'SIGTRAP',
  'SIGABRT',
  'SIGBUS',
  'SIGFPE',
  'SIGUSR1',
  'SIGSEGV',
  'SIGUSR2',
  'SIGTERM',
];
const production = process.env.NODE_ENV === 'production';

let flags;
let config;
let servicePaths;
let broker;

/* eslint-disable no-console */

/**
 * Logger helper
 *
 */
const logger = {
  info(message) {
    console.log(chalk.green.bold(message));
  },
  error(err) {
    if (err instanceof Error) console.error(chalk.red.bold(err.message), err);
    else console.error(chalk.red.bold(err));
  },
};

/**
 * Process command line arguments
 *
 * Available options:
 -h, --help       Output usage information
 -H, --hot        Hot reload services if changed (disabled by default)
 -i, --instances  Launch [number] instances node (load balanced)
 -m, --mask       Filemask for service loading
 -r, --repl       Start REPL mode (disabled by default)
 -s, --silent     Silent mode. No logger (disabled by default)
 -v, --version    Output the version number
 */
function processFlags() {
  Args.option('repl', 'Start REPL mode', false)
    .option(['H', 'hot'], 'Hot reload services if changed', false)
    .option('silent', 'Silent mode. No logger', false)
    .option('instances', 'Launch [number] instances node (load balanced)')
    .option('mask', 'Filemask for service loading');

  flags = Args.parse(process.argv, {
    mri: {
      alias: {
        r: 'repl',
        H: 'hot',
        s: 'silent',
        i: 'instances',
        m: 'mask',
      },
      boolean: ['repl', 'silent', 'hot'],
      string: ['mask'],
    },
  });

  servicePaths = Args.sub;
}

/**
 * Running
 */
function run() {
  return Promise.resolve()
    .then(checkConfig)
    .then(mergeOptions)
    .then(startBroker)
    .catch((err) => {
      logger.error(err);
      process.exit(1);
    });
}

/**
 * Check config exist
 */
function checkConfig() {
  if (!Config.microservix) {
    return Promise.reject(new Error('Config is not exist!!'));
  }
}

/**
 * Merge broker options
 *
 * Merge options from flags and config. First load the
 * config if exists. After it overwrite the vars from
 * the flags.
 *
 */
function mergeOptions() {
  config = _.defaultsDeep(
    Config.microservix,
    Microservix.ServiceBroker.defaultOptions,
  );

  if (flags.silent) {
    config.logger = null;
  } else if (config.logger == null) {
    config.logger = console;
  }

  if (flags.hot) {
    config.hotReload = true;
  }
}

/**
 * Start Microservix broker
 */
function startBroker() {
  const worker = cluster.worker;

  if (worker) {
    Object.assign(config, {
      nodeID: `${config.nodeID || utils.getNodeID()}-${worker.id}`,
    });
  }

  // Create service broker
  broker = new Microservix.ServiceBroker(Object.assign({}, config));

  loadServices();

  return broker.start().then(() => {
    if (flags.repl && (!worker || worker.id === 1)) broker.repl();
  });
}

/**
 * Load services from files or directories
 *
 * 1. If find `SERVICEDIR` env var and not find `SERVICES` env var, load all services from the `SERVICEDIR` directory
 * 2. If find `SERVICEDIR` env var and `SERVICES` env var, load the specified services from the `SERVICEDIR` directory
 * 3. If not find `SERVICEDIR` env var but find `SERVICES` env var, load the specified services from the current directory
 * 4. check the CLI arguments. If it find filename(s), load it/them
 * 5. If find directory(ies), load it/them
 *
 * Please note: you can use shorthand names for `SERVICES` env var.
 *    E.g.
 *        SERVICES=posts,users
 *
 *        It will be load the `posts.service.js` and `users.service.js` files
 *
 *
 */
function loadServices() {
  const fileMask = flags.mask || '**/*.service.js';

  const svcDir = path.resolve(process.cwd(), '');

  const patterns = servicePaths;

  if (patterns.length > 0) {
    let serviceFiles = [];

    patterns.map(s => s.trim()).forEach((p) => {
      const skipping = p[0] == '!';
      if (skipping) p = p.slice(1);

      let files;
      const svcPath = path.isAbsolute(p) ? p : path.resolve(svcDir, p);
      // Check is it a directory?
      if (isDirectory(svcPath)) {
        files = glob(`${svcPath  }/${  fileMask}`, { absolute: true });
        if (files.length === 0) {return broker.logger.warn(
            chalk.yellow.bold(
              `There is no service files in directory: '${svcPath}'`
            )
          );}
      } else if (isServiceFile(svcPath)) {
        files = [svcPath.replace(/\\/g, '/')];
      } else if (isServiceFile(`${svcPath  }.service.js`)) {
        files = [`${svcPath.replace(/\\/g, "/")  }.service.js`];
      } else {
        // Load with glob
        files = glob(p, { cwd: svcDir, absolute: true });
        if (files.length === 0) {broker.logger.warn(
            chalk.yellow.bold(`There is no matched file for pattern: '${p}'`)
          );}
      }

      if (files && files.length > 0) {
        if (skipping) {serviceFiles = serviceFiles.filter(f => files.indexOf(f) === -1);}
        else serviceFiles.push(...files);
      }
    });

    _.uniq(serviceFiles).forEach(f => broker.loadService(f));
  }
}

/**
 * Check the given path whether directory or not
 *
 * @param {String} p
 * @returns {Boolean}
 */
function isDirectory(p) {
  try {
    return fs.lstatSync(p).isDirectory();
  } catch (_) {
    // ignore
  }
  return false;
}

/**
 * Check the given path whether a file or not
 *
 * @param {String} p
 * @returns {Boolean}
 */
function isServiceFile(p) {
  try {
    return !fs.lstatSync(p).isDirectory();
  } catch (_) {
    // ignore
  }
  return false;
}

/*
 * Start cluster workers
 */
function startWorkers(instances) {
  let stopping = false;

  cluster.on('exit', (worker, code) => {
    if (!stopping) {
      // only restart the worker if the exit was by an error
      if (production && code !== 0) {
        logger.info(`The worker #${worker.id} has disconnected`);
        logger.info(`Worker #${worker.id} restarting...`);
        cluster.fork();
        logger.info(`Worker #${worker.id} restarted`);
      } else {
        process.exit(code);
      }
    }
  });

  const workerCount =    Number.isInteger(instances) && instances > 0 ? instances : os.cpus().length;

  logger.info(`Starting ${workerCount} workers...`);

  for (let i = 0; i < workerCount; i++) {
    cluster.fork();
  }

  stopSignals.forEach((signal) => {
    process.on(signal, () => {
      logger.info(`Got ${signal}, stopping workers...`);
      stopping = true;
      cluster.disconnect(() => {
        logger.info('All workers stopped, exiting.');
        process.exit(0);
      });
    });
  });
}

Promise.resolve()
  .then(processFlags)
  .then(() => {
    mongoose.connect(db.url, { useNewUrlParser: true });
    mongoose.set('useCreateIndex', true);


    if (flags.instances !== undefined && cluster.isMaster) {
      return startWorkers(flags.instances);
    }

    return run();
  });
