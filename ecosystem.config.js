// ─────────────────────────────────────────────────────────────────────────────
// PM2 ecosystem config cho Backend (NestJS)
//
// Cài PM2 lần đầu trên server (chạy 1 lần duy nhất):
//   npm install -g pm2
//
// Khởi động BE lần đầu:
//   cd /home/vsoftware.vn-api    # hoặc đường dẫn repo BE trên server
//   npm ci && npm run build
//   cp .env.example .env         # sửa .env cho prod (DB, JWT, SMTP, ...)
//   pm2 start ecosystem.config.js
//   pm2 save
//   pm2 startup                  # chạy theo lệnh PM2 in ra (chỉ 1 lần)
//
// Lệnh hàng ngày:
//   pm2 status                   # xem trạng thái
//   pm2 logs vsoftware-api       # xem log realtime
//   pm2 reload vsoftware-api     # restart không downtime
// ─────────────────────────────────────────────────────────────────────────────

module.exports = {
  apps: [
    {
      name: 'vsoftware-api',
      script: 'dist/main.js',         // file build ra của NestJS
      cwd: './',
      instances: 1,                   // NestJS với jobs/cron nên fork 1 instance
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',

      env: {
        NODE_ENV: 'production',
        // Các biến khác đọc từ file .env (đã có @nestjs/config tự load)
      },

      // Log
      error_file: './logs/be-error.log',
      out_file: './logs/be-out.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
  ],
}
