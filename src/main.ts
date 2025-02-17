import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import * as cookieParser from 'cookie-parser'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  const config = app.get(ConfigService)

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
    .setDescription('API для ABAI CTM QUEUE SYSTEM')
    .setVersion('1.0')
    .addCookieAuth('access_token')
    .build()

  const document = SwaggerModule.createDocument(app, swaggerConfig)
  SwaggerModule.setup('api/docs', app, document)

  await app.listen(config.getOrThrow<number>('PORT'))
}

bootstrap()
