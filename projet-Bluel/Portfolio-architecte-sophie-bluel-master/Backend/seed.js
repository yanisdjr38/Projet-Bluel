const bcrypt = require('bcrypt');
const db = require('./models');

function publicUrl() {
  if (process.env.RAILWAY_PUBLIC_DOMAIN) {
    return `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`;
  }
  return `http://localhost:${process.env.PORT || 5678}`;
}

const WORKS = [
  { title: 'Villa Fernèze', category: 'Appartements', image: 'villa-ferneze.png' },
  { title: 'La Balisière', category: 'Appartements', image: 'la-balisiere.png' },
  { title: 'Le Coteau Cassis', category: 'Appartements', image: 'le-coteau-cassis.png' },
  { title: 'Appartement Paris V', category: 'Appartements', image: 'appartement-paris-v.png' },
  { title: 'Appartement Paris X', category: 'Appartements', image: 'appartement-paris-x.png' },
  { title: 'Appartement Paris XVIII', category: 'Appartements', image: 'appartement-paris-xviii.png' },
  { title: 'Bar Lullaby Paris', category: 'Hotels & restaurants', image: 'bar-lullaby-paris.png' },
  { title: 'Hotel First Arte New Delhi', category: 'Hotels & restaurants', image: 'hotel-first-arte-new-delhi.png' },
  { title: 'Restaurant Sushisen Londres', category: 'Hotels & restaurants', image: 'restaurant-sushisen-londres.png' },
  { title: 'Abat-jour Tahina', category: 'Objets', image: 'abajour-tahina.png' },
  { title: 'Structures Thermopolis', category: 'Objets', image: 'structures-thermopolis.png' },
];

module.exports = async function seed() {
  const categoryNames = ['Objets', 'Appartements', 'Hotels & restaurants'];
  const categoriesByName = {};
  for (const name of categoryNames) {
    const [category] = await db.categories.findOrCreate({ where: { name } });
    categoriesByName[name] = category;
  }

  const testEmail = 'sophie.bluel@test.tld';
  let user = await db.users.findOne({ where: { email: testEmail } });
  if (!user) {
    const hash = await bcrypt.hash('S0phie', 10);
    user = await db.users.create({ email: testEmail, password: hash });
  }

  const existingWorksCount = await db.works.count();
  if (existingWorksCount === 0) {
    const base = publicUrl();
    for (const work of WORKS) {
      await db.works.create({
        title: work.title,
        imageUrl: `${base}/images/${work.image}`,
        categoryId: categoriesByName[work.category].id,
        userId: user.id,
      });
    }
  }
};
