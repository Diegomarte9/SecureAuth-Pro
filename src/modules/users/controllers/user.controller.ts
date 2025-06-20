import { Request, Response, NextFunction } from 'express';
import { UsersService } from '../services/users.service';

export class UsersController {
  private usersService = new UsersService();

  async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = 1, limit = 25, search } = req.query as any;
      const result = await this.usersService.findAll({ page, limit, search });
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  async findOne(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const currentUserId = (req as any).user?.sub;

      // Verificar permisos para ver el usuario
      if (currentUserId) {
        const canView = await this.usersService.canViewUser(currentUserId, id);
        if (!canView) {
          res.status(403).json({ message: 'Permisos insuficientes para ver este usuario' });
          return;
        }
      }

      const user = await this.usersService.findOne(id);
      res.status(200).json(user);
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = req.body;
      const user = await this.usersService.create(dto);
      res.status(201).json(user);
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const dto = req.body;
      const currentUserId = (req as any).user?.sub;

      const updated = await this.usersService.update(id, dto, currentUserId);
      res.status(200).json(updated);
    } catch (err) {
      next(err);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const currentUserId = (req as any).user?.sub;

      await this.usersService.softDelete(id, currentUserId);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}
