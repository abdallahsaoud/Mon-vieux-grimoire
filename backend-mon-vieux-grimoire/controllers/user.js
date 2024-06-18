const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const JWT_SECRET = process.env.JWT_SECRET;
const User = require('../models/user')
const jwt = require('jsonwebtoken');

exports.signup = (req, res, next) => {
    bcrypt.hash(req.body.password, 10)
      .then(hash => {
        const user = new User({
          email: req.body.email,
          password: hash
        });
        user.save()
          .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
          .catch(error => {
            console.log("Erreur lors de l'enregistrement de l'utilisateur :", error); 
            res.status(400).json({ error });
          });
      })
      .catch(error => {
        console.log("Erreur lors du hachage du mot de passe :", error); 
        res.status(500).json({ error });
      });
  };

  exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
                return res.status(401).json({ error: 'Utilisateur non trouvé !' });
            }
            bcrypt.compare(req.body.password, user.password, (err, result) => {
                if (err) {
                    return res.status(500).json({ error: err });
                }
                if (!result) {
                    return res.status(401).json({ error: 'Mot de passe incorrect !' });
                }
                res.status(200).json({
                    userId: user._id,
                    token: jwt.sign(
                        { userId: user._id },
                        JWT_SECRET,
                        { expiresIn: '24h' }
                    )
                });
            });
        })
        .catch(error => res.status(500).json({ error: error.message }));
};
