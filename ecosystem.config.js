module.exports = {
  apps: [
    {
      name: 'rsaf-transport-backend',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 2012,
      },
    },
  ],
};
