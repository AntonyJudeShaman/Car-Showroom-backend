describe('Environment Variables', () => {
  test('MONGODB_URI', () => {
    expect(process.env.MONGODB_URI).toBeDefined();
    expect(process.env.MONGODB_URI).not.toBe('');
    expect(process.env.MONGODB_URI).toMatch(/^mongodb\+srv:\/\//);
  });

  test('JWT_SECRET', () => {
    expect(process.env.JWT_SECRET).toBeDefined();
    expect(process.env.JWT_SECRET).not.toBe('');
  });

  test('JWT_TOKEN', () => {
    expect(process.env.JWT_TOKEN).toBeDefined();
    expect(process.env.JWT_TOKEN).not.toBe('');
  });

  test('EMAIL_PASSWORD', () => {
    expect(process.env.EMAIL_PASSWORD).toBeDefined();
    expect(process.env.EMAIL_PASSWORD).not.toBe('');
  });

  test('EMAILJS_PUBLIC_KEY', () => {
    expect(process.env.EMAILJS_PUBLIC_KEY).toBeDefined();
    expect(process.env.EMAILJS_PUBLIC_KEY).not.toBe('');
  });

  test('EMAILJS_SERVICE_ID', () => {
    expect(process.env.EMAILJS_SERVICE_ID).toBeDefined();
    expect(process.env.EMAILJS_SERVICE_ID).not.toBe('');
  });

  test('EMAILJS_TEMPLATE_ID', () => {
    expect(process.env.EMAILJS_TEMPLATE_ID).toBeDefined();
    expect(process.env.EMAILJS_TEMPLATE_ID).not.toBe('');
  });

  test('EMAILJS_PRIVATE_KEY', () => {
    expect(process.env.EMAILJS_PRIVATE_KEY).toBeDefined();
    expect(process.env.EMAILJS_PRIVATE_KEY).not.toBe('');
  });

  test('API_URL', () => {
    expect(process.env.API_URL).toBeDefined();
    expect(process.env.API_URL).not.toBe('');
  });
});
