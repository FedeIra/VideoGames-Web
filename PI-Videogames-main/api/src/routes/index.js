// SERVER: http://localhost:3001
const { Router } = require('express');
const router = Router();
const { Videogame, Genre } = require('../db.js');

// Import functions from apiFunctions and dbFunctions:
const {
  getVideogamesApi,
  getVideogamesByNameApi,
  getVideogamesByIdApi,
  getGenresApi,
  getPlatformsApi, // TODO: CHEQUEAR
} = require('./apiFunctions');

const {
  getVideogamesDb,
  getVideogamesByIdDb,
  getVideogamesByNameDb,
} = require('./dbFunctions');

// GET GENRES FROM DB (IF NO GENRES, GET THEM FROM API AND SAVE IT TO DB):
router.get('/videogames/genres', async (req, res) => {
  const genres = await Genre.findAll();
  if (genres.length) {
    return res.json(genres.map((g) => g.name));
  } else {
    try {
      const genresApi = await getGenresApi();
      return res.json(genresApi);
    } catch (error) {
      return res.status(404).send(error);
    }
  }
});

//GET PLATFORMS FROM API:
router.get('/videogames/platforms', async (req, res) => {
  try {
    const platforms = await getPlatformsApi();
    return res.json(platforms);
  } catch (error) {
    return res.status(404).send(error);
  }
});

// GET VIDEOGAME BY ID:
router.get('/videogames/:id', async (req, res) => {
  const { id } = req.params;

  if (!Number(id)) {
    try {
      const videogame = await getVideogamesByIdDb(id);
      return res.json(videogame);
    } catch (error) {
      return res.status(404).send(error);
    }
  } else {
    try {
      const videogame = await getVideogamesByIdApi(id);
      return res.json(videogame);
    } catch (error) {
      return res.status(404).send(error);
    }
  }
});

// GET ALL VIDEOGAMES OR BY NAME:
router.get('/videogames', async (req, res) => {
  const { search } = req.query;

  try {
    if (search) {
      const videogamesDB = await getVideogamesByNameDb(search);

      let videogamesAPI = await getVideogamesByNameApi(search);

      if (videogamesDB.length + videogamesAPI.length > 15) {
        videogamesAPI = videogamesAPI.slice(0, 15 - videogamesDB.length); // If there are more than 15 videogames, slice API results.
      }
      const videogames = [...videogamesDB, ...videogamesAPI];
      res.json(videogames);
    } else {
      const videogamesBS = await getVideogamesDb();
      const videogamesAPI = await getVideogamesApi();

      const videogames = [...videogamesAPI, ...videogamesBS];
      res.json(videogames);
    }
  } catch (error) {
    res.status(404).send(error);
  }
});

// POST VIDEOGAME:
router.post('/videogames', async (req, res) => {
  const {
    name,
    description,
    released,
    rating,
    platforms,
    image,
    createdByUser,
    genre,
  } = req.body;

  try {
    let newVideogame = await Videogame.create({
      name,
      description,
      released,
      rating,
      platforms,
      image,
      createdByUser,
    });

    let genreDB = await Genre.findAll({
      where: {
        name: genre,
      },
    });

    newVideogame.addGenres(genreDB);
    res.send(newVideogame);
  } catch (error) {
    res.status(404).send('incorrect data');
  }
});

// DELETE VIDEOGAME:
router.delete('/videogames/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await Videogame.destroy({ where: { id: id } });
    res.send(id);
  } catch (err) {
    res.status(400).send(err);
  }
});

//TODO: CHEQUEAR
// UPDATE VIDEOGAME:
// router.put('/videogames/edit/:id', updateGameDB);

router.put('/videogames/edit', async (req, res) => {
  try {
    const { id, name, description, released, rating, platforms, genre, image } =
      req.body;

    await Videogame.update(
      {
        name,
        description,
        released,
        rating,
        platforms,
        image,
      },
      {
        where: { id: id },
      }
    );

    if (genre) {
      const game = await Videogame.findByPk(id);
      const genresMatched = await Genre.findAll({
        where: {
          name: genre,
        },
      });
      await game.setGenres(genresMatched);
    }
    const videogame = await Videogame.findByPk(id, {
      include: {
        model: Genre,
        attributes: ['name'],
        through: {
          attributes: [],
        },
      },
    });
    res.json(videogame);
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
