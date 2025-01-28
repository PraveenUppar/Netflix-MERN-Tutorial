import { User } from "../models/user.model.js";
import { fetchFromTMDB } from "../services/tmdb.service.js";

// This function helps search for famous people (like actors or directors) using an online movie database.
// It also keeps track of what you searched for in your history.
export async function searchPerson(req, res) {
  // Get the name of the person you want to search for from the request.
  const { query } = req.params;
  try {
    // Use the online movie database (TMDB) to search for the person.
    const response = await fetchFromTMDB(
      `https://api.themoviedb.org/3/search/person?query=${query}&include_adult=false&language=en-US&page=1`
    );
    // Check if no one was found with that name.
    if (response.results.length === 0) {
      // If no one is found, send back a "not found" message (status 404).
      return res.status(404).send(null);
    }
    // If someone is found, save the first result in the user's search history.
    await User.findByIdAndUpdate(req.user._id, {
      $push: {
        searchHistory: {
          id: response.results[0].id, // The unique ID of the person from TMDB.
          image: response.results[0].profile_path, // The picture of the person (if available).
          title: response.results[0].name, // The person's name.
          searchType: "person", // Tells us that this search is about a person.
          createdAt: new Date(), // The date and time when you searched.
        },
      },
    });
    // Send back a success message along with the search results.
    res.status(200).json({ success: true, content: response.results });
  } catch (error) {
    // If something goes wrong, show an error in the console.
    console.log("Error in searchPerson controller: ", error.message);
    // Tell the user something went wrong by sending an error message.
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}

export async function searchMovie(req, res) {
  const { query } = req.params;

  try {
    const response = await fetchFromTMDB(
      `https://api.themoviedb.org/3/search/movie?query=${query}&include_adult=false&language=en-US&page=1`
    );

    if (response.results.length === 0) {
      return res.status(404).send(null);
    }

    await User.findByIdAndUpdate(req.user._id, {
      $push: {
        searchHistory: {
          id: response.results[0].id,
          image: response.results[0].poster_path,
          title: response.results[0].title,
          searchType: "movie",
          createdAt: new Date(),
        },
      },
    });
    res.status(200).json({ success: true, content: response.results });
  } catch (error) {
    console.log("Error in searchMovie controller: ", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}

export async function searchTv(req, res) {
  const { query } = req.params;

  try {
    const response = await fetchFromTMDB(
      `https://api.themoviedb.org/3/search/tv?query=${query}&include_adult=false&language=en-US&page=1`
    );

    if (response.results.length === 0) {
      return res.status(404).send(null);
    }

    await User.findByIdAndUpdate(req.user._id, {
      $push: {
        searchHistory: {
          id: response.results[0].id,
          image: response.results[0].poster_path,
          title: response.results[0].name,
          searchType: "tv",
          createdAt: new Date(),
        },
      },
    });
    res.json({ success: true, content: response.results });
  } catch (error) {
    console.log("Error in searchTv controller: ", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}

export async function getSearchHistory(req, res) {
  try {
    res.status(200).json({ success: true, content: req.user.searchHistory });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}

export async function removeItemFromSearchHistory(req, res) {
  let { id } = req.params;

  id = parseInt(id);

  try {
    await User.findByIdAndUpdate(req.user._id, {
      $pull: {
        searchHistory: { id: id },
      },
    });

    res
      .status(200)
      .json({ success: true, message: "Item removed from search history" });
  } catch (error) {
    console.log(
      "Error in removeItemFromSearchHistory controller: ",
      error.message
    );
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}
