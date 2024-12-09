document.addEventListener('DOMContentLoaded', () => {
    const categories = document.querySelectorAll('.category');
    const recipesSection = document.getElementById('recipes-section');
    const recipeList = document.getElementById('recipe-list');
    const categoryTitle = document.getElementById('category-title');
    const searchForm = document.getElementById('search-form');

    // Handle category click
    categories.forEach(category => {
        category.addEventListener('click', async () => {
            const categoryName = category.dataset.category;
            categoryTitle.textContent = `${categoryName} Recipes`;
            
            // Show loading
            recipeList.innerHTML = 'Loading...';

            try {
                // Fetch recipes for the selected category
                const response = await fetch(`/api/search-recipes?q=${categoryName}`);
                const data = await response.json();

                // Populate recipe list
                recipeList.innerHTML = '';
                if (data.recipes && data.recipes.length > 0) {
                    data.recipes.forEach(recipe => {
                        const listItem = document.createElement('li');
                        listItem.innerHTML = `
                            <h3>${recipe.name}</h3>
                            <img src="${recipe.thumbnail_url}" alt="${recipe.name}" style="width: 200px;">
                            <p>
                                <a href="/api/recipe-details/${recipe.id}">View Details</a>
                            </p>
                        `;
                        recipeList.appendChild(listItem);
                    });
                } else {
                    recipeList.innerHTML = '<p>No recipes found for this category.</p>';
                }

                // Show recipe section and hide categories
                recipesSection.style.display = 'block';
                document.getElementById('categories').style.display = 'none';
            } catch (error) {
                console.error('Error fetching recipes:', error);
                recipeList.innerHTML = '<p>Failed to load recipes. Please try again later.</p>';
            }
        });
    });

    // Search within the category
    searchForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const query = searchForm.querySelector('input[name="q"]').value;

        // Show loading
        recipeList.innerHTML = 'Searching...';

        try {
            const response = await fetch(`/api/search-recipes?q=${query}`);
            const data = await response.json();

            // Populate recipe list
            recipeList.innerHTML = '';
            if (data.recipes && data.recipes.length > 0) {
                data.recipes.forEach(recipe => {
                    const listItem = document.createElement('li');
                    listItem.innerHTML = `
                        <h3>${recipe.name}</h3>
                        <img src="${recipe.thumbnail_url}" alt="${recipe.name}" style="width: 200px;">
                        <p>
                            <a href="/api/recipe-details/${recipe.id}">View Details</a>
                        </p>
                    `;
                    recipeList.appendChild(listItem);
                });
            } else {
                recipeList.innerHTML = '<p>No recipes found for this search term.</p>';
            }
        } catch (error) {
            console.error('Error fetching recipes:', error);
            recipeList.innerHTML = '<p>Failed to load recipes. Please try again later.</p>';
        }
    });
});
