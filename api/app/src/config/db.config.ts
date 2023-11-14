type dbConfigurationType = {
  HOST: string,
  USER: string,
  PASSWORD: string,
  DB: string,
  port: number,
  dialect: "postgres",
  pool: {
    max: number,
    min: number,
    acquire: number,
    idle: number
  }
}

export default {
  HOST: process.env.DB_HOST,
  USER: process.env.DB_USER,
  PASSWORD: process.env.DB_PASSWORD,
  DB: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
  dialect: "postgres",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
} as dbConfigurationType;
