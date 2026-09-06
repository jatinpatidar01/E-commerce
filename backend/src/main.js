require('dotenv').config();
require('reflect-metadata');

const cookieParser = require('cookie-parser');
const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./app.module');
// const ngrok = require("@ngrok/ngrok");



async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });

  app.use(cookieParser());

  app.enableCors({
    origin: true,
    credentials: true,
  });

  await app.listen(process.env.PORT || 4000);
}

bootstrap();