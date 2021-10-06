import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import bookmarksView from './views/bookmarksView.js';
import paginationView from './views/paginationView.js';
import addRecipeView from './views/addRecipeView.js';

// import regeneratorRuntime from "regenerator-runtime";
import 'core-js/stable';
import 'regenerator-runtime/runtime';

// https://forkify-api.herokuapp.com/v2

// if (module.hot) {
//   module.hot.accept();
// }

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);
    if (!id) return;
    // let id = window.location.hash.slice(1);
    // if (!id) id = '5ed6604591c37cdc054bcc3e';

    recipeView.renderSpinner();

    //  0. NOTE: Update results view to mark selected search result
    resultsView.update(model.getSearchResultsPage());

    // 1. NOTE: Updating bookmarks view
    bookmarksView.update(model.state.bookmarks);

    // 2.NOTE: Loading Recipe
    await model.loadRecipe(id);
    const { recipe } = model.state;

    // 3. NOTE: Rendering the obtained recipe
    recipeView.render(model.state.recipe);


  } catch (err) {
    recipeView.renderError();
  }

};

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();
    // NOTE: 1) Get Search Query
    const query = searchView.getQuery();
    // if (!query) return;

    // NOTE: 2) Load Search Results
    await model.loadSearchResults(query);

    // 3)Render results
    resultsView.render(model.getSearchResultsPage(1));

    // 4) Render Initial Pagination Function
    paginationView.render(model.state.search);

  } catch (err) {
    console.log(err);
  };
};

const controlPagination = function (goToPage) {
  // Render New Results
  resultsView.render(model.getSearchResultsPage(goToPage));
  // Render New Pagination buttons
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  // Update the recipe servings 
  model.updateServings(newServings);
  // Update the active view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);

};

const controlAddBookmark = function () {
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else if (model.state.recipe.bookmarked) model.deleteBookmark(model.state.recipe.id);
  // console.log(model.state.recipe);
  recipeView.update(model.state.recipe);

  bookmarksView.render(model.state.bookmarks);
}

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
}

const controlAddRecipe = async function (newRecipe) {
  // console.log(newRecipe);
  try {
    addRecipeView.renderSpinner();
    await model.uploadRecipe(newRecipe);

    recipeView.render(model.state.recipe);

    addRecipeView.renderMessage();
    bookmarksView.render(model.state.bookmarks);

    // Change ID in the URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);
    // window.history.back

    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    addRecipeView.renderError(err.message);
  }


}

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);

};

init();
