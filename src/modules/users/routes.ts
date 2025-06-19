// src/modules/users/routes.ts
import { Router } from 'express';
import { UsersController } from './controllers/user.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { validateDto } from '../../middlewares/validate-dto';
import { CreateUserDto, UpdateUserDto, ListUsersDto } from './dtos';
import { asyncHandler } from '../../shared/asyncHandler';

export const usersRouter = Router();
const users = new UsersController();

// Protegemos todas las rutas /users para administradores o el propio usuario
usersRouter.use(authMiddleware); 

// Listar usuarios con paginación/filtros
usersRouter.get(
  '/',
  validateDto(ListUsersDto, 'query'),
  asyncHandler((req, res, next) => users.findAll(req, res, next))
);

// Obtener un usuario por ID
usersRouter.get('/:id', asyncHandler((req, res, next) => users.findOne(req, res, next)));

// Crear usuario (reutilizable de signup si es necesario)
usersRouter.post(
  '/',
  validateDto(CreateUserDto),
  asyncHandler((req, res, next) => users.create(req, res, next))
);

// Actualizar usuario
usersRouter.put(
  '/:id',
  validateDto(UpdateUserDto),
  asyncHandler((req, res, next) => users.update(req, res, next))
);

// "Eliminar" usuario (soft delete)
usersRouter.delete('/:id', asyncHandler((req, res, next) => users.remove(req, res, next)));
