const Movie = require('../models/movie');

const BadRequest = require('../utils/BadRequest'); // 400
const NotFound = require('../utils/NotFound'); // 404
const Forbidden = require('../utils/Forbidden'); // 403

const getMovies = async (req, res, next) => {
  try {
    const movies = await Movie.find({ owner: req.user._id });
    res.send(movies);
  } catch (error) {
    next(error);
  }
};

const addMovie = async (req, res, next) => {
  try {
    const {
      country,
      director,
      duration,
      year,
      description,
      image,
      trailerLink,
      nameRU,
      nameEN,
      thumbnail,
      movieId,
    } = req.body;
    res.status(201).send(await Movie.create({
      country,
      director,
      duration,
      year,
      description,
      image,
      trailerLink,
      nameRU,
      nameEN,
      thumbnail,
      movieId,
      owner: req.user._id,
    }));
  } catch (error) {
    if (error.name === 'ValidationError') {
      next(new BadRequest('Переданы некорректные данные при создании фильма'));
    } else {
      next(error);
    }
  }
};

const deleteMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.movieId);
    if (!movie) {
      throw new NotFound('Отсутствует данный фильм');
    } else if (!movie.owner.equals(req.user._id)) {
      throw new Forbidden('Запрещено удалять чужой фильм');
    } else {
      const movieId = await Movie.deleteOne(movie);
      res.send({ movieId, message: 'Фильм удален' });
    }
  } catch (error) {
    if (error.name === 'CastError') {
      next(new BadRequest('Неверный id фильма'));
    } else {
      next(error);
    }
  }
};

module.exports = {
  getMovies,
  addMovie,
  deleteMovie,
};
