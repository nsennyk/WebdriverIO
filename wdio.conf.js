require('dotenv').config();

exports.config = {
  runner: 'local',
  autoCompileOpts: {
    autoCompile: false,
  },

  specs: ['./test/specs/**/*.spec.js'],
  exclude: [],

  maxInstances: 1,

  capabilities: [
    {
      browserName: 'chrome',
      'goog:chromeOptions': {
        args: [
          ...(process.env.HEADLESS === 'true' ? ['--headless=new'] : []),
          '--disable-gpu',
          '--window-size=1400,1000',
        ],
        // block the native "Allow notifications?" prompt - it steals OS-level focus (outside the
        // DOM, so no selector can dismiss it) and can eat/derail whatever we're typing at the time.
        prefs: {
          'profile.default_content_setting_values.notifications': 2,
          'profile.default_content_setting_values.geolocation': 2,
        },
      },
    },
  ],

  logLevel: 'warn',
  bail: 0,
  baseUrl: process.env.BASE_URL || 'https://www.flagman.kiev.ua/',
  waitforTimeout: 10000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,

  framework: 'mocha',
  reporters: ['spec'],

  mochaOpts: {
    ui: 'bdd',
    timeout: 60000,
  },
};
