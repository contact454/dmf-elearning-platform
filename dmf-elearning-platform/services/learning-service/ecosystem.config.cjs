module.exports = {
  apps: [{
    name: "german-factory",
    script: "./scripts/german-data-factory.mjs",
    cwd: "/Users/huynhngocphuc/Dev-Workspace/Active-Projects/05-DMF-Elearning/dmf-elearning-platform/services/learning-service",
    max_memory_restart: "1G",
    instances: 1,
    autorestart: true,
    watch: false,
    error_file: "./storage/logs/german-factory-error.log",
    out_file: "./storage/logs/german-factory-out.log",
    log_date_format: "YYYY-MM-DD HH:mm:ss Z",
    env: {
      NODE_ENV: "production"
    }
  }]
};
