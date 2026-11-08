const bcrypt = require('bcrypt');
const db = require('./models');

module.exports = async function seed() {
  const categories = ['Objets', 'Appartements', 'Hotels & restaurants'];
  for (const name of categories) {
    await db.categories.findOrCreate({ where: { name } });
  }

  const testEmail = 'sophie.bluel@test.tld';
  const existing = await db.users.findOne({ where: { email: testEmail } });
  if (!existing) {
    const hash = await bcrypt.hash('S0phie', 10);
    await db.users.create({ email: testEmail, password: hash });
  }
};
