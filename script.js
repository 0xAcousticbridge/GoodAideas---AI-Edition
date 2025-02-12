document.addEventListener('DOMContentLoaded', function () {
    const ideaFeed = document.getElementById('idea-feed');
    const filterButtons = document.querySelectorAll('.filter-button');
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const loadMoreButton = document.getElementById('load-more-button');
    const loadMoreContainer = document.getElementById('load-more-container');

    // Expanded GoodAidea card data WITH averageRating
    const allGoodAideas = [
        {
            title: "AI Sleep Soundscapes for Deeper Rest",
            category: "Health & Wellness",
            explanation: "Struggling to sleep? AI apps can generate personalized soundscapes that adapt to your sleep patterns, blocking out distractions and promoting relaxation.",
            howToUse: "1. Search for 'AI sleep sound app' in your app store. 2. Try a few free options. 3. Use nightly & track sleep.",
            averageRating: 4.5
        },
        {
            title: "AI Spending Tracker for Smart Budgeting",
            category: "Finance",
            explanation: "Want to understand where your money goes? AI spending tracker apps automatically categorize your transactions, giving you clear insights for better budgeting.",
            howToUse: "1. Download an 'AI spending tracker app.' 2. Link bank accounts securely. 3. Review spending reports.",
            averageRating: 4.2
        },
        {
            title: "AI Meeting Summarizer - Reclaim Your Time",
            category: "Productivity",
            explanation: "Meeting overload? AI meeting summarizers transcribe and summarize meetings, so you can quickly catch up and save hours of review time.",
            howToUse: "1. Search for 'AI meeting summarizer app/extension'. 2. Integrate with calendar. 3. Review AI summaries.",
            averageRating: 3.8
        },
        {
            title: "AI Food Scanner for Calorie Awareness",
            category: "Health & Wellness",
            explanation: "Curious about calories? Some AI apps can estimate calories in your meals just by scanning a photo of your food, helping you make healthier choices.",
            howToUse: "1. Download an 'AI food scanner app.' 2. Take photos of your meals before you eat. 3. Use calorie estimates as a guide.",
            averageRating: 3.5
        },
        {
            title: "AI-Driven Bill Negotiation",
            category: "Finance",
            explanation: "Overpaying on bills? AI services negotiate lower rates with providers (cable, internet, etc.), saving you money.",
            howToUse: "1. Search for 'AI bill negotiation service.' 2. Sign up & connect bill accounts. 3. Let AI negotiate savings.",
            averageRating: 4.7
        },
        {
            title: "AI 'Spare Change' Investing",
            category: "Finance",
            explanation: "Investing made easy! AI 'spare change' apps round up purchases and invest the difference, making investing effortless.",
            howToUse: "1. Search for 'AI spare change investing app.' 2. Link bank account & set goals. 3. Watch small investments grow.",
            averageRating: 4.0
        },
        {
            title: "AI-Enhanced To-Do Lists",
            category: "Productivity",
            explanation: "Overwhelmed by tasks? AI to-do list apps prioritize tasks based on deadlines, importance, and your work patterns.",
            howToUse: "1. Try an 'AI to-do list app.' 2. Input tasks & deadlines. 3. Let AI prioritize your list.",
            averageRating: 3.9
        },
        {
            title: "AI Email Sorter - Inbox Zero",
            category: "Productivity",
            explanation: "Drowning in emails? AI email sorters filter and prioritize your inbox, separating important messages from clutter.",
            howToUse: "1. Search for 'AI email sorter app.' 2. Connect email account. 3. Focus on priority emails.",
            averageRating: 4.3
        },
        {
            title: "AI Posture Reminder",
            category: "Health & Wellness",
            explanation: "Slouching at your desk? AI posture apps use your webcam to monitor posture and remind you to sit up straight.",
            howToUse: "1. Search for 'AI posture app' for computer. 2. Install & grant webcam access. 3. Adjust sensitivity.",
            averageRating: 3.2
        },
        {
            title: "AI-Powered Language Learning",
            category: "Productivity",
            explanation: "Want to learn a new language? AI language learning apps personalize lessons and provide real-time feedback for faster progress.",
            howToUse: "1. Explore 'AI language learning apps' (Duolingo, Babbel, etc. now use AI). 2. Choose a language & start learning. 3. Practice daily.",
            averageRating: 4.6
        },
        {
            title: "AI-Based Recipe Recommendations",
            category: "Health & Wellness",
            explanation: "Stuck in a cooking rut? AI recipe apps suggest recipes based on your diet, ingredients, and preferences, making meal planning easier.",
            howToUse: "1. Search for 'AI recipe app'. 2. Input diet & preferences. 3. Discover new recipes.",
            averageRating: 4.1
        },
        {
            title: "AI Financial Goal Setting",
            category: "Finance",
            explanation: "Need help with financial goals? AI financial planning apps can help you set realistic savings and investment targets based on your income and expenses.",
            howToUse: "1. Try an 'AI financial planning app'. 2. Link financial accounts. 3. Define your financial goals.",
            averageRating: 3.7
        },
        {
            title: "AI Travel Planner - Personalized Itineraries",
            category: "Productivity",
            explanation: "Planning a trip? AI travel planners create custom itineraries based on your interests, budget, and travel style, saving you planning time.",
            howToUse: "1. Search for 'AI travel planner'. 2. Input destination & preferences. 3. Review personalized itinerary.",
            averageRating: 4.4
        },
        {
            title: "AI Plant Identifier - Green Thumb Guide",
            category: "Health & Wellness",
            explanation: "Unsure what plant that is? AI plant identifier apps can identify plants from photos, giving you care tips and info.",
            howToUse: "1. Download an 'AI plant identifier app'. 2. Take a photo of the plant. 3. Get plant info & care advice.",
            averageRating: 3.6
        },
        {
            title: "AI-Powered News Summarizer - Stay Informed Efficiently",
            category: "Productivity",
            explanation: "Too much news? AI news summarizer apps provide concise summaries of news articles, helping you stay informed in less time.",
            howToUse: "1. Search for 'AI news summarizer app/extension'. 2. Select news sources. 3. Read AI summaries.",
            averageRating: 4.0
        },
        {
            title: "AI Grammar & Style Checker - Polish Your Writing",
            category: "Productivity",
            explanation: "Want to improve your writing? AI grammar and style checkers go beyond basic spellcheck, offering advanced suggestions for clarity and tone.",
            howToUse: "1. Use an 'AI grammar checker' (Grammarly, ProWritingAid, etc.). 2. Write or paste text. 3. Review originality report.",
            averageRating: 4.8
        },
        {
            title: "AI-Generated Workout Plans - Personalized Fitness",
            category: "Health & Wellness",
            explanation: "Need a workout routine? AI fitness apps create personalized workout plans based on your fitness level, goals, and available equipment.",
            howToUse: "1. Search for 'AI workout app'. 2. Input fitness level & goals. 3. Follow AI-generated workout plan.",
            averageRating: 3.3
        },
        {
            title: "AI Recipe Improviser - Get Creative in the Kitchen",
            category: "Health & Wellness",
            explanation: "Limited ingredients? AI recipe improviser apps suggest recipes based on what you have in your pantry, reducing food waste.",
            howToUse: "1. Search for 'AI recipe improviser'. 2. Input available ingredients. 3. Discover recipes you can make now.",
            averageRating: 4.5
        },
        {
            title: "AI-Powered Presentation Maker - Slides in Minutes",
            category: "Productivity",
            explanation: "Dreading presentations? AI presentation tools can generate slide decks from text outlines, saving you design time.",
            howToUse: "1. Explore 'AI presentation maker' tools (Beautiful.ai, Tome, etc.). 2. Input outline or text. 3. Customize AI-generated slides.",
            averageRating: 4.9
        },
        {
            title: "AI Voice-to-Text for Note Taking - Capture Ideas Fast",
            category: "Productivity",
            explanation: "Taking notes in meetings or lectures? AI voice-to-text apps transcribe speech to text in real-time, making note-taking hands-free.",
            howToUse: "1. Use an 'AI voice-to-text app' (Otter.ai, Google Live Transcribe). 2. Open app & start speaking. 3. Review transcribed notes.",
            averageRating: 4.4
        },
         {
            title: "AI-Driven Investment Recommendations",
            category: "Finance",
            explanation: "Making investment decisions? AI investment advisor apps analyze market data and suggest investment portfolios based on your risk tolerance and financial goals.",
            howToUse: "1. Search for 'AI investment advisor app'. 2. Link investment accounts & set goals. 3. Review AI-powered recommendations.",
            averageRating: 3.9
        },
        {
            title: "AI-Powered Resume Builder - Land Your Dream Job",
            category: "Productivity",
            explanation: "Job searching? AI resume builders help you create professional resumes optimized for applicant tracking systems (ATS) and highlight your skills effectively.",
            howToUse: "1. Try an 'AI resume builder' (Resume.io, Kickresume, etc.). 2. Input your experience & skills. 3. Download optimized resume.",
            averageRating: 4.7
        },
        {
            title: "AI-Based Plagiarism Checker - Ensure Originality",
            category: "Productivity",
            explanation: "Writing important documents? AI plagiarism checkers scan your text against vast databases to ensure originality and proper citation.",
            howToUse: "1. Use an 'AI plagiarism checker' (Quetext, Copyscape, etc.). 2. Paste your text. 3. Review originality report.",
            averageRating: 3.4
        },
        {
            title: "AI-Enhanced Photo Editor - Pro-Level Image Editing",
            category: "Productivity",
            explanation: "Need to edit photos? AI photo editors offer powerful features like background removal, object manipulation, and style transfer, often with one-click ease.",
            howToUse: "1. Explore 'AI photo editor apps' (Phonto, Pixlr, etc.). 2. Upload photo & select AI editing features. 3. Download enhanced image.",
            averageRating: 4.2
        },
        {
            title: "AI-Personalized Meditation - Find Your Inner Peace",
            category: "Health & Wellness",
            explanation: "Want to start meditating? AI meditation apps personalize meditation sessions based on your mood, stress levels, and experience, making mindfulness accessible.",
            howToUse: "1. Search for 'AI meditation app'. 2. Input mood & experience level. 3. Start personalized meditation session.",
            averageRating: 4.6
        },
        {
            title: "AI-Powered Financial Checkup - Understand Your Finances",
            category: "Finance",
            explanation: "Need a financial health check? AI financial checkup apps analyze your financial data and provide insights into your spending, saving, and investment habits.",
            howToUse: "1. Try an 'AI financial checkup app'. 2. Link financial accounts securely. 3. Review AI financial health report.",
            averageRating: 4.1
        }
    ];

    let displayedIdeas =;
    const ideasPerLoad = 5;
    let cardsLoadedCount = 0;
    let currentFilter = 'all';
    let currentSearchTerm = '';

    // --- Local Storage Keys ---
    const ratingsLocalStorageKey = 'goodAideasRatings';
    const commentsLocalStorageKey = 'goodAideasComments'; // New key for comments


    // --- Daily Picks Logic ---
    let dailyPickIndices =;
    const dailyPickCount = 2;

    function generateDailyPickIndices() {
        const indices =;
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
    // --- End Daily Picks Logic ---


    function createGoodAideaCard(idea, isDailyPick = false) {
        const cardDiv = document.createElement('div');
        cardDiv.classList.add('good-aidea-card');
        if (isDailyPick) {
            cardDiv.classList.add('daily-pick'); // Add 'daily-pick' class for styling
        }

        // --- Category Badge ---
        const categoryBadge = document.createElement('span');
        categoryBadge.classList.add('card-category-badge'); // New class for badge
        categoryBadge.textContent = idea.category;
        cardDiv.appendChild(categoryBadge);
        // --- End Category Badge ---


        const categorySpan = document.createElement('span'); // Keep for filter functionality - can hide visually if needed
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
        // Directly use idea.title as key and ensure default is 0 if not found
        currentRating = storedRatings[idea.title]!== undefined? parseInt(storedRatings[idea.title], 10): 0;


        for (let i = 1; i <= 5; i++) {
            const starIcon = document.createElement('span');
            starIcon.classList.add('star-icon');
            starIcon.innerHTML = '&#9734;';

            starIcon.addEventListener('click', function() {
                let rating = i; // Use a block-scoped variable
                currentRating = rating;
                highlightStars(ratingContainer, currentRating);
                // Save rating to local storage using idea.title as key
                saveRatingToLocalStorage(idea.title, rating);
                console.log(`Rated ${idea.title} with ${rating} stars (saved to local storage).`);

                // --- Star Animation ---
                starIcon.classList.add('star-animated'); // Add animation class
                setTimeout(() => { // Remove class after animation duration
                    starIcon.classList.remove('star-animated');
                }, 300); // Duration should match CSS animation
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
        // Directly use idea.title as key, default to empty array if not found
        const ideaComments = storedComments[idea.title] ||;
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

                // Save comment to local storage, using idea.title as key
                saveCommentToLocalStorage(idea.title, commentText);
                console.log(`Comment submitted for ${idea.title}: ${commentText} (saved to local storage).`);
            }
        });
        // --- End Comment Section ---


        // --- Initial star highlighting (user rating) ---
        highlightStars(ratingContainer, currentRating);


        // cardDiv.appendChild(categorySpan); // Original category span - now hidden
        cardDiv.appendChild(titleElement);
        cardDiv.appendChild(explanationElement);
        cardDiv.appendChild(howToUseElement);
        cardDiv.appendChild(callToActionElement);
        cardDiv.appendChild(ratingContainer);
        cardDiv.appendChild(averageRatingContainer);
        cardDiv.appendChild(averageRatingStarsContainer);