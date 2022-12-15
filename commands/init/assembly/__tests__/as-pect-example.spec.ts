class Vec3 {
  constructor(public x: f64 = 0, public y: f64 = 0, public z: f64 = 0) {}
}
describe('example', () => {
  it('should be 42', () => {
    expect(19 + 23).toBe(42, '19 + 23 is 42');
  });

  it('should be the same reference', () => {
    const ref = new Vec3();
    expect(ref).toBe(ref, 'Reference Equality');
  });

  it('should perform a memory comparison', () => {
    const a = new Vec3(1, 2, 3);
    const b = new Vec3(1, 2, 3);

    expect(a).toStrictEqual(
      b,
      'a and b have the same values, (discluding child references)',
    );
  });

  it('should compare strings', () => {
    expect('a=' + '200').toBe('a=200', 'both strings are equal');
  });

  it('should compare values', () => {
    expect(10).toBeLessThan(200);
    expect(1000).toBeGreaterThan(200);
    expect(1000).toBeGreaterThanOrEqual(1000);
    expect(1000).toBeLessThanOrEqual(1000);
  });

  it('can log some values to the console', () => {
    log('Hello world!'); // strings!
    log(3.1415); // floats!
    log(244); // integers!
    log(0xffffffff); // long values!
    log(new ArrayBuffer(50)); // bytes!
  });
});
