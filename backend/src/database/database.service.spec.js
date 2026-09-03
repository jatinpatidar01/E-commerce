const { getPgSslConfig } = require('./database.service');

describe('getPgSslConfig', () => {
  it('disables SSL for local PostgreSQL URLs', () => {
    const url = 'postgresql://postgres:jatin@123@localhost:5432/neondb';

    expect(getPgSslConfig(url)).toBe(false);
  });

  it('enables SSL when the connection string explicitly requires it', () => {
    const url = 'postgresql://neondb_owner:secret@ep-abc-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require';

    expect(getPgSslConfig(url)).toEqual({ rejectUnauthorized: false });
  });
});
