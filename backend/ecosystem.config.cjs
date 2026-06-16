module.exports = {
  apps: [
    {
      name: 'mockea-backend',
      script: 'src/index.js',
      instances: 'max', // Utilizes all logical CPU cores
      exec_mode: 'cluster', // Cluster mode (load balanced)
      env: {
        NODE_ENV: 'production',
      },
      env_development: {
        NODE_ENV: 'development',
      }
    }
  ]
};
