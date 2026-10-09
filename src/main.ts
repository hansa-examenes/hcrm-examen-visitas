import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  // Documentación: http://localhost:4002/api (JSON en /api-json)
  const config = new DocumentBuilder()
    .setTitle('examen-visitas')
    .setDescription('Visitas de campo y reportes (NestJS + MongoDB)')
    .setVersion('1.0')
    .build();
  SwaggerModule.setup('api', app, SwaggerModule.createDocument(app, config));

  const port = Number(process.env.PORT ?? 4002);
  await app.listen(port);
  console.log(`examen-visitas escuchando en http://localhost:${port} (Swagger en /api)`);
}
bootstrap();
