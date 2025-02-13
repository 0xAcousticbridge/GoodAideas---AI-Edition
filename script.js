document.addEventListener('DOMContentLoaded', () => {
    const ideaFeed = document.getElementById('idea-feed');
    const loadMoreButton = document.getElementById('load-more-button');
    const categoryFilterButtons = document.querySelectorAll('.filter-button');
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const sortSelect = document.getElementById('sort-select');
    const notificationArea = document.getElementById('notification-area');
    const suggestIdeaForm = document.getElementById('suggest-idea-form');
    const suggestionMessageArea = document.getElementById('suggestion-message-area');
    const loginButton = document.getElementById('login-button');
    const registerButton = document.getElementById('register-button'); // ADDED REGISTER BUTTON
    const logoutButton = document.getElementById('logout-button');
    const userProfileName = document.getElementById('user-profile-name');
    const userSuggestionsContainer = document.getElementById('user-suggestions-container');
    const onboardingOverlay = document.getElementById('onboarding-overlay');
    const dismissOnboardingButton = document.getElementById('dismiss-onboarding-button');
    const ideaOfTheDayContainer = document.getElementById('idea-of-the-day-container');


    let currentCategory = 'all';
    let searchQuery = '';
    let sortValue = 'default';
    let page = 1;
    let loadingIdeas = false;


    // --- Onboarding ---
    const onboardingDismissed = localStorage.getItem('onboardingDismissed');
    if (!onboardingDismissed) {
        onboardingOverlay.style.display = 'flex'; // Show overlay
    }

    dismissOnboardingButton.addEventListener('click', () => {
        onboardingOverlay.style.display = 'none'; // Hide overlay
        localStorage.setItem('onboardingDismissed', 'true'); // Remember dismissal
    });


    // --- User Session and Profile ---
    function checkSession() {
        fetch('/api/session')
            .then(response => response.json())
            .then(data => {
                if (data.loggedIn) {
                    loginButton.style.display = 'none';
                    registerButton.style.display = 'none'; // HIDE REGISTER BUTTON WHEN LOGGED IN
                    logoutButton.style.display = 'inline-block';
                    userProfileName.textContent = data.username;
                    userProfileName.style.display = 'inline-block'; // Show username
                    if (data.isAdmin) {
                        fetchAdminSuggestions(); // Load admin suggestions if admin
                    }
                } else {
                    loginButton.style.display = 'inline-block';
                    registerButton.style.display = 'inline-block'; // SHOW REGISTER BUTTON WHEN LOGGED OUT
                    logoutButton.style.display = 'none';
                    userProfileName.style.display = 'none'; // Hide username
                    userSuggestionsContainer.style.display = 'none'; // Hide admin suggestions for non-admins
                }
            })
            .catch(error => console.error('Error checking session:', error));
    }


    loginButton.addEventListener('click', () => {
        // Redirect to login page or show login modal - adjust as needed
        window.location.href = '/login'; //Example redirect -  implement login page/modal
    });

    registerButton.addEventListener('click', () => {
        // Redirect to registration page or show registration modal - adjust as needed
        window.location.href = '/register'; // Example redirect to registration page
    });


    logoutButton.addEventListener('click', () => {
        fetch('/api/logout')
            .then(response => response.json())
            .then(data => {
                if (data.message === 'Logged out successfully') {
                    checkSession(); // Update UI to logged out state
                    // Optionally, redirect to home page or refresh idea feed
                }
            })
            .catch(error => console.error('Error logging out:', error));
    });


    // --- Idea of the Day ---
    function fetchIdeaOfTheDay() {
        fetch('/api/idea_of_the_day')
            .then(response => response.json())
            .then(data => {
                if (data.idea) {
                    displayIdeaOfTheDay(data.idea);
                } else if (data.message) {
                    console.log(data.message); // Log "No featured idea today" message (not an error)
                    ideaOfTheDayContainer.innerHTML = '<p>No featured idea of the day yet.</p>';
                    ideaOfTheDayContainer.style.display = 'block'; // Ensure container is shown even if no idea
                }
            })
            .catch(error => {
                console.error('Error fetching idea of the day:', error);
                ideaOfTheDayContainer.innerHTML = '<p>Failed to load idea of the day.</p>';
                ideaOfTheDayContainer.style.display = 'block'; // Show error message
            });
    }


    function displayIdeaOfTheDay(idea) {
        ideaOfTheDayContainer.innerHTML = `
            <h2>Idea of the Day</h2>
            <div class="idea-card featured-idea">
                <h3>${idea.title}</h3>
                <p class="category">${idea.category}</p>
                <p>${idea.description}</p>
                ${idea.tags && idea.tags.length > 0 ? `<p class="tags">Tags: ${idea.tags.join(', ')}</p>` : ''}
                <div class="rating-favorite-container">
                    <div class="rating-display">
                        <i class="fa-solid fa-star"></i> ${idea.average_rating.toFixed(1)} (${idea.rating_count} ratings)
                    </div>
                    <button class="favorite-button" data-idea-id="${idea.id}" aria-label="Favorite">
                        <i class="fa-solid fa-heart"></i> <span class="favorite-count">${idea.favorite_count}</span>
                    </button>
                </div>
            </div>
        `;
        ideaOfTheDayContainer.style.display = 'block'; // Make sure container is visible
        attachFavoriteListener(ideaOfTheDayContainer.querySelector('.favorite-button')); // Attach listener to featured idea's button
    }


    // --- Idea Feed Display ---
    function fetchIdeas() {
        if (loadingIdeas) return;
        loadingIdeas = true;
        loadMoreButton.textContent = 'Loading GoodAideas...';


        let url = `/api/ideas?page=${page}&category=${currentCategory}&search=${searchQuery}&sort_by=${sortValue}`;


        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.ideas && data.ideas.length > 0) {
                    data.ideas.forEach(idea => ideaFeed.innerHTML += createIdeaCard(idea));
                    page++;
                    loadMoreButton.textContent = 'Load More GoodAideas';
                } else {
                    loadMoreButton.style.display = 'none'; // Hide button if no more ideas
                    if (page === 1 && !searchQuery && currentCategory === 'all') {
                        ideaFeed.innerHTML = '<p>No GoodAideas available yet. Be the first to suggest one!</p>';
                    } else if (page === 1) {
                        ideaFeed.innerHTML = '<p>No GoodAideas match your filter criteria.</p>';
                    } else {
                        loadMoreButton.textContent = 'No More Ideas'; // If on later page, just indicate no more
                    }
                }
                loadingIdeas = false;
                attachFavoriteListeners(); // Attach listeners after cards are added
                attachRatingListeners(); // Attach rating listeners after cards are added
            })
            .catch(error => {
                console.error('Error fetching ideas:', error);
                ideaFeed.innerHTML = '<p class="error-message">Failed to load GoodAideas.</p>';
                loadMoreButton.textContent = 'Load More GoodAideas'; // Reset button text on error
                loadingIdeas = false;
            });
    }


    function createIdeaCard(idea) {
        return `
            <div class="idea-card">
                <h3>${idea.title}</h3>
                <p class="category">${idea.category}</p>
                <p>${idea.description}</p>
                ${idea.tags && idea.tags.length > 0 ? `<p class="tags">Tags: ${idea.tags.join(', ')}</p>` : ''}
                <div class="rating-favorite-container">
                    <div class="rating-display">
                        <i class="fa-solid fa-star"></i> ${idea.average_rating.toFixed(1)} (${idea.rating_count} ratings)
                    </div>
                    <button class="favorite-button" data-idea-id="${idea.id}" aria-label="Favorite">
                        <i class="fa-solid fa-heart"></i> <span class="favorite-count">${idea.favorite_count}</span>
                    </button>
                    <button class="rate-button" data-idea-id="${idea.id}" aria-label="Rate this idea">
                        <i class="fa-solid fa-star"></i> Rate
                    </button>
                </div>
            </div>
        `;
    }


    // --- Idea Interactions - Favoriting ---
    function attachFavoriteListeners() {
        ideaFeed.querySelectorAll('.favorite-button').forEach(button => {
            if (!button.dataset.listenerAdded) {
                button.addEventListener('click', handleFavoriteClick);
                button.dataset.listenerAdded = 'true'; // Mark listener as added
            }
        });
    }


    function attachFavoriteListener(button) { // For dynamically created buttons like in Idea of the Day
        if (button && !button.dataset.listenerAdded) {
            button.addEventListener('click', handleFavoriteClick);
            button.dataset.listenerAdded = 'true';
        }
    }


    function handleFavoriteClick(event) {
        const button = event.currentTarget;
        const ideaId = button.dataset.ideaId;
        const isFavorited = button.classList.contains('favorited'); // Check if already favorited


        const action = isFavorited ? 'unfavorite' : 'favorite';
        const apiEndpoint = isFavorited ? `/api/unfavorite_idea/${ideaId}` : `/api/favorite_idea/${ideaId}`;


        fetch(apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(response => response.json())
            .then(data => {
                if (response.ok) {
                    const favoriteCountSpan = button.querySelector('.favorite-count');
                    let currentCount = parseInt(favoriteCountSpan.textContent, 10);
                    favoriteCountSpan.textContent = isFavorited ? currentCount - 1 : currentCount + 1;
                    button.classList.toggle('favorited'); // Toggle visual style
                    showNotification(data.message);
                    checkSession(); // Update points in header after favorite action
                } else {
                    showNotification(data.message || 'Failed to update favorite.');
                }
            })
            .catch(error => {
                console.error('Error favoriting/unfavoriting idea:', error);
                showNotification('Error processing favorite action.');
            });
    }


    // --- Idea Interactions - Rating ---
    function attachRatingListeners() {
        ideaFeed.querySelectorAll('.rate-button').forEach(button => {
            if (!button.dataset.listenerAdded) {
                button.addEventListener('click', handleRateClick);
                button.dataset.listenerAdded = 'true';
            }
        });
    }


    function handleRateClick(event) {
        const button = event.currentTarget;
        const ideaId = button.dataset.ideaId;


        const rating = prompt("Rate this idea from 1 to 5 stars:", "");
        if (rating === null) return; // User cancelled prompt


        const ratingValue = parseInt(rating, 10);
        if (isNaN(ratingValue) || ratingValue < 1 || ratingValue > 5) {
            showNotification('Invalid rating. Please enter a number from 1 to 5.');
            return;
        }


        fetch(`/api/rate_idea/${ideaId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ rating: ratingValue })
        })
            .then(response => response.json())
            .then(data => {
                if (response.ok) {
                    showNotification(data.message);
                    fetchIdeasForCurrentFilters(); // Refresh ideas to update rating display
                    checkSession(); // Update points in header after rating
                } else {
                    showNotification(data.message || 'Failed to submit rating.');
                }
            })
            .catch(error => {
                console.error('Error rating idea:', error);
                showNotification('Error submitting rating.');
            });
    }


    // --- Admin Functionality - Fetch User Suggestions ---
    function fetchAdminSuggestions() {
        userSuggestionsContainer.style.display = 'block'; // Show container when admin logged in
        userSuggestionsContainer.innerHTML = '<h3>User Suggestions</h3><div id="suggestions-list">Loading suggestions...</div>';
        const suggestionsList = document.getElementById('suggestions-list');


        fetch('/api/admin/suggestions')
            .then(response => response.json())
            .then(data => {
                if (response.ok && data.suggestions) {
                    if (data.suggestions.length === 0) {
                        suggestionsList.innerHTML = '<p>No user suggestions yet.</p>';
                    } else {
                        suggestionsList.innerHTML = ''; // Clear loading message
                        data.suggestions.forEach(suggestion => suggestionsList.innerHTML += createSuggestionAdminCard(suggestion));
                        attachAdminSuggestionListeners(); // Attach listeners to admin buttons
                    }
                } else {
                    suggestionsList.innerHTML = '<p>Failed to load suggestions.</p>';
                    showNotification(data.message || 'Failed to load suggestions.'); // Notify user of error
                }
            })
            .catch(error => {
                console.error('Error fetching admin suggestions:', error);
                suggestionsList.innerHTML = '<p>Error loading suggestions.</p>';
                showNotification('Error loading suggestions.');
            });
    }


    function createSuggestionAdminCard(suggestion) {
        return `
            <div class="suggestion-card">
                <h4>${suggestion.title}</h4>
                <p><strong>Category:</strong> ${suggestion.category}</p>
                <p><strong>Suggested by:</strong> ${suggestion.username}</p>
                <p>${suggestion.suggestion_text}</p>
                <p><strong>Status:</strong> <span id="suggestion-status-${suggestion.id}">${suggestion.status || 'pending'}</span></p>
                <textarea id="admin-notes-${suggestion.id}" placeholder="Admin notes">${suggestion.admin_notes || ''}</textarea>
                <div class="admin-controls">
                    <button class="approve-button" data-suggestion-id="${suggestion.id}">Approve</button>
                    <button class="reject-button" data-suggestion-id="${suggestion.id}">Reject</button>
                    <button class="save-notes-button" data-suggestion-id="${suggestion.id}">Save Notes</button>
                    <button class="delete-suggestion-button" data-suggestion-id="${suggestion.id}">Delete</button>
                </div>
            </div>
        `;
    }


    function attachAdminSuggestionListeners() {
        const suggestionsList = document.getElementById('suggestions-list');
        suggestionsList.querySelectorAll('.approve-button').forEach(button => {
            button.addEventListener('click', () => handleAdminAction(button.dataset.suggestionId, 'approve'));
        });
        suggestionsList.querySelectorAll('.reject-button').forEach(button => {
            button.addEventListener('click', () => handleAdminAction(button.dataset.suggestionId, 'reject'));
        });
        suggestionsList.querySelectorAll('.save-notes-button').forEach(button => {
            button.addEventListener('click', () => handleAdminNotesSave(button.dataset.suggestionId));
        });
        suggestionsList.querySelectorAll('.delete-suggestion-button').forEach(button => {
            button.addEventListener('click', () => handleAdminDeleteSuggestion(button.dataset.suggestionId));
        });
    }


    function handleAdminAction(suggestionId, action) {
        fetch(`/api/admin/suggestions/${suggestionId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action: action })
        })
            .then(response => response.json())
            .then(data => {
                if (response.ok) {
                    showNotification(`Suggestion ${action}d successfully.`);
                    fetchAdminSuggestions(); // Refresh admin suggestion list
                } else {
                    showNotification(data.message || `Failed to ${action} suggestion.`);
                }
            })
            .catch(error => {
                console.error(`Error ${action}ing suggestion:`, error);
                showNotification(`Error ${action}ing suggestion.`);
            });
    }


    function handleAdminNotesSave(suggestionId) {
        const notesText = document.getElementById(`admin-notes-${suggestionId}`).value;
        fetch(`/api/admin/suggestions/${suggestionId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action: 'update_notes', adminNotes: notesText })
        })
            .then(response => response.json())
            .then(data => {
                if (response.ok) {
                    showNotification('Admin notes saved.');
                } else {
                    showNotification(data.message || 'Failed to save admin notes.');
                }
            })
            .catch(error => {
                console.error('Error saving admin notes:', error);
                showNotification('Error saving admin notes.');
            });
    }


    function handleAdminDeleteSuggestion(suggestionId) {
        if (confirm('Are you sure you want to delete this suggestion?')) {
            fetch(`/api/admin/suggestions/${suggestionId}`, {
                method: 'DELETE',
            })
                .then(response => response.json())
                .then(data => {
                    if (response.ok) {
                        showNotification('Suggestion deleted successfully.');
                        fetchAdminSuggestions(); // Refresh admin suggestion list
                    } else {
                        showNotification(data.message || 'Failed to delete suggestion.');
                    }
                })
                .catch(error => {
                    console.error('Error deleting suggestion:', error);
                    showNotification('Error deleting suggestion.');
                });
        }
    }


    // --- Suggest Idea Form ---
    suggestIdeaForm.addEventListener('submit', function (event) {
        event.preventDefault();


        const title = document.getElementById('suggestion-title').value;
        const category = document.getElementById('suggestion-category').value;
        const description = document.getElementById('suggestion-text').value;
        const tagsInput = document.getElementById('suggestion-tags').value; // Get tags input
        const tags = tagsInput.split(',').map(tag => tag.trim()); // Split and trim tags


        fetch('/api/submit_idea', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: title,
                category: category,
                description: description,
                tags: tags // Include tags in submission
            })
        })
            .then(response => response.json())
            .then(data => {
                if (response.ok) {
                    suggestIdeaForm.reset(); // Clear form on success
                    suggestionMessageArea.style.display = 'block'; // Show thank you message
                    showNotification(data.message); // Show notification
                    setTimeout(() => { suggestionMessageArea.style.display = 'none'; }, 3000); // Hide message after 3 seconds
                    fetchIdeasForCurrentFilters(); // Refresh idea feed to include new idea
                    checkSession(); // Update points in header after suggestion
                } else {
                    showNotification(data.message || 'Failed to submit idea. Please try again.');
                }
            })
            .catch(error => {
                console.error('Error submitting idea:', error);
                showNotification('Failed to submit idea. Please check your connection and try again.');
            });
    });


    // --- Filtering and Sorting ---
    categoryFilterButtons.forEach(button => {
        button.addEventListener('click', function () {
            categoryFilterButtons.forEach(btn => btn.classList.remove('active')); //remove active class from others
            this.classList.add('active'); //add active class to the clicked button
            currentCategory = this.dataset.category;
            page = 1; // Reset page to 1 when filters change
            ideaFeed.innerHTML = ''; // Clear existing ideas
            loadMoreButton.style.display = 'block'; // Ensure button is visible
            fetchIdeasForCurrentFilters();
        });
    });


    sortSelect.addEventListener('change', function () {
        sortValue = this.value;
        page = 1;
        ideaFeed.innerHTML = '';
        loadMoreButton.style.display = 'block';
        fetchIdeasForCurrentFilters();
    });


    // --- Search ---
    searchButton.addEventListener('click', function () {
        searchQuery = searchInput.value.trim();
        page = 1;
        ideaFeed.innerHTML = '';
        loadMoreButton.style.display = 'block';
        fetchIdeasForCurrentFilters();
    });


    searchInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            searchButton.click(); // Trigger search on Enter key
            event.preventDefault(); // Prevent form submission if inside a form
        }
    });


    function fetchIdeasForCurrentFilters() {
        page = 1; // Reset page to 1 when filters or search changes
        ideaFeed.innerHTML = ''; // Clear existing ideas
        loadMoreButton.style.display = 'block'; // Make sure button is visible
        fetchIdeas();
    }


    // --- Load More ---
    loadMoreButton.addEventListener('click', fetchIdeas);


    // --- Notification Area ---
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.classList.add('notification');
        notification.textContent = message;
        notificationArea.appendChild(notification);
        setTimeout(() => notification.remove(), 3000); //remove after 3 seconds
    }


    // --- Initial Load & Setup ---
    checkSession();
    fetchIdeaOfTheDay();
    fetchIdeas(); // Initial idea load


    // --- Admin Suggestion Area - Initially Hidden ---
    userSuggestionsContainer.style.display = 'none'; // Initially hide admin suggestions
});