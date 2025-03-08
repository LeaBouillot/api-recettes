const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

// Définir la racine de l'API
server.use(jsonServer.rewriter({
    '/api/*': '/$1',
    '/recipes/all': '/recipes',
    '/recipes/:category': '/recipes?category=:category',
    '/recipes': '/recipes' // This line is added to fix the issue
  }));

// Configurer CORS pour permettre les requêtes de n'importe quel domaine
server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  
  // Gérer les requêtes OPTIONS préliminaires
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// Utiliser les middlewares par défaut (logger, static, cors et no-cache)
server.use(middlewares);

// Pour les requêtes POST et PUT, convertir le corps de la requête en JSON
server.use(jsonServer.bodyParser);

// Ajouter un middleware personnalisé avant le routeur
server.use((req, res, next) => {
  if (req.method === 'POST') {
    // Pour les nouvelles recettes, générer un ID si non fourni
    req.body.createdAt = Date.now();
  }
  next();
});

// Utiliser le routeur
server.use(router);

// Démarrer le serveur si exécuté directement (pour les tests locaux)
if (require.main === module) {
  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log(`JSON Server is running on port ${port}`);
  });
}

// Exporter le serveur pour Vercel
module.exports = server;