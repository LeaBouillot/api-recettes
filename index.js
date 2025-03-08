const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors'); // Importation du module CORS
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware pour parser les requêtes en JSON
app.use(express.json());

// Configuration de CORS pour autoriser plusieurs origines
const allowedOrigins = ['http://localhost:5173', 'https://recipify-mu.vercel.app'];
app.use(cors({
    origin: function (origin, callback) {
        // Autoriser les requêtes sans origine (comme les requêtes internes)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1) {
            return callback(null, true);
        } else {
            return callback(new Error('Not allowed by CORS'));
        }
    }
}));

// Chemin absolu vers le fichier db.json
const dbFilePath = path.join(__dirname, 'db.json');

// Route de base
app.get('/', (req, res) => {
    res.send('Bienvenue à l\'API de recettes de cuisine!');
});

// Route pour récupérer les recettes
app.get('/recettes', (req, res) => {
    fs.readFile(dbFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Erreur de lecture du fichier' });
        }
        res.json(JSON.parse(data));
    });
});

// Nouvelle route pour la recherche NON FONCTIONNELLE
app.get('/search', (req, res) => {
    try {
        const query = req.query.query ? req.query.query.toLowerCase() : '';
        
        if (!query) {
            return res.status(400).json({ error: 'Paramètre de recherche manquant' });
        }

        fs.readFile(dbFilePath, 'utf8', (err, data) => {
            if (err) {
                console.error('Erreur de lecture du fichier:', err);
                return res.status(500).json({ error: 'Erreur de lecture du fichier' });
            }

            let recettes;
            try {
                recettes = JSON.parse(data);
            } catch (jsonError) {
                console.error('Erreur de parsing JSON:', jsonError);
                return res.status(500).json({ error: 'Erreur de parsing JSON' });
            }

            const resultats = recettes.filter(recette => 
                recette.name.toLowerCase().includes(query) ||
                recette.ingrédients.some(ingredient => ingredient.toLowerCase().includes(query))
            );

            res.json(resultats);
        });
    } catch (error) {
        console.error('Erreur inattendue:', error);
        res.status(500).json({ error: 'Erreur serveur inattendue' });
    }
});

// Nouvelle route POST pour ajouter une recette
app.post('/recettes', (req, res) => {
    const nouvelleRecette = req.body;

    if (!nouvelleRecette.name || !nouvelleRecette.ingrédients) {
        return res.status(400).json({ error: 'Les champs "name" et "ingrédients" sont requis' });
    }

    fs.readFile(dbFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Erreur de lecture du fichier:', err);
            return res.status(500).json({ error: 'Erreur de lecture du fichier' });
        }

        let recettes;
        try {
            recettes = JSON.parse(data);
        } catch (jsonError) {
            console.error('Erreur de parsing JSON:', jsonError);
            return res.status(500).json({ error: 'Erreur de parsing JSON' });
        }

        recettes.push(nouvelleRecette);

        fs.writeFile(dbFilePath, JSON.stringify(recettes, null, 2), 'utf8', (writeErr) => {
            if (writeErr) {
                console.error('Erreur d\'écriture dans le fichier:', writeErr);
                return res.status(500).json({ error: 'Erreur d\'écriture dans le fichier' });
            }

            res.status(201).json(nouvelleRecette);
        });
    });
});

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
