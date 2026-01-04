// Recipe Book Application
class RecipeBook {
    constructor() {
        this.recipes = this.loadRecipes();
        this.currentImageData = null;
        this.initializeEventListeners();
        this.displayRecipes();
    }

    loadRecipes() {
        try {
            const stored = localStorage.getItem('recipeBook');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading recipes:', error);
            return [];
        }
    }

    saveRecipes() {
        try {
            localStorage.setItem('recipeBook', JSON.stringify(this.recipes));
            return true;
        } catch (error) {
            console.error('Error saving recipes:', error);
            this.showNotification('Error saving recipe. Storage might be full.', 'error');
            return false;
        }
    }

    initializeEventListeners() {
        document.getElementById('addRecipeBtn').addEventListener('click', () => {
            this.showForm();
        });

        document.getElementById('viewAllBtn').addEventListener('click', () => {
            this.hideForm();
            this.displayRecipes();
        });

        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.hideForm();
            this.clearForm();
        });

        document.getElementById('recipeForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addRecipe();
        });

        document.getElementById('recipeImage').addEventListener('change', (e) => {
            this.handleImageUpload(e);
        });

        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.searchRecipes(e.target.value);
        });

        document.getElementById('modalClose').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('recipeModal').addEventListener('click', (e) => {
            if (e.target.id === 'recipeModal') this.closeModal();
        });
    }

    showForm() {
        document.getElementById('formSection').classList.add('active');
        document.getElementById('recipesSection').style.display = 'none';
        document.getElementById('recipeName').focus();
    }

    hideForm() {
        document.getElementById('formSection').classList.remove('active');
        document.getElementById('recipesSection').style.display = 'block';
    }

    handleImageUpload(event) {
        const file = event.target.files[0];
        if (file) {
            if (file.size > 5000000) {
                this.showNotification('Image size should be less than 5MB', 'error');
                event.target.value = '';
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                this.currentImageData = e.target.result;
                document.getElementById('imagePreview').innerHTML =
                    `<img src="${this.currentImageData}" />`;
            };
            reader.readAsDataURL(file);
        }
    }

    validateForm(name, ingredients, steps) {
        let valid = true;

        const nameError = document.getElementById('nameError');
        const ingredientsError = document.getElementById('ingredientsError');
        const stepsError = document.getElementById('stepsError');

        nameError.style.display = 'none';
        ingredientsError.style.display = 'none';
        stepsError.style.display = 'none';

        if (!name.trim()) {
            nameError.style.display = 'block';
            valid = false;
        }

        if (!ingredients.trim()) {
            ingredientsError.style.display = 'block';
            valid = false;
        }

        if (!steps.trim()) {
            stepsError.style.display = 'block';
            valid = false;
        }

        return valid;
    }

    addRecipe() {
        const name = document.getElementById('recipeName').value;
        const ingredients = document.getElementById('ingredients').value;
        const steps = document.getElementById('steps').value;

        if (!this.validateForm(name, ingredients, steps)) return;

        const recipe = {
            id: Date.now(),
            name: name.trim(),
            ingredients: ingredients.trim().split('\n'),
            steps: steps.trim().split('\n'),
            image: this.currentImageData || this.getDefaultImage(),
            dateAdded: new Date().toLocaleDateString()
        };

        this.recipes.unshift(recipe);

        if (this.saveRecipes()) {
            this.showNotification('Recipe added successfully!', 'success');
            this.clearForm();
            this.hideForm();
            this.displayRecipes();
        }
    }

    getDefaultImage() {
        return 'data:image/svg+xml;base64,...'; // unchanged
    }

    clearForm() {
        document.getElementById('recipeForm').reset();
        document.getElementById('imagePreview').innerHTML = '';
        this.currentImageData = null;
        document.querySelectorAll('.error-message').forEach(el => el.style.display = 'none');
    }

    displayRecipes(list = null) {
        const grid = document.getElementById('recipesGrid');
        const recipes = list || this.recipes;

        if (recipes.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📖</div>
                    <h3>No recipes found</h3>
                </div>`;
            return;
        }

        grid.innerHTML = recipes.map(recipe => `
            <div class="recipe-card" data-id="${recipe.id}">
                <img src="${recipe.image}" class="recipe-card-image" />
                <div class="recipe-card-content">
                    <h3>${recipe.name}</h3>
                    <p>${recipe.ingredients.slice(0, 3).join(', ')}</p>
                    <div class="recipe-card-footer">
                        <span>Added: ${recipe.dateAdded}</span>
                        <button class="btn-delete"
                            onclick="recipeBook.deleteRecipe(${recipe.id}); event.stopPropagation();">
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        document.querySelectorAll('.recipe-card').forEach(card => {
            card.addEventListener('click', () => {
                const id = Number(card.dataset.id);
                this.showRecipeDetails(id);
            });
        });
    }

    showRecipeDetails(id) {
        const recipe = this.recipes.find(r => r.id === id);
        if (!recipe) return;

        document.getElementById('modalImage').src = recipe.image;
        document.getElementById('modalTitle').textContent = recipe.name;

        document.getElementById('modalIngredients').innerHTML =
            recipe.ingredients.map(i => `<li>${i}</li>`).join('');

        document.getElementById('modalSteps').innerHTML =
            recipe.steps.map(s => `<li>${s}</li>`).join('');

        document.getElementById('recipeModal').classList.add('active');
    }

    closeModal() {
        document.getElementById('recipeModal').classList.remove('active');
    }

    deleteRecipe(id) {
        this.recipes = this.recipes.filter(r => r.id !== id);
        this.saveRecipes();
        this.displayRecipes();
        this.showNotification('Recipe deleted.', 'error');
    }

    searchRecipes(keyword) {
        keyword = keyword.toLowerCase();

        const filtered = this.recipes.filter(r =>
            r.name.toLowerCase().includes(keyword) ||
            r.ingredients.join(' ').toLowerCase().includes(keyword)
        );

        this.displayRecipes(filtered);
    }

    showNotification(message, type) {
        const box = document.getElementById('notification');
        box.textContent = message;
        box.className = `notification show ${type}`;
        setTimeout(() => { box.classList.remove('show'); }, 2000);
    }
}

const recipeBook = new RecipeBook();

