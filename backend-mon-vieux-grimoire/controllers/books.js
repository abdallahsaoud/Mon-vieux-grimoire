const Book = require("../models/book");
const fs = require("fs");

exports.getAllBook = (req, res, next) => {
  Book.find()
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};

exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => res.status(200).json(book))
    .catch((error) => res.status(404).json({ error }));
};

exports.getBestrating = (req, res, next) => {
    Book.find().sort({ averageRating: -1 }).limit(3)
        .then(books => {
            res.status(200).json(books);
        })
        .catch(error => {
            res.status(500).json({ error: error.message });
        });
};

exports.postNewBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;
  delete bookObject._userId;
  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
  });

  book
    .save()
    .then(() => {
      res.status(201).json({ message: "Objet enregistré !" });
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.modifyBook = (req, res, next) => {
  const bookObject = req.file
    ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };

  delete bookObject._userId;
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: "Not authorized" });
      } else {
        Book.updateOne(
          { _id: req.params.id },
          { ...bookObject, _id: req.params.id }
        )
          .then(() => res.status(200).json({ message: "livre modifié!" }))
          .catch((error) => res.status(401).json({ error }));
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: "Not authorized" });
      } else {
        const filename = book.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
          Book.deleteOne({ _id: req.params.id })
            .then(() => {
              res.status(200).json({ message: "Objet supprimé !" });
            })
            .catch((error) => res.status(401).json({ error }));
        });
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

exports.ratingBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (!book) {
        res.status(404).json({ error: "Livre non trouvé." });
      }
      // Vérifiez si le livre a déjà été noté par cet utilisateur
      const existingRating = book.ratings.find(
        (rating) => rating.userId === req.auth.userId
      );
      if (existingRating) {
        return res.status(400).json({ error: "Vous avez déjà noté ce livre." });
      }

      // Ajoutez la notation au livre
      book.ratings.push({
        userId: req.auth.userId,
        grade: req.body.rating,
      });


      // calcul de la note moyenne du livre
      const totalRatings = book.ratings.length;
      const totalGrade = book.ratings.reduce(
        (acc, rating) => acc + rating.grade,
        0
      );
      book.averageRating = totalGrade / totalRatings;

      // Enregistrez les modifications du livre
      book.save()
      .then(res.status(200).json(book))
      .catch((error) => {
        res.status(400).json({ error });
      });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ error: "Erreur interne du serveur." });
    });
};
