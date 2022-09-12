const { Op, Genre, Videogame } = require('../db');

// Get all videogames from db:
const getVideogamesDb = async () => {
  const videogames = await Videogame.findAll({
    include: {
      model: Genre, // to include genre.name from model genre
      attributes: ['name'],
      through: {
        attributes: [],
      },
    },
  });
  return videogames;
};

// Get videogames from db by ID:
const getVideogamesByIdDb = async (id) => {
  const videogame = await Videogame.findByPk(id, {
    include: {
      model: Genre,
      attributes: ['name'],
      through: {
        attributes: [],
      },
    },
  });
  return videogame;
};

module.exports = {
  getVideogamesDb,
  getVideogamesByIdDb,
};