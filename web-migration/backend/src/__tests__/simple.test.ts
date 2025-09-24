// Tests simples pour vérifier que Jest fonctionne
describe('Tests de base', () => {
  it('should pass basic test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should handle string operations', () => {
    const message = 'Hello, World!';
    expect(message).toContain('Hello');
    expect(message.length).toBe(13);
  });

  it('should handle array operations', () => {
    const numbers = [1, 2, 3, 4, 5];
    expect(numbers).toHaveLength(5);
    expect(numbers).toContain(3);
    expect(numbers.filter(n => n > 3)).toEqual([4, 5]);
  });

  it('should handle object operations', () => {
    const user = {
      id: '123',
      name: 'Test User',
      email: 'test@example.com'
    };
    
    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('name');
    expect(user.name).toBe('Test User');
  });

  it('should handle async operations', async () => {
    const promise = Promise.resolve('async result');
    const result = await promise;
    expect(result).toBe('async result');
  });

  it('should handle error cases', () => {
    expect(() => {
      throw new Error('Test error');
    }).toThrow('Test error');
  });
});
