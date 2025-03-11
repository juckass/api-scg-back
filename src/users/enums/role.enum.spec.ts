import { Role } from './role.enum';

describe('Role Enum', () => {
  it('should have the correct values', () => {
    expect(Role.ADMIN).toBe('ADMIN');
    expect(Role.USER).toBe('USER');
  });

  it('should have exactly two roles', () => {
    const roleValues = Object.values(Role);
    expect(roleValues).toHaveLength(2);
    expect(roleValues).toContain('ADMIN');
    expect(roleValues).toContain('USER');
  });
});