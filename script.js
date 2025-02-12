document.addEventListener('DOMContentLoaded', function () {
    const ideaFeed = document.getElementById('idea-feed');
    const filterButtons = document.querySelectorAll('.filter-button');
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const loadMoreButton = document.getElementById('load-more-button');
    const loadMoreContainer = document.getElementById('load-more-container');
    const sortSelect = document.getElementById('sort-select');
    const suggestIdeaForm = document.getElementById('suggest-idea-form');
    const suggestionMessageArea = document.getElementById('suggestion-message-area');
    const userSuggestionsContainer = document.getElementById('user-suggestions-container');
    const notificationArea = document.getElementById('notification-area');
    const onboardingOverlay = document.getElementById('onboarding-overlay');
    const dismissOnboardingButton = document.getElementById('dismiss-onboarding-button');
    const loginButton = document.getElementById('login-button');
    const logoutButton = document.getElementById('logout-button');
    const userProfileNameDisplay = document.getElementById('user-profile-name');
    const userProfileIcon = document.querySelector('.user-profile-icon');


    // Expanded GoodAidea card data - 50 IDEAS
    const allGoodAideas = [
        {
            title: "AI-Powered Personalized Learning",
            explanation: "AI algorithms analyze student learning patterns to tailor educational content and pace, optimizing learning outcomes.",
            howToUse: "Implement AI learning platforms that adapt to individual student needs.",
            category: "Productivity",
            averageRating: 4.5
        },
        {
            title: "AI-Driven Healthcare Diagnostics",
            explanation: "AI analyzes medical images and patient data to improve diagnostic accuracy and speed, leading to earlier and more effective treatments.",
            howToUse: "Integrate AI diagnostic tools in hospitals and clinics.",
            category: "Health & Wellness",
            averageRating: 4.8
        },
        {
            title: "AI for Financial Forecasting",
            explanation: "Utilize AI to predict market trends and financial risks, aiding in better investment decisions and economic stability.",
            howToUse: "Develop AI-based financial analysis tools for investors and financial institutions.",
            category: "Finance",
            averageRating: 4.2
        },
        {
            title: "AI-Enhanced Customer Service",
            explanation: "AI chatbots and virtual assistants provide instant, personalized customer support, improving satisfaction and efficiency.",
            howToUse: "Deploy AI chatbots on websites and customer service platforms.",
            category: "Productivity",
            averageRating: 4.0
        },
        {
            title: "AI in Precision Agriculture",
            explanation: "AI monitors crop health, soil conditions, and weather patterns to optimize irrigation, fertilization, and pest control, increasing yield and reducing waste.",
            howToUse: "Adopt AI-driven agricultural management systems in farming.",
            category: "Productivity",
            averageRating: 4.6
        },
        {
            title: "AI for Mental Wellness Support",
            explanation: "AI-powered apps offer personalized mental health support, including therapy chatbots and stress management techniques.",
            howToUse: "Promote and develop AI mental wellness apps.",
            category: "Health & Wellness",
            averageRating: 4.4
        },
        {
            title: "AI-Optimized Energy Consumption",
            explanation: "AI systems manage energy distribution and consumption in smart grids and homes, reducing waste and promoting sustainability.",
            howToUse: "Implement AI energy management systems in urban planning and home automation.",
            category: "Productivity",
            averageRating: 4.7
        },
        {
            title: "AI in Drug Discovery",
            explanation: "AI accelerates the drug discovery process by analyzing biological data and predicting drug efficacy and safety.",
            howToUse: "Invest in AI-driven pharmaceutical research and development.",
            category: "Health & Wellness",
            averageRating: 4.9
        },
        {
            title: "AI for Fraud Detection",
            explanation: "AI algorithms identify and prevent fraudulent transactions in banking and e-commerce, enhancing security and trust.",
            howToUse: "Integrate AI fraud detection systems in financial transactions.",
            category: "Finance",
            averageRating: 4.5
        },
        {
            title: "AI-Powered Smart Cities",
            explanation: "AI manages city infrastructure, traffic flow, and public services to improve urban living and efficiency.",
            howToUse: "Develop and implement AI solutions for smart city initiatives.",
            category: "Productivity",
            averageRating: 4.3
        },
        {
            title: "AI for Personalized Fitness Regimens",
            explanation: "AI analyzes fitness data and goals to create customized workout and nutrition plans, maximizing fitness results.",
            howToUse: "Utilize AI fitness apps and wearables for personalized health management.",
            category: "Health & Wellness",
            averageRating: 4.6
        },
        {
            title: "AI in Algorithmic Trading",
            explanation: "AI executes high-speed trades based on market analysis, optimizing investment returns but also posing risks.",
            howToUse: "Understand and regulate AI algorithmic trading in financial markets.",
            category: "Finance",
            averageRating: 4.1
        },
        {
            title: "AI-Driven Supply Chain Optimization",
            explanation: "AI predicts demand and optimizes logistics in supply chains, reducing costs and improving efficiency.",
            howToUse: "Implement AI in supply chain management and logistics.",
            category: "Productivity",
            averageRating: 4.7
        },
        {
            title: "AI for Early Disease Detection",
            explanation: "AI algorithms analyze subtle patterns in health data to detect diseases like cancer in early, treatable stages.",
            howToUse: "Incorporate AI in routine health screenings and diagnostics.",
            category: "Health & Wellness",
            averageRating: 4.8
        },
        {
            title: "AI in Robo-Advisors",
            explanation: "AI robo-advisors provide automated investment advice and portfolio management, making financial planning accessible to more people.",
            howToUse: "Explore and utilize AI robo-advisor platforms for personal finance.",
            category: "Finance",
            averageRating: 4.3
        },
        {
            title: "AI-Based Project Management Tools",
            explanation: "AI tools assist in project planning, task allocation, and progress tracking, enhancing team productivity and project success rates.",
            howToUse: "Adopt AI project management software in team-based projects.",
            category: "Productivity",
            averageRating: 4.4
        },
        {
            title: "AI for Personalized Nutrition Plans",
            explanation: "AI analyzes dietary needs and health goals to create personalized meal plans and nutritional advice.",
            howToUse: "Use AI nutrition apps to optimize your diet and health.",
            category: "Health & Wellness",
            averageRating: 4.5
        },
        {
            title: "AI in Credit Scoring",
            explanation: "AI improves credit scoring accuracy by analyzing a wider range of data, but raises concerns about bias and fairness.",
            howToUse: "Ensure fairness and transparency in AI credit scoring systems.",
            category: "Finance",
            averageRating: 4.2
        },
        {
            title: "AI-Powered Content Creation",
            explanation: "AI generates text, images, and music, speeding up content creation processes for marketing and media.",
            howToUse: "Utilize AI content generation tools for creative projects and marketing.",
            category: "Productivity",
            averageRating: 4.1
        },
        {
            title: "AI for Remote Patient Monitoring",
            explanation: "AI monitors patient health data remotely, enabling timely interventions and reducing hospital readmissions.",
            howToUse: "Implement AI remote monitoring systems for chronic disease management.",
            category: "Health & Wellness",
            averageRating: 4.7
        },
        {
            title: "AI in Insurance Underwriting",
            explanation: "AI automates and refines insurance underwriting, improving efficiency and risk assessment but potentially impacting jobs.",
            howToUse: "Adapt insurance industry practices to incorporate AI underwriting.",
            category: "Finance",
            averageRating: 4.6
        },
        {
            title: "AI-Driven Meeting Scheduling",
            explanation: "AI assistants automate meeting scheduling by finding optimal times and handling logistics, boosting workplace efficiency.",
            howToUse: "Use AI scheduling tools to streamline meeting arrangements.",
            category: "Productivity",
            averageRating: 4.3
        },
        {
            title: "AI for Geriatric Care",
            explanation: "AI provides support for elderly care, including monitoring health, providing companionship, and assisting with daily tasks.",
            howToUse: "Develop and adopt AI solutions for elderly care and assisted living.",
            category: "Health & Wellness",
            averageRating: 4.8
        },
        {
            title: "AI in Tax Optimization",
            explanation: "AI helps individuals and businesses optimize tax strategies and ensure compliance, but requires careful oversight.",
            howToUse: "Utilize AI tax preparation and optimization software.",
            category: "Finance",
            averageRating: 4.4
        },
        {
            title: "AI-Enhanced Language Translation",
            explanation: "AI translation tools offer real-time, accurate language translation, breaking down communication barriers globally.",
            howToUse: "Employ AI translation services for international communication and business.",
            category: "Productivity",
            averageRating: 4.5
        },
        {
            title: "AI for Chronic Pain Management",
            explanation: "AI-driven therapies and tools help manage chronic pain through personalized treatment plans and monitoring.",
            howToUse: "Explore AI-based pain management therapies and technologies.",
            category: "Health & Wellness",
            averageRating: 4.6
        },
        {
            title: "AI in Personal Budgeting",
            explanation: "AI apps automate budgeting, track expenses, and provide financial advice, improving personal financial management.",
            howToUse: "Use AI budgeting apps to manage personal finances effectively.",
            category: "Finance",
            averageRating: 4.7
        },
        {
            title: "AI-Powered Email Management",
            explanation: "AI filters, prioritizes, and summarizes emails, helping users manage email overload and improve response times.",
            howToUse: "Implement AI email management tools to enhance email productivity.",
            category: "Productivity",
            averageRating: 4.2
        },
        {
            title: "AI for Vision Correction",
            explanation: "AI algorithms assist in diagnosing and correcting vision problems, enhancing eye care and vision quality.",
            howToUse: "Develop AI-assisted vision correction technologies and treatments.",
            category: "Health & Wellness",
            averageRating: 4.9
        },
        {
            title: "AI in Investment Portfolio Diversification",
            explanation: "AI optimizes investment portfolios by analyzing market data and risk factors, improving returns and reducing volatility.",
            howToUse: "Use AI portfolio management tools for diversified investments.",
            category: "Finance",
            averageRating: 4.3
        },
        {
            title: "AI-Driven Legal Research",
            explanation: "AI tools expedite legal research by quickly analyzing vast legal databases, aiding lawyers and legal professionals.",
            howToUse: "Adopt AI legal research platforms in law firms and legal departments.",
            category: "Productivity",
            averageRating: 4.4
        },
        {
            title: "AI for Sleep Improvement",
            explanation: "AI-powered sleep apps and devices monitor and analyze sleep patterns to provide personalized advice for better sleep quality.",
            howToUse: "Utilize AI sleep monitoring and improvement technologies.",
            category: "Health & Wellness",
            averageRating: 4.5
        },
        {
            title: "AI in Stock Market Prediction",
            explanation: "AI analyzes market data to predict stock price movements, offering potential investment advantages but with inherent uncertainty.",
            howToUse: "Approach AI stock market predictions with caution and use as a tool, not a guarantee.",
            category: "Finance",
            averageRating: 4.1
        },
        {
            title: "AI-Enhanced Code Debugging",
            explanation: "AI tools assist programmers in identifying and fixing bugs in code, speeding up software development.",
            howToUse: "Integrate AI debugging tools in software development environments.",
            category: "Productivity",
            averageRating: 4.6
        },
        {
            title: "AI for Rehabilitation Therapy",
            explanation: "AI personalizes rehabilitation programs and monitors patient progress, enhancing recovery outcomes.",
            howToUse: "Implement AI in physical and cognitive rehabilitation centers.",
            category: "Health & Wellness",
            averageRating: 4.7
        },
        {
            title: "AI in Cryptocurrency Trading",
            explanation: "AI algorithms trade cryptocurrencies based on market analysis, seeking profit in volatile digital currency markets.",
            howToUse: "Engage in AI cryptocurrency trading with awareness of high market risks.",
            category: "Finance",
            averageRating: 4.2
        },
        {
            title: "AI-Powered Customer Onboarding",
            explanation: "AI streamlines and personalizes customer onboarding processes, improving user experience and retention.",
            howToUse: "Deploy AI onboarding systems in customer-facing businesses.",
            category: "Productivity",
            averageRating: 4.3
        },
        {
            title: "AI for Allergy Management",
            explanation: "AI apps help manage allergies by tracking symptoms, predicting allergen exposure, and providing personalized advice.",
            howToUse: "Use AI allergy management apps for better allergy control.",
            category: "Health & Wellness",
            averageRating: 4.4
        },
        {
            title: "AI in Tax Fraud Prevention",
            explanation: "AI algorithms detect patterns of tax evasion and fraud, helping governments ensure fair tax collection.",
            howToUse: "Utilize AI tax fraud detection systems in tax administration.",
            category: "Finance",
            averageRating: 4.8
        },
        {
            title: "AI-Driven Task Automation",
            explanation: "AI automates repetitive tasks across various industries, freeing up human workers for more creative and strategic roles.",
            howToUse: "Implement AI automation tools to streamline workflows in businesses.",
            category: "Productivity",
            averageRating: 4.9
        },
        {
            title: "AI for Stress Reduction",
            explanation: "AI-powered apps offer techniques and tools for stress reduction, such as meditation guidance and biofeedback.",
            howToUse: "Promote and utilize AI stress reduction and meditation apps.",
            category: "Health & Wellness",
            averageRating: 4.5
        },
        {
            title: "AI in Estate Planning",
            explanation: "AI assists in estate planning by organizing assets, predicting tax implications, and creating legal documents.",
            howToUse: "Use AI estate planning software to manage and plan your estate.",
            category: "Finance",
            averageRating: 4.1
        },
        {
            title: "AI-Enhanced Meeting Summarization",
            explanation: "AI automatically summarizes meeting notes and action items, improving post-meeting productivity and follow-up.",
            howToUse: "Adopt AI meeting summarization tools in business communications.",
            category: "Productivity",
            averageRating: 4.6
        },
        {
            title: "AI for Posture Correction",
            explanation: "AI-powered devices monitor posture and provide real-time feedback to correct slouching and improve spinal health.",
            howToUse: "Use AI posture correction wearables and apps.",
            category: "Health & Wellness",
            averageRating: 4.7
        },
        {
            title: "AI in Loan Application Processing",
            explanation: "AI streamlines loan application processing, speeding up approvals and reducing manual work for banks and applicants.",
            howToUse: "Implement AI loan processing systems in banking and lending institutions.",
            category: "Finance",
            averageRating: 4.3
        },
        {
            title: "AI-Driven Cybersecurity Threat Detection",
            explanation: "AI systems proactively identify and neutralize cyber threats, enhancing digital security for businesses and individuals.",
            howToUse: "Deploy AI cybersecurity solutions to protect against cyberattacks.",
            category: "Productivity",
            averageRating: 4.8
        },
        {
            title: "AI for Addiction Recovery Support",
            explanation: "AI apps offer personalized support and monitoring for individuals recovering from addiction, improving recovery rates.",
            howToUse: "Support and develop AI-based addiction recovery programs.",
            category: "Health & Wellness",
            averageRating: 4.9
        },
        {
            title: "AI in Financial Risk Assessment",
            explanation: "AI assesses financial risks by analyzing market trends and economic indicators, aiding in better financial planning.",
            howToUse: "Utilize AI risk assessment tools in financial advising and management.",
            category: "Finance",
            averageRating: 4.5
        },
        {
            title: "AI-Enhanced Customer Segmentation",
            explanation: "AI analyzes customer data to create detailed segments, allowing for more targeted and effective marketing strategies.",
            howToUse: "Use AI customer segmentation tools to refine marketing approaches.",
            category: "Productivity",
            averageRating: 4.2
        },
        {
            title: "AI for Gut Health Monitoring",
            explanation: "AI analyzes gut microbiome data to provide personalized dietary recommendations for improved digestive health.",
            howToUse: "Explore AI gut health analysis services and apps.",
            category: "Health & Wellness",
            averageRating: 4.6
        },
        {
            title: "AI in Portfolio Optimization",
            explanation: "AI optimizes investment portfolios for maximum returns based on individual risk tolerance and financial goals.",
            howToUse: "Consult AI portfolio optimization services for investment management.",
            category: "Finance",
            averageRating: 4.7
        }
    ];


    let displayedIdeas = [];
    const ideasPerLoad = 5;
    let cardsLoadedCount = 0;
    let currentFilter = 'all';
    let currentSearchTerm = '';
    let currentSort = 'default'; // Default sorting option


    // --- Local Storage Keys ---
    const ratingsLocalStorageKey = 'goodAideasRatings';
    const commentsLocalStorageKey = 'goodAideasComments';
    const favoritesLocalStorageKey = 'goodAideasFavorites';
    const userSuggestionsLocalStorageKey = 'goodAideasUserSuggestions'; // For user suggestions
    const onboardingStatusLocalStorageKey = 'onboardingStatus'; // For onboarding status
    const userProfileLocalStorageKey = 'userProfile'; // For user profile


    // --- User Profile Functions ---
    function initializeUserProfile() {
        let userProfile = getUserProfileFromLocalStorage();
        if (!userProfile) {
            userProfile = { isLoggedIn: false, username: 'Guest', profileImage: null }; // Default guest profile
            saveUserProfileToLocalStorage(userProfile);
        }
        updateUserProfileDisplay(userProfile);
    }

    function getUserProfileFromLocalStorage() {
        const profileJSON = localStorage.getItem(userProfileLocalStorageKey);
        return profileJSON ? JSON.parse(profileJSON) : null;
    }

    function saveUserProfileToLocalStorage(userProfile) {
        localStorage.setItem(userProfileLocalStorageKey, JSON.stringify(userProfile));
    }

    function updateUserProfileDisplay(userProfile) {
        if (userProfile.isLoggedIn) {
            userProfileNameDisplay.textContent = userProfile.username;
            loginButton.style.display = 'none';
            logoutButton.style.display = 'inline-block';
            if (userProfile.profileImage) {
                userProfileIcon.innerHTML = `<img src="${userProfile.profileImage}" alt="Profile">`;
            } else {
                userProfileIcon.textContent = userProfile.username.charAt(0).toUpperCase(); // First initial as default
            }
        } else {
            userProfileNameDisplay.textContent = 'Guest';
            loginButton.style.display = 'inline-block';
            logoutButton.style.display = 'none';
            userProfileIcon.textContent = 'G'; // Default icon for guest
            userProfileIcon.innerHTML = ''; // Clear image if any
        }
    }

    loginButton.addEventListener('click', function() {
        // Simulate login - in real app, this would be actual auth
        let userProfile = { isLoggedIn: true, username: 'User123', profileImage: 'path/to/default-profile.png' }; // Example user
        saveUserProfileToLocalStorage(userProfile);
        updateUserProfileDisplay(userProfile);
        alert('Logged in as User123 (Simulated)'); // Indicate simulated login
    });

    logoutButton.addEventListener('click', function() {
        // Simulate logout
        let userProfile = { isLoggedIn: false, username: 'Guest', profileImage: null };
        saveUserProfileToLocalStorage(userProfile);
        updateUserProfileDisplay(userProfile);
        alert('Logged out (Simulated)'); // Indicate simulated logout
    });
    // --- End User Profile Functions ---


    // --- Onboarding Logic ---
    function checkOnboardingStatus() {
        const onboardingStatus = localStorage.getItem(onboardingStatusLocalStorageKey);
        if (!onboardingStatus) {
            onboardingOverlay.style.display = 'flex'; // Show onboarding on first visit
        }
    }

    dismissOnboardingButton.addEventListener('click', function() {
        onboardingOverlay.style.display = 'none';
        localStorage.setItem(onboardingStatusLocalStorageKey, 'completed'); // Mark onboarding as completed
    });
    // --- End Onboarding Logic ---


    // --- Notification Area Logic ---
    function showNotification(message) {
        const notificationItem = document.createElement('div');
        notificationItem.classList.add('notification-item');
        notificationItem.innerHTML = `<h4 class="notification-header">New!</h4><p class="notification-message">${message}</p>`;
        notificationArea.appendChild(notificationItem);
        notificationArea.classList.add('show-notifications'); // Make area visible

        // Auto-hide after a delay (optional)
        setTimeout(() => {
            notificationItem.remove(); // Remove notification item after delay
            if (notificationArea.children.length === 0) {
                notificationArea.classList.remove('show-notifications'); // Hide area if empty
            }
        }, 5000); // Adjust delay as needed (e.g., 5000ms = 5 seconds)
    }

    // Simulate showing a notification (for demo purposes) - in real app, trigger on data update
    setTimeout(() => {
        showNotification('Check out today\'s Daily Picks! New AI GoodAideas are waiting.');
    }, 3000); // Show notification 3 seconds after page load
    // --- End Notification Area Logic ---


    // --- User Suggestions Logic ---
    suggestIdeaForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const ideaTitle = document.getElementById('suggestion-title').value.trim();
        const ideaCategory = document.getElementById('suggestion-category').value;
        const ideaText = document.getElementById('suggestion-text').value.trim();

        if (ideaTitle && ideaCategory && ideaText) {
            saveUserSuggestionToLocalStorage({
                title: ideaTitle,
                category: ideaCategory,
                text: ideaText
            });
            suggestIdeaForm.reset(); // Clear form
            suggestionMessageArea.style.display = 'block'; // Show success message
            setTimeout(() => {
                suggestionMessageArea.style.display = 'none'; // Hide message after a delay
            }, 3000); // Message disappears after 3 seconds

            loadUserSuggestions(); // Refresh user suggestions display (for admin view)
        } else {
            alert('Please fill in all fields to submit a suggestion.');
        }
    });

    function saveUserSuggestionToLocalStorage(suggestion) {
        const storedSuggestions = getUserSuggestionsFromLocalStorage();
        storedSuggestions.push(suggestion);
        localStorage.setItem(userSuggestionsLocalStorageKey, JSON.stringify(storedSuggestions));
    }

    function getUserSuggestionsFromLocalStorage() {
        const suggestionsJSON = localStorage.getItem(userSuggestionsLocalStorageKey);
        return suggestionsJSON ? JSON.parse(suggestionsJSON) : [];
    }

    function loadUserSuggestions() {
        userSuggestionsContainer.innerHTML = ''; // Clear existing suggestions
        const suggestions = getUserSuggestionsFromLocalStorage();
        if (suggestions.length === 0) {
            userSuggestionsContainer.innerHTML = '<p>No user suggestions yet.</p>';
            return;
        }
        suggestions.forEach(suggestion => {
            const suggestionCard = document.createElement('div');
            suggestionCard.classList.add('user-suggestion-card');
            suggestionCard.innerHTML = `
                <h4 class="suggestion-title">${suggestion.title}</h4>
                <p class="suggestion-category">Category: ${suggestion.category}</p>
                <p class="suggestion-text">${suggestion.text}</p>
            `;
            userSuggestionsContainer.appendChild(suggestionCard);
        });
    }
    // --- End User Suggestions Logic ---


    // --- Sorting Logic ---
    sortSelect.addEventListener('change', function() {
        currentSort = sortSelect.value;
        sortAndDisplayIdeas();
    });

    function sortAndDisplayIdeas() {
        let sortedIdeas = [...displayedIdeas]; // Create a copy to avoid modifying original array

        if (currentSort === 'top-rated') {
            sortedIdeas.sort((a, b) => b.averageRating - a.averageRating); // Sort by average rating, descending
        } else if (currentSort === 'most-recent') {
            // In a real app, you might have a 'dateAdded' property to sort by.
            // For this demo, we'll just reverse the current order as a simulation of "most recent"
            sortedIdeas.reverse();
        }
        displayIdeas(sortedIdeas); // Re-display with sorted ideas
    }
    // --- End Sorting Logic ---


    // --- Daily Picks Logic ---
    let dailyPickIndices = [];
    const dailyPickCount = 1; // Idea of the Day - just one

    function generateDailyPickIndices() {
        const indices = [];
        while (indices.length < dailyPickCount && indices.length < allGoodAideas.length) {
            const randomIndex = Math.floor(Math.random() * allGoodAideas.length);
            if (!indices.includes(randomIndex)) {
                indices.push(randomIndex);
            }
        }
        return indices;
    }

    function getDailyPicks() {
        if (dailyPickIndices.length === 0) {
            dailyPickIndices = generateDailyPickIndices();
        }
        return dailyPickIndices.map(index => allGoodAideas[index]);
    }

    function displayIdeaOfTheDay() {
        const ideaOfTheDayContainer = document.getElementById('idea-of-the-day-container');
        ideaOfTheDayContainer.innerHTML = ''; // Clear existing content

        const dailyPick = getDailyPicks()[0]; // Get the first (and only) daily pick
        if (dailyPick) {
            const titleElement = document.createElement('h2');
            titleElement.textContent = '✨ Idea of the Day: ✨ ' + dailyPick.title;

            const explanationElement = document.createElement('p');
            explanationElement.textContent = dailyPick.explanation;

            const callToActionElement = document.createElement('p');
            callToActionElement.classList.add('call-to-action');
            callToActionElement.textContent = "Check it out!";

            ideaOfTheDayContainer.appendChild(titleElement);
            ideaOfTheDayContainer.appendChild(explanationElement);
            ideaOfTheDayContainer.appendChild(callToActionElement);
        } else {
            ideaOfTheDayContainer.textContent = 'No Daily Pick available today.';
        }
    }
    // --- End Daily Picks Logic ---



    function createGoodAideaCard(idea, isDailyPick = false) {
        const cardDiv = document.createElement('div');
        cardDiv.classList.add('good-aidea-card');
        if (isDailyPick) {
            cardDiv.classList.add('daily-pick');
        }

        // --- Category Badge ---
        const categoryBadge = document.createElement('span');
        categoryBadge.classList.add('card-category-badge');
        categoryBadge.textContent = idea.category;
        cardDiv.appendChild(categoryBadge);
        // --- End Category Badge ---


        const categorySpan = document.createElement('span'); // Keep for filter functionality
        categorySpan.classList.add('card-category');
        categorySpan.textContent = idea.category;
        categorySpan.style.display = 'none'; // Hide original category text


        const titleElement = document.createElement('h2');
        titleElement.classList.add('card-title');
        titleElement.textContent = idea.title;

        const explanationElement = document.createElement('p');
        explanationElement.classList.add('card-explanation');
        explanationElement.textContent = idea.explanation;

        const howToUseElement = document.createElement('p');
        howToUseElement.classList.add('card-how-to-use');
        howToUseElement.textContent = "How to Use It: " + idea.howToUse;

        const callToActionElement = document.createElement('p');
        callToActionElement.classList.add('card-call-to-action');
        callToActionElement.textContent = "Try this AI GoodAidea today!";

        // --- Star Rating UI ---
        const ratingContainer = document.createElement('div');
        ratingContainer.classList.add('card-rating');
        let currentRating = 0;

        // --- Load rating from local storage ---
        const storedRatings = getRatingsFromLocalStorage();
        currentRating = storedRatings[idea.title] !== undefined ? parseInt(storedRatings[idea.title], 10) : 0;


        for (let i = 1; i <= 5; i++) {
            const starIcon = document.createElement('span');
            starIcon.classList.add('star-icon');
            starIcon.innerHTML = '&#9734;';

            starIcon.addEventListener('click', function() {
                let rating = i;
                currentRating = rating;
                highlightStars(ratingContainer, currentRating);
                saveRatingToLocalStorage(idea.title, rating);
                console.log(`Rated ${idea.title} with ${rating} stars (saved to local storage).`);

                // --- Star Animation ---
                starIcon.classList.add('star-animated');
                setTimeout(() => {
                    starIcon.classList.remove('star-animated');
                }, 300);
                // --- End Star Animation ---
             });
            ratingContainer.appendChild(starIcon);
        }
        // --- End Star Rating UI ---

        // --- Average Rating Display ---
        const averageRatingContainer = document.createElement('div');
        averageRatingContainer.classList.add('average-rating-display');
        averageRatingContainer.textContent = `Average Rating: ${idea.averageRating} stars`;

        const averageRatingStarsContainer = document.createElement('div');
        averageRatingStarsContainer.classList.add('average-rating-stars');
        for (let i = 0; i < 5; i++) {
            const starIcon = document.createElement('span');
            starIcon.classList.add('star-icon', 'average-star');
            starIcon.innerHTML = '&#9734;';
            averageRatingStarsContainer.appendChild(starIcon);
        }
        highlightStars(averageRatingStarsContainer, idea.averageRating);
        // --- End Average Rating Display ---


        // --- Comment Section ---
        const commentSectionContainer = document.createElement('div');
        commentSectionContainer.classList.add('comment-section');

        const commentHeader = document.createElement('h3');
        commentHeader.classList.add('comment-header');
        commentHeader.textContent = 'Comments';
        commentSectionContainer.appendChild(commentHeader);

        const commentDisplayArea = document.createElement('div');
        commentDisplayArea.classList.add('comment-display-area');
        commentSectionContainer.appendChild(commentDisplayArea);

        // --- Load comments from local storage and display ---
        const storedComments = getCommentsFromLocalStorage();
        const ideaComments = storedComments[idea.title] || [];
        ideaComments.forEach(commentText => {
            const commentElement = document.createElement('p');
            commentElement.classList.add('user-comment');
            commentElement.textContent = commentText;
            commentDisplayArea.appendChild(commentElement);
        });


        const commentInput = document.createElement('textarea');
        commentInput.classList.add('comment-input');
        commentInput.placeholder = 'Share your thoughts...';
        commentSectionContainer.appendChild(commentInput);

        const submitButton = document.createElement('button');
        submitButton.classList.add('comment-submit-button');
        submitButton.textContent = 'Submit Comment';
        commentSectionContainer.appendChild(submitButton);

        submitButton.addEventListener('click', function() {
            const commentText = commentInput.value.trim();
            if (commentText) {
                const commentElement = document.createElement('p');
                commentElement.classList.add('user-comment');
                commentElement.textContent = commentText;
                commentDisplayArea.appendChild(commentElement);
                commentInput.value = '';

                saveCommentToLocalStorage(idea.title, commentText);
                console.log(`Comment submitted for ${idea.title}: ${commentText} (saved to local storage).`);
            }
        });
        // --- End Comment Section ---

        // --- Card Actions (Favorite & Share Icons) ---
        const cardActionsDiv = document.createElement('div');
        cardActionsDiv.classList.add('card-actions');

        // --- Share Icon ---
        const shareIcon = document.createElement('span');
        shareIcon.classList.add('share-icon');
        shareIcon.innerHTML = '&#8617;'; // Share icon (arrow)
        shareIcon.addEventListener('click', function() {
            // Simulate sharing - in real app, use actual sharing APIs
            alert(`Simulating share for: ${idea.title} (Social sharing not fully implemented in this demo)`);
        });
        cardActionsDiv.appendChild(shareIcon);

        // --- Favorite Icon ---
        const favoriteIcon = document.createElement('span');
        favoriteIcon.classList.add('favorite-icon');
        favoriteIcon.innerHTML = '&#9825;'; // Default empty heart

        // --- Load favorites from local storage and set initial heart state ---
        const storedFavorites = getFavoritesFromLocalStorage();
        if (storedFavorites[idea.title]) {
            favoriteIcon.innerHTML = '&#9829;'; // Filled heart if favorited
            favoriteIcon.classList.add('favorited');
        }


        favoriteIcon.addEventListener('click', function() {
            toggleFavorite(idea.title, favoriteIcon);
        });
        cardActionsDiv.appendChild(favoriteIcon);
        // --- End Card Actions ---


        // --- Related Ideas Section (Simulated) ---
        const relatedIdeasSection = document.createElement('div');
        relatedIdeasSection.classList.add('related-ideas-section');

        const relatedIdeasHeader = document.createElement('h4');
        relatedIdeasHeader.classList.add('related-ideas-header');
        relatedIdeasHeader.textContent = '💡 Related Ideas:';
        relatedIdeasSection.appendChild(relatedIdeasHeader);

        const relatedIdeasList = document.createElement('div');
        relatedIdeasList.classList.add('related-ideas-list');
        relatedIdeasSection.appendChild(relatedIdeasList);

        // --- Simulate related ideas (randomly pick 3 from same category) ---
        const sameCategoryIdeas = allGoodAideas.filter(otherIdea => otherIdea.category === idea.category && otherIdea !== idea);
        const shuffledRelatedIdeas = [...sameCategoryIdeas].sort(() => 0.5 - Math.random()); // Shuffle for random selection
        const displayedRelatedIdeas = shuffledRelatedIdeas.slice(0, 3); // Take up to 3

        displayedRelatedIdeas.forEach(relatedIdea => {
            const relatedIdeaItem = document.createElement('span');
            relatedIdeaItem.classList.add('related-idea-item');
            relatedIdeaItem.textContent = relatedIdea.title;
            relatedIdeaItem.addEventListener('click', function() {
                // Simulate clicking related idea - for demo, just alert title
                alert(`Clicked related idea: ${relatedIdea.title} (Navigation to idea not fully implemented in this demo)`);
            });
            relatedIdeasList.appendChild(relatedIdeaItem);
        });
        // --- End Related Ideas Section ---


        // --- Keyword Filter (within card - hidden, but data available) ---
        const keywordsSpan = document.createElement('span');
        keywordsSpan.classList.add('card-keywords');
        keywordsSpan.textContent = idea.explanation; // Use explanation text as keywords for demo
        keywordsSpan.style.display = 'none'; // Hide keyword span
        // --- End Keyword Filter ---


        // cardDiv.appendChild(categorySpan); // Original category span - hidden
        cardDiv.appendChild(titleElement);
        cardDiv.appendChild(explanationElement);
        cardDiv.appendChild(howToUseElement);
        cardDiv.appendChild(callToActionElement);
        cardDiv.appendChild(ratingContainer);
        cardDiv.appendChild(averageRatingContainer);
        cardDiv.appendChild(averageRatingStarsContainer);
        cardDiv.appendChild(commentSectionContainer);
        cardDiv.appendChild(cardActionsDiv); // Add card actions (share, favorite)
        cardDiv.appendChild(relatedIdeasSection); // Add related ideas section
        cardDiv.appendChild(keywordsSpan); // Add keywords span (hidden)


        return cardDiv;
    }

    function highlightStars(container, rating) {
        const stars = container.querySelectorAll('.star-icon');
        stars.forEach((star, index) => {
            if (index < rating) {
                star.innerHTML = '&#9733;';
                star.classList.add('filled');
            } else {
                star.innerHTML = '&#9734;';
                star.classList.remove('filled');
            }
        });
    }

    // --- Local Storage Functions ---
    function saveRatingToLocalStorage(ideaTitle, rating) {
        const storedRatings = getRatingsFromLocalStorage();
        storedRatings[ideaTitle] = rating.toString();
        localStorage.setItem(ratingsLocalStorageKey, JSON.stringify(storedRatings));
    }

    function getRatingsFromLocalStorage() {
        const ratingsJSON = localStorage.getItem(ratingsLocalStorageKey);
        return ratingsJSON ? JSON.parse(ratingsJSON) : {};
    }

    // --- Local Storage Functions for Comments ---
    function saveCommentToLocalStorage(ideaTitle, commentText) {
        const storedComments = getCommentsFromLocalStorage();
        if (!storedComments[ideaTitle]) {
            storedComments[ideaTitle] = [];
        }
        storedComments[ideaTitle].push(commentText);
        localStorage.setItem(commentsLocalStorageKey, JSON.stringify(storedComments));
    }

    function getCommentsFromLocalStorage() {
        const commentsJSON = localStorage.getItem(commentsLocalStorageKey);
        return commentsJSON ? JSON.parse(commentsJSON) : {};
    }
    // --- End Local Storage Functions for Comments ---

    // --- Local Storage Functions for Favorites ---
    function saveFavoritesToLocalStorage(favorites) {
        localStorage.setItem(favoritesLocalStorageKey, JSON.stringify(favorites));
    }

    function getFavoritesFromLocalStorage() {
        const favoritesJSON = localStorage.getItem(favoritesLocalStorageKey);
        return favoritesJSON ? JSON.parse(favoritesJSON) : {};
    }

    function toggleFavorite(ideaTitle, favoriteIcon) {
        const storedFavorites = getFavoritesFromLocalStorage();
        const isCurrentlyFavorited = storedFavorites[ideaTitle];

        if (isCurrentlyFavorited) {
            delete storedFavorites[ideaTitle]; // Remove from favorites
            favoriteIcon.innerHTML = '&#9825;'; // Empty heart
            favoriteIcon.classList.remove('favorited');
            console.log(`${ideaTitle} removed from favorites.`);
        } else {
            storedFavorites[ideaTitle] = true; // Add to favorites
            favoriteIcon.innerHTML = '&#9829;'; // Filled heart
            favoriteIcon.classList.add('favorited');
            console.log(`${ideaTitle} added to favorites.`);
        }
        saveFavoritesToLocalStorage(storedFavorites);

        // If "Favorites" filter is active, re-render the idea feed to update display
        if (currentFilter === 'favorites') {
            displayFavorites(); // Re-display only favorites
        }
    }
    // --- End Local Storage Functions for Favorites ---


    function displayIdeas(ideasToDisplay) {
        ideaFeed.innerHTML = '';
        displayedIdeas = ideasToDisplay;
        // cardsLoadedCount = 0; // <-- REMOVE or COMMENT OUT THIS LINE

        if (displayedIdeas.length === 0) {
            const noResultsMessage = document.createElement('p');
            noResultsMessage.id = 'no-results-message';
            noResultsMessage.textContent = "No GoodAideas found. Try adjusting your filters or search term.";
            ideaFeed.appendChild(noResultsMessage);
            loadMoreContainer.style.display = 'none';
            return;
        }

        renderIdeaCards(0, ideasPerLoad);
        updateLoadMoreButtonState();
    }


    function renderIdeaCards(startIndex, count) {
        const endIndex = Math.min(startIndex + count, displayedIdeas.length);
        for (let i = startIndex; i < endIndex; i++) {
            // Determine if it's a daily pick for styling
            const isDailyPick = dailyPickIndices.includes(allGoodAideas.indexOf(displayedIdeas[i]));
            const cardElement = createGoodAideaCard(displayedIdeas[i], isDailyPick);
            ideaFeed.appendChild(cardElement);
            cardsLoadedCount++;
        }
    }


    function updateLoadMoreButtonState() {
        if (cardsLoadedCount >= displayedIdeas.length) {
            loadMoreContainer.style.display = 'none';
            loadMoreButton.disabled = true;
        } else {
            loadMoreContainer.style.display = 'block';
            loadMoreButton.disabled = false;
        }
    }


    function filterIdeas(category) {
        currentFilter = category;
        currentSearchTerm = '';
        searchInput.value = '';

        let filteredIdeas;
        if (category === 'all') {
            filteredIdeas = getDailyPicks();
        } else if (category === 'favorites') {
            filteredIdeas = displayFavorites(); // Call displayFavorites directly for "Favorites" filter
            return; // Exit to prevent default displayIdeas call
        }
         else {
            filteredIdeas = allGoodAideas.filter(idea => idea.category === category);
        }
        displayIdeas(filteredIdeas);
    }

    function displayDailyPicks() {
        currentFilter = 'all';
        currentSearchTerm = '';
        searchInput.value = '';

        ideaFeed.innerHTML = '';
        const dailyPicks = getDailyPicks();
        displayedIdeas = dailyPicks;
        cardsLoadedCount = 0;
        renderIdeaCards(0, dailyPickCount); // Just one daily pick now
        updateLoadMoreButtonState();
    }

    function displayFavorites() {
        currentFilter = 'favorites';
        currentSearchTerm = '';
        searchInput.value = '';
        filterButtons.forEach(btn => btn.classList.remove('active')); // Clear active filter button

        const storedFavorites = getFavoritesFromLocalStorage();
        const favoriteIdeas = allGoodAideas.filter(idea => storedFavorites[idea.title]);
        displayIdeas(favoriteIdeas);
        return favoriteIdeas; // Return for use in filterIdeas function
    }


    function searchIdeas(searchTerm) {
        currentSearchTerm = searchTerm;
        currentFilter = '';
        filterButtons.forEach(btn => btn.classList.remove('active'));

        const lowerSearchTerm = searchTerm.toLowerCase();
        const searchedIdeas = allGoodAideas.filter(idea => {
            return (
                idea.title.toLowerCase().includes(lowerSearchTerm) ||
                idea.explanation.toLowerCase().includes(lowerSearchTerm) ||
                idea.category.toLowerCase().includes(lowerSearchTerm) ||
                idea.howToUse.toLowerCase().includes(lowerSearchTerm) // Include "How to Use" in search
                || idea.explanation.toLowerCase().includes(lowerSearchTerm) // Search within explanation keywords
            );
        });
        displayIdeas(searchedIdeas);
    }


    // --- Initial Display and Event Listeners ---
    const allFilterButton = document.querySelector('.filter-button[data-category="all"]');

    function resetFiltersToDailyPicks() {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        allFilterButton.classList.add('active');
        displayDailyPicks();
    }

    displayIdeaOfTheDay(); // Display Idea of the Day on load
    resetFiltersToDailyPicks(); // Initial idea display (Daily Picks)
    loadUserSuggestions(); // Load user suggestions for admin view
    checkOnboardingStatus(); // Check and show onboarding if needed
    initializeUserProfile(); // Initialize user profile on load


    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const category = this.dataset.category;
            if (category === 'all') {
                displayDailyPicks();
            } else if (category === 'favorites') {
                displayFavorites(); // Display favorites directly
            }
             else {
                filterIdeas(category);
            }
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });

    searchButton.addEventListener('click', function() {
        const searchTerm = searchInput.value.trim();
        searchIdeas(searchTerm);
    });

    searchInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            searchButton.click();
            event.preventDefault();
        }
    });

    loadMoreButton.addEventListener('click', function() {
        renderIdeaCards(cardsLoadedCount, ideasPerLoad);
        updateLoadMoreButtonState();
    });
});