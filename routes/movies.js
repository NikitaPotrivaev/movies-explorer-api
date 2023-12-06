const movieRouter = require('express').Router();

const { getMovies, addMovie, deleteMovie } = require('../controllers/movies');
const { validateAddMovie, validateMovieId } = require('../middlewares/validation');

movieRouter.get('/', getMovies);
movieRouter.post('/', validateAddMovie, addMovie);
movieRouter.delete('/:movieId', validateMovieId, deleteMovie);

module.exports = {
  movieRouter,
};
