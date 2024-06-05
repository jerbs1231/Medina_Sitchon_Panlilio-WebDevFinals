"use strict";

const api_key = "2a3c21f7203959050cb73bdefd2b2ae2";
const imageBaseURL = "http://image.tmdb.org/t/p/";

/*--------- 
Fetch data from a server using the 'url' and passes the result in JSON data to a 'callback' function, along with an optional parameter if has 'optionalParam'.
----------*/

document.addEventListener("DOMContentLoaded", () => {
  sendCommand('read', null, null);
  ws.onmessage = (msg) => {
    loadMovies(Object.values(JSON.parse(msg.data)));
  }

  const searchField = document.querySelector('[search-field]');
  searchField.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    if (query.length > 0) {
      fetchMovies(query);
    } else {
      sendCommand('read', null, null);
    }
  });
});

function loadMovies(movies) {
  const movieList = document.getElementById("save-movie-list");
  movieList.innerHTML = ''; // Clear existing movies
  console.log(movies);
  movies.forEach(movie => {
    const movieItem = document.createElement("div");
    const API_URL = `https://api.themoviedb.org/3/movie/${movie.id}?api_key=${api_key}&append_to_response=credits,images`;

    fetch(API_URL)
      .then(response => response.json())
      .then(movieDetails => {
        const posterPath = movieDetails.poster_path ? `${imageBaseURL}w342${movieDetails.poster_path}` : "";
        const eps = movieDetails.episodes ? movieDetails.episodes : 0;
        const s = movieDetails.seasons ? movieDetails.seasons : 0;
        console.log(movieDetails)
        movieItem.className = "movie-card";
        movieItem.innerHTML = `
          <figure class="poster-box card-banner">
            <img
              class="img-cover"
              src="${posterPath}"
              alt="${movie.title}"
              loading="lazy"
            />
          </figure>
          <div>
            <h4 class="title">${movie.title}</h4>
            <select id="episode-select-${movie.id}" class="episode-select" onchange="updateEpisode(${movie.id}, '${movie.title}', '${movie.poster_path}', this.value)">
              <option>Select Episodes</option>
              ${fetchEpisodes(eps)}
            </select>
            <select id="season-select-${movie.id}" class="season-select" onchange="updateSeason(${movie.id}, '${movie.title}', '${movie.poster_path}', this.value)">
              <option>Select Season</option>
              ${fetchSeason(s)}
            </select>
          </div>
          <div class="meta-list">
            <div class="meta-item">
              <button onclick="deleteMovie('${movie.title}', ${movie.id})" class="delete-btn">Delete</button>
            </div>
          </div>
        `;

        movieList.appendChild(movieItem);

      })
      .catch(error => console.error('Error fetching movie details:', error));
  });
}

function updateEpisode(movieId, title, poster_path, episode) {
  // Update episode data for the movie with movieId
  const season = document.getElementById('season-select-' + movieId).value;
  sendCommand("update", movieId, { id: movieId, title, poster_path, episode, season });
}

function updateSeason(movieId, title, poster_path, season) {
  // Update season data for the movie with movieId
  const episode = document.getElementById('episode-select-' + movieId).value;
  sendCommand("update", movieId, { id: movieId, title, poster_path, season, episode });
}

// Other functions remain unchanged

function fetchEpisodes(num) {
  let q = '';
  if (!num) {
    return `<option>No episode</option>`;
  }
  for (let i = 0; i < num; ++i) {
    q += `<option>Episode ${i}</option>`;
  }
  return q;
}

function fetchSeason(num) {
  let q = '';
  if (!num) {
    return `<option value="">No season</option>`;
  }
  for (let i = 0; i < num; ++i) {
    q += `<option value="${i}">Season ${i}</option>`;
  }
  return q;
}

function deleteMovie(title, id) {
  const confirmDeletion = confirm(`Are you sure do you want to remove the movie ${title} in the list?`);
  if (confirmDeletion) {
    sendCommand("delete", id);
    sendCommand('read', null, null);
  }
}
