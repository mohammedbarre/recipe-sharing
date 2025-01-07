document.addEventListener('DOMContentLoaded', () => {
    // Dropdown Menu Logic
    const menuButton = document.getElementById('menuButton'); // The menu button
    const dropdownMenu = document.getElementById('dropdownMenu'); // The dropdown menu

    if (menuButton && dropdownMenu) {
        // Toggle the dropdown menu visibility when the button is clicked
        menuButton.addEventListener('click', () => {
            const isMenuVisible = dropdownMenu.style.display === 'block';
            dropdownMenu.style.display = isMenuVisible ? 'none' : 'block';
        });

        // Close the dropdown menu when clicking outside
        document.addEventListener('click', (event) => {
            if (!menuButton.contains(event.target) && !dropdownMenu.contains(event.target)) {
                dropdownMenu.style.display = 'none';
            }
        });
    } else {
        console.error('Menu button or dropdown menu element not found in the DOM.');
    }

    // Recipe Fetching Logic
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
            if (!response.ok) throw new Error('Failed to fetch recipes');

            const data = await response.json();
            return data.recipes || [];
        } catch (error) {
            console.error('Error fetching recipes:', error);
            throw error;
        }
    };

    // Utility function to render recipes
    const renderRecipes = (recipes, title = '') => {
        if (title) categoryTitle.textContent = title;
        recipeList.innerHTML = ''; // Clear previous content

        if (recipes.length > 0) {
            recipes.forEach(recipe => {
                const listItem = document.createElement('li');
                listItem.innerHTML = `
                    <h3>${recipe.name}</h3>
                    <img src="${recipe.thumbnail_url}" alt="${recipe.name}" style="width: 200px;">
                    <p>
                        <a href="/api/recipe-details/${recipe.id}">View Details</a>
                    </p>
                    <button class="save-recipe" data-id="${recipe.id}" data-name="${recipe.name}">
                        Save Recipe
                    </button>
                `;
                recipeList.appendChild(listItem);
            });

            // Attach event listeners to "Save Recipe" buttons
            attachSaveRecipeListeners();
        } else {
            recipeList.innerHTML = '<p>No recipes found for this search term or category.</p>';
        }
    };

    // Function to handle fetch and render
    const handleFetchAndRender = async (query, title = '') => {
        recipeList.innerHTML = '<div class="spinner"></div>'; // Show spinner

        try {
            const recipes = await fetchRecipes(query);
            renderRecipes(recipes, title);
        } catch (error) {
            recipeList.innerHTML = `<p>Error: ${error.message || 'Failed to load recipes. Please try again.'}</p>`;
        }
    };

    // Handle category click
    categories.forEach(category => {
        category.addEventListener('click', () => {
            const categoryName = category.dataset.category;
            handleFetchAndRender(categoryName, `${categoryName} Recipes`);

            // Show recipes section and hide categories
            recipesSection.style.display = 'block';
            categoriesSection.style.display = 'none';
        });
    });

    // Handle search form submission
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = searchForm.querySelector('input[name="q"]').value.trim();

        if (!query) {
            recipeList.innerHTML = '<p>Please enter a search term.</p>';
            return;
        }

        handleFetchAndRender(query);
    });

});
