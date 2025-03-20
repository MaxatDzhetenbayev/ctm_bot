import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import * as cookieParser from 'cookie-parser'
import * as fs from 'fs'
import { AppModule } from './app.module'
declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  const config = app.get(ConfigService)

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }

  app.use(cookieParser())
  app.useGlobalPipes(new ValidationPipe())

  app.enableCors({
    origin: config.getOrThrow<string>('ALLOWED_ORIGIN'),
    credentials: true
  })

  app.set('trust proxy', true)
  app.setGlobalPrefix('/api')

  const swaggerConfig = new DocumentBuilder()
    .setTitle('CTM API')
    .setDescription(
      `
      API для Информационной системы ABAI CTM QUEUE 

      ### 🔗 Скачать OpenAPI:  
      - [📄 JSON](/users/openapi)
    `
    )
    .setVersion('1.0')
    .addCookieAuth('access_token')
    .build()

  const document = SwaggerModule.createDocument(app, swaggerConfig)
  SwaggerModule.setup('api', app, document)

  fs.writeFileSync('./swagger-spec.json', JSON.stringify(document, null, 2))

  await app.listen(config.getOrThrow<number>('APPLICATION_PORT'))
}

bootstrap()
