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
 *     description: >-
 *       Requiere enviar el access token (JWT) en el header:
 *       
 *         Authorization: Bearer <accessToken>
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
 *     description: >-
 *       Requiere enviar el access token (JWT) en el header:
 *       
 *         Authorization: Bearer <accessToken>
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
 *     description: >-
 *       Requiere enviar el access token (JWT) en el header:
 *       
 *         Authorization: Bearer <accessToken>
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserDto'
 *           example:
 *             email: user@example.com
 *             password: Password123!
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
 *     description: >-
 *       Requiere enviar el access token (JWT) en el header:
 *       
 *         Authorization: Bearer <accessToken>
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
 *           example:
 *             username: johndoe
 *             email: johndoe@example.com
 *             first_name: John
 *             last_name: Doe
 *             is_active: true
 *             is_verified: true
 *             password: Password123!
 *             passwordConfirm: Password123!
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
 *     description: >-
 *       Requiere enviar el access token (JWT) en el header:
 *       
 *         Authorization: Bearer <accessToken>
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
 *         username:
 *           type: string
 *           example: johndoe
 *         email:
 *           type: string
 *           format: email
 *           example: johndoe@example.com
 *         first_name:
 *           type: string
 *           example: John
 *         last_name:
 *           type: string
 *           example: Doe
 *         is_active:
 *           type: boolean
 *           example: true
 *         is_verified:
 *           type: boolean
 *           example: true
 *         password:
 *           type: string
 *           format: password
 *           example: "Password123!"
 *         passwordConfirm:
 *           type: string
 *           format: password
 *           example: "Password123!"
 */
