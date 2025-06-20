import { Router } from 'express';
import { UsersController } from './controllers/user.controller';
import { validateDto } from '../../middlewares/validate-dto';
import { CreateUserDto, UpdateUserDto, ListUsersDto } from './dtos';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { checkRole } from '../../middlewares/check-role';

export const usersRouter = Router();
const users = new UsersController();

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Lista usuarios (requiere autenticación y rol ADMIN)
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
 *       403:
 *         description: Permisos insuficientes
 */
usersRouter.get(
  '/',
  authMiddleware,
  checkRole(['ADMIN']),
  validateDto(ListUsersDto, 'query'),
  async (req, res, next): Promise<void> => {
    try {
      await users.findAll(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Obtiene un usuario por ID (requiere autenticación)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     description: >
 *       Requiere enviar el access token (JWT) en el header:
 *       
 *         Authorization: Bearer <accessToken>
 *       
 *       Un usuario normal solo puede ver su propia información.
 *       Usuarios con rol ADMIN pueden ver información de cualquier usuario.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permisos insuficientes
 *       404:
 *         description: Usuario no encontrado
 */
usersRouter.get('/:id', authMiddleware, async (req, res, next): Promise<void> => {
  try {
    await users.findOne(req, res, next);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Crea un nuevo usuario
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserDto'
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *       400:
 *         description: Error de validación
 */
usersRouter.post('/', validateDto(CreateUserDto), async (req, res, next): Promise<void> => {
  try {
    await users.create(req, res, next);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Actualiza un usuario (requiere autenticación)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     description: >
 *       Requiere enviar el access token (JWT) en el header:
 *       
 *         Authorization: Bearer <accessToken>
 *       
 *       Los usuarios normales solo pueden actualizar su propia información.
 *       Los usuarios con rol ADMIN pueden actualizar cualquier usuario.
 *       Solo se pueden editar los campos básicos: username, email, first_name, last_name, password.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
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
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permisos insuficientes
 *       404:
 *         description: Usuario no encontrado
 */
usersRouter.put('/:id', authMiddleware, validateDto(UpdateUserDto), async (req, res, next): Promise<void> => {
  try {
    await users.update(req, res, next);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Elimina un usuario (soft delete) - requiere autenticación y rol ADMIN
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     description: >
 *       Requiere enviar el access token (JWT) en el header:
 *       
 *         Authorization: Bearer <accessToken>
 *       
 *       Solo usuarios con rol ADMIN pueden eliminar usuarios.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Usuario eliminado
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permisos insuficientes
 *       404:
 *         description: Usuario no encontrado
 */
usersRouter.delete('/:id', authMiddleware, checkRole(['ADMIN']), async (req, res, next): Promise<void> => {
  try {
    await users.remove(req, res, next);
  } catch (error) {
    next(error);
  }
});

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
 *         password:
 *           type: string
 *           format: password
 *           example: "Password123!"
 *         passwordConfirm:
 *           type: string
 *           format: password
 *           example: "Password123!"
 */

export default usersRouter;
