import express from "express";
import helmet from "helmet";
import cors from "cors";
import ratelimit from "express-rate-limit";
import { config } from "./config/env";
import {authRouter} from './modules/auth/routes';
import {usersRouter} from './modules/users/routes';

export function createApp() {
  const app = express();

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
          message: err.mesage ?? "Internal Server Error",
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
