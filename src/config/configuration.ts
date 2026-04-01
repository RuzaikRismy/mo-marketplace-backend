export default () => ({
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'root',
    name: process.env.DB_NAME || 'mo_marketplace',
  },
  jwt: {
    secret: 'mo_marketplace_jwt_secret_key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
});