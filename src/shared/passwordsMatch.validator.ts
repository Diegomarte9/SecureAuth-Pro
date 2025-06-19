import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';

/**
 * Validador reutilizable para comparar dos campos de contraseña en un DTO.
 * Uso:
 *   @Validate(PasswordsMatchValidator, ['password', 'passwordConfirm'])
 *   passwordConfirm: string;
 */
@ValidatorConstraint({ name: 'passwordsMatch', async: false })
export class PasswordsMatchValidator implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const [field1, field2] = args.constraints;
    const object = args.object as any;
    return object[field1] === object[field2];
  }
  defaultMessage(args: ValidationArguments) {
    const [field1, field2] = args.constraints;
    return 'Las contraseñas no coinciden';
  }
} 