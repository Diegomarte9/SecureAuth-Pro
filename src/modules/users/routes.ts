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

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Lista usuarios (requiere autenticación)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Página de resultados
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Cantidad de resultados por página
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *       401:
 *         description: No autorizado
 */
// Listar usuarios con paginación/filtros
usersRouter.get(
  '/',
  validateDto(ListUsersDto, 'query'),
  asyncHandler((req, res, next) => users.findAll(req, res, next))
);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Obtiene un usuario por ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *       404:
 *         description: Usuario no encontrado
 */
// Obtener un usuario por ID
usersRouter.get('/:id', asyncHandler((req, res, next) => users.findOne(req, res, next)));

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Crea un usuario (requiere autenticación)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserDto'
 *     responses:
 *       201:
 *         description: Usuario creado
 *       400:
 *         description: Error de validación
 */
// Crear usuario (reutilizable de signup si es necesario)
usersRouter.post(
  '/',
  validateDto(CreateUserDto),
  asyncHandler((req, res, next) => users.create(req, res, next))
);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Actualiza un usuario
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserDto'
 *     responses:
 *       200:
 *         description: Usuario actualizado
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Usuario no encontrado
 */
// Actualizar usuario
usersRouter.put(
  '/:id',
  validateDto(UpdateUserDto),
  asyncHandler((req, res, next) => users.update(req, res, next))
);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Elimina (soft delete) un usuario
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario eliminado
 *       404:
 *         description: Usuario no encontrado
 */
// "Eliminar" usuario (soft delete)
usersRouter.delete('/:id', asyncHandler((req, res, next) => users.remove(req, res, next)));

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateUserDto:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: user@example.com
 *         password:
 *           type: string
 *           format: password
 *           example: "Password123!"
 *     UpdateUserDto:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: user@example.com
 *         password:
 *           type: string
 *           format: password
 *           example: "Password123!"
 */
