document.addEventListener('DOMContentLoaded', () => {
    const menuButton = document.getElementById('menuButton'); // The menu button
    const dropdownMenu = document.getElementById('dropdownMenu'); // The dropdown menu

    // Dropdown Menu Logic
    if (menuButton && dropdownMenu) {
        menuButton.addEventListener('click', () => {
            dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
        });

        document.addEventListener('click', (event) => {
            if (!menuButton.contains(event.target) && !dropdownMenu.contains(event.target)) {
                dropdownMenu.style.display = 'none';
            }
        });
    } else {
        console.error('Menu button or dropdown menu not found.');
    }

    const categories = document.querySelectorAll('.category');
    const recipesSection = document.getElementById('recipes-section');
    const recipeList = document.getElementById('recipe-list');
    const categoryTitle = document.getElementById('category-title');
    const searchForm = document.getElementById('search-form');
    const categoriesSection = document.getElementById('categories');

    // Utility function to fetch recipes
    const fetchRecipes = async (query) => {
        try {
            const response = await fetch(`/api/search-recipes?q=${encodeURIComponent(query)}`);
            if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`);

            const data = await response.json();
            if (!data.results || !Array.isArray(data.results)) {
                throw new Error('Invalid API response format.');
            }

            return data.results;
        } catch (error) {
            console.error('Error fetching recipes:', error);
            throw error;
        }
    };

    // Utility function to render recipes
    const renderRecipes = (recipes, title = '') => {
        if (title) categoryTitle.textContent = title;
        recipeList.innerHTML = '';

        if (recipes.length > 0) {
            recipes.forEach((recipe) => {
                const listItem = document.createElement('li');
                listItem.innerHTML = `
                    <h3>${recipe.name || 'Unknown Recipe'}</h3>
                    <img src="${recipe.thumbnail_url || ''}" alt="${recipe.name}" style="width: 200px;">
                    <p>
                        <a href="/api/recipe-details/${recipe.id}">View Details</a>
                    </p>
                    <button class="save-recipe" data-id="${recipe.id}" data-name="${recipe.name}">
                        Save Recipe
                    </button>
                `;
                recipeList.appendChild(listItem);
            });
            attachSaveRecipeListeners();
        } else {
            recipeList.innerHTML = '<p>No recipes found for this search term or category.</p>';
        }
    };

    // Fetch and render recipes
    const handleFetchAndRender = async (query, title = '') => {
        recipeList.innerHTML = '<div class="spinner">Loading...</div>';

        try {
            const recipes = await fetchRecipes(query);
            renderRecipes(recipes, title);
        } catch (error) {
            recipeList.innerHTML = `<p>Error: ${error.message}</p>`;
        }
    };

    // Handle category click
    categories.forEach((category) => {
        category.addEventListener('click', () => {
            const categoryName = category.dataset.category;
            handleFetchAndRender(categoryName, `${categoryName} Recipes`);

            recipesSection.style.display = 'block';
            categoriesSection.style.display = 'none';
        });
    });

    // Handle search form submission
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const query = searchForm.querySelector('input[name="q"]').value.trim();

            if (!query) {
                recipeList.innerHTML = '<p>Please enter a search term.</p>';
                return;
            }

            handleFetchAndRender(query);
        });
    } else {
        console.error('Search form not found in the DOM.');
    }

    // Attach "Save Recipe" button listeners
    const attachSaveRecipeListeners = () => {
        document.querySelectorAll('.save-recipe').forEach((button) => {
            button.addEventListener('click', async () => {
                const recipeId = button.dataset.id;
                const recipeName = button.dataset.name;

                try {
                    const response = await fetch('/save-recipe', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ recipeId, recipeName }),
                    });

                    if (response.redirected) {
                        window.location.href = response.url;
                    } else {
                        const result = await response.json();
                        if (result.success) {
                            alert('Recipe saved successfully!');
                        } else {
                            alert('Failed to save recipe.');
                        }
                    }
                } catch (error) {
                    console.error('Error saving recipe:', error);
                    alert('An error occurred. Please try again.');
                }
            });
        });
    };
});
