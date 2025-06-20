import { Router } from 'express';
import { UsersController } from './controllers/user.controller';
import { validateDto } from '../../middlewares/validate-dto';
import { CreateUserDto, UpdateUserDto, ListUsersDto } from './dtos';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { checkRole } from '../../middlewares/check-role';

export const usersRouter = Router();
const users = new UsersController();

usersRouter.get('/', authMiddleware, checkRole(['ADMIN']), validateDto(ListUsersDto, 'query'), async (req, res, next): Promise<void> => {
  try {
    await users.findAll(req, res, next);
  } catch (error) {
    next(error);
  }
});

usersRouter.get('/:id', authMiddleware, async (req, res, next): Promise<void> => {
  try {
    await users.findOne(req, res, next);
  } catch (error) {
    next(error);
  }
});

usersRouter.post('/', authMiddleware, checkRole(['ADMIN']), validateDto(CreateUserDto), async (req, res, next): Promise<void> => {
  try {
    await users.create(req, res, next);
  } catch (error) {
    next(error);
  }
});

usersRouter.put('/:id', authMiddleware, validateDto(UpdateUserDto), async (req, res, next): Promise<void> => {
  try {
    await users.update(req, res, next);
  } catch (error) {
    next(error);
  }
});

usersRouter.delete('/:id', authMiddleware, checkRole(['ADMIN']), async (req, res, next): Promise<void> => {
  try {
    await users.remove(req, res, next);
  } catch (error) {
    next(error);
  }
});

usersRouter.post('/:id/approve', authMiddleware, checkRole(['ADMIN']), async (req, res, next) => {
  await users.approveUser(req, res, next);
});

usersRouter.post('/:id/reject', authMiddleware, checkRole(['ADMIN']), async (req, res, next) => {
  await users.rejectUser(req, res, next);
});

export default usersRouter;
