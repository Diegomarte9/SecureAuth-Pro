import express from "express";
import helmet from "helmet";
import cors from "cors";
import ratelimit from "express-rate-limit";
import { config } from "./config/env";
import {authRouter} from './modules/auth/routes';
import {usersRouter} from './modules/users/routes';
import swaggerUi from 'swagger-ui-express';
import 'reflect-metadata';
import yaml from 'js-yaml';
import fs from 'fs';

export function createApp() {
  const app = express();

  // Trust proxy para que funcione correctamente con proxies (ngrok, Docker, Nginx, etc.)
  app.set('trust proxy', true);

  // Seguridd HTTP headers
  app.use(helmet());

  // CORS
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN ?? "*",
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    })
  );

  // Limitación de tasa
  app.use(
    ratelimit({
      windowMs: config.rateLimitWindowMs,
      max: config.rateLimitMaxRequests,
      standardHeaders: true,
      legacyHeaders: false,
      message: "Demasiadas solicitudes, por favor intente más tarde.",
    })
  );

  // Middleware para parsear JSON
  app.use(express.json());

  // Rutas
  app.use('/auth', authRouter);
  app.use('/users', usersRouter);

  // Swagger/OpenAPI docs
  if (process.env.NODE_ENV !== 'production' || process.env.SWAGGER_ENABLE === 'true') {
    // Cargar y combinar los archivos YAML de Swagger
    const authSpec = yaml.load(fs.readFileSync('./src/modules/auth/auth.swagger.yaml', 'utf8')) as any;
    const usersSpec = yaml.load(fs.readFileSync('./src/modules/users/users.swagger.yaml', 'utf8')) as any;
    // Combinar los paths y components
    const swaggerSpec = {
      ...authSpec,
      paths: { ...authSpec.paths, ...usersSpec.paths },
      components: {
        ...authSpec.components,
        schemas: { ...authSpec.components?.schemas, ...usersSpec.components?.schemas },
        securitySchemes: { ...authSpec.components?.securitySchemes, ...usersSpec.components?.securitySchemes },
      },
      tags: [
        ...(authSpec.tags || []),
        ...(usersSpec.tags || []),
      ],
    };
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  }

  //Ruta healt-check
  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok", uptime: process.uptime() });
  });

  // Middleware global de manejo de errores
  app.use(
    (
      err: any,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction
    ) => {
      console.error("Unhandled error:", err);
      const status = err.statusCode ?? 500;
      res.status(status).json({
        error: {
          message: err.message ?? "Internal Server Error",
        },
      });
    }
  );

  // Redirige HTTP a HTTPS solo en producción
  if (process.env.NODE_ENV === 'production') {
    app.use((req, res, next) => {
      if (req.headers['x-forwarded-proto'] !== 'https') {
        return res.redirect('https://' + req.headers.host + req.url);
      }
      next();
    });
  }

  return app;
}

const app = createApp();
export default app;
