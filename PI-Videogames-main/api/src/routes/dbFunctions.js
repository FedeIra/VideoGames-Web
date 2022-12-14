const { Genre, Videogame } = require('../db');
const { Op } = require('sequelize');

// Get all videogames from db:
const getVideogamesDb = async () => {
  const videogames = await Videogame.findAll({
    attributes: {
      exclude: ['description'],
    },
    include: {
      model: Genre,
      attributes: ['name'],
      through: {
        attributes: [],
      },
    },
  });
  const finalVideogames = videogames.map((game) => {
    return {
      id: game.id,
      image: game.image,
      name: game.name,
      genre: game.genres.map((g) => g.name).join(', '),
      createdByUser: game.createdByUser,
      rating: game.rating,
      platforms: game.platforms,
      released: game.released,
    };
  });
  return finalVideogames;
};

// Get videogames from db by ID:
const getVideogamesByIdDb = async (id) => {
  let videogame = await Videogame.findByPk(id, {
    attributes: {
      exclude: ['createdByUser'],
    },
    include: {
      model: Genre,
      attributes: ['name'],
    },
  });
  videogame = {
    id: videogame.id,
    image: videogame.image,
    name: videogame.name,
    genre: videogame.genres.map((g) => g.name).join(', '),
    description: videogame.description,
    released: videogame.released,
    rating: videogame.rating,
    platforms: videogame.platforms,
  };
  return videogame;
};

// Get videogames from db by name through query:
const getVideogamesByNameDb = async (name) => {
  const videogames = await Videogame.findAll({
    where: {
      // for case insensitive search:
      name: {
        [Op.iLike]: `%${name}%`,
      },
    },
    attributes: {
      exclude: [
        'createdByUser',
        'released',
        'platforms',
        'description',
        'rating',
      ],
    },
    include: {
      model: Genre,
      attributes: ['name'],
      through: {
        attributes: [],
      },
    },
  });
  const finalVideogames = videogames.map((game) => {
    return {
      id: game.id,
      image: game.image,
      name: game.name,
      genre: game.genres.map((g) => g.name).join(', '),
    };
  });
  return finalVideogames;
};

module.exports = {
  getVideogamesDb,
  getVideogamesByIdDb,
  getVideogamesByNameDb,
};
