document.addEventListener('DOMContentLoaded', function() {
    // Get all elements
    const launchButtons = document.querySelectorAll('.launch-button');
    const secondaryButtons = document.querySelectorAll('.secondary-button');
    const modal = document.getElementById('experienceModal');
    const closeModal = document.querySelector('.close-modal');
    const modalBody = document.querySelector('.modal-body');
    const tiles = document.querySelectorAll('.tile');
    const tilesWrapper = document.querySelector('.tiles-wrapper');
    const body = document.body;
    const header = document.querySelector('header');
    const footer = document.querySelector('footer');
    const main = document.querySelector('main');
    const heroSection = document.querySelector('.hero-section');
    const tilesContainer = document.querySelector('.tiles-container');

    // --- MODIFICATION 1: Footer Behavior & Dynamic Resizing ---
    // const FOOTER_HEIGHT = 60; // Approximate footer height (will get actual height)
    const MIN_TILE_CONTAINER_HEIGHT = 350; // Minimum desired height for tiles

    function adjustLayout() {
        if (!header || !heroSection || !footer || !main || !tilesContainer) return;

        const windowHeight = window.innerHeight;
        const headerHeight = header.offsetHeight;
        const heroHeight = heroSection.offsetHeight;
        // Get actual footer height dynamically as it might change with responsiveness
        const footerHeight = footer.offsetHeight;

        // Set main's top/bottom padding to match fixed header/footer heights
        main.style.paddingTop = `${headerHeight}px`;
        main.style.paddingBottom = `${footerHeight}px`;

        // Calculate space available for the main content area (between header/footer)
        const availableMainHeight = windowHeight - headerHeight - footerHeight;

        // Calculate space available specifically for the tiles container (below hero)
        // Subtract a small buffer for margin/padding around tiles-container
        const buffer = 20; // Adjust as needed based on CSS margins/paddings
        const availableTileContainerHeight = availableMainHeight - heroHeight - buffer;

        if (availableTileContainerHeight < MIN_TILE_CONTAINER_HEIGHT) {
            // Not enough space for tiles AND footer, hide footer
            footer.style.visibility = 'hidden'; // Use visibility to keep space reserved initially
            footer.style.opacity = '0';
            // Re-calculate main padding bottom since footer is hidden
            main.style.paddingBottom = '10px'; // Minimal padding when footer hidden

        } else {
            // Enough space, show footer
            footer.style.visibility = 'visible';
            footer.style.opacity = '1';
            main.style.paddingBottom = `${footerHeight}px`; // Use actual height
        }

        // Ensure tiles container height adapts (CSS flex handles this mostly)
        // We don't strictly need to set tilesContainer.style.height here
        // if the flex layout (main > hero, tiles-container) is correct.
    }

    // Adjust layout on initial load and resize
    // Use requestAnimationFrame for smoother resize handling
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            requestAnimationFrame(adjustLayout);
        }, 100); // Debounce resize events slightly
    });

    // Initial adjustment after a short delay to ensure elements have rendered
    setTimeout(adjustLayout, 50);
    // --- END MODIFICATION 1 ---


    // --- MODIFICATION 2: Idle Animation ---
    let inactivityTimer;
    let sequenceInterval;
    let currentTileIndex = 0;
    let isMouseOverTile = false; // <-- Flag to track mouse hover on tiles
    const IDLE_TIMEOUT = 2000; // 2 seconds
    const SEQUENCE_INTERVAL_TIME = 1500; // 1.5 seconds per tile

    function stopTileSequence() {
        clearInterval(sequenceInterval);
        sequenceInterval = null;
        tiles.forEach(tile => tile.classList.remove('auto-highlight'));
        currentTileIndex = 0; // Reset index when stopped
    }

    // Function to start the sequence animation
    function startTileSequence() {
        stopTileSequence(); // Stop any previous sequence first

        // Guard clause: Don't start if modal is open, no tiles, or mouse is over a tile
        if (!modal || modal.style.display === 'flex' || tiles.length === 0 || isMouseOverTile) { // <-- Check hover flag
            return;
        }

        currentTileIndex = 0; // Always start from the left

        // Initial highlight
        if(tiles[currentTileIndex]) {
           tiles[currentTileIndex].classList.add('auto-highlight');
        }

        // Start interval
        sequenceInterval = setInterval(() => {
            // Guard clause inside interval: Stop if modal opened, no tiles, or mouse over tile
            if (!modal || modal.style.display === 'flex' || tiles.length === 0 || isMouseOverTile) { // <-- Check hover flag
                stopTileSequence();
                return;
            }

            // Remove highlight from current tile
            if(tiles[currentTileIndex]) {
                tiles[currentTileIndex].classList.remove('auto-highlight');
            }

            // Move to next tile
            currentTileIndex = (currentTileIndex + 1) % tiles.length;

            // Add highlight to new current tile
             if(tiles[currentTileIndex]) {
                tiles[currentTileIndex].classList.add('auto-highlight');
            }

        }, SEQUENCE_INTERVAL_TIME);
    }

    // Function to reset inactivity timer and stop sequence
    function resetInactivityTimer() {
        clearTimeout(inactivityTimer);
        stopTileSequence(); // Stop animation on any activity

        // Set timer to start sequence after IDLE_TIMEOUT of inactivity
        inactivityTimer = setTimeout(() => {
            // Check modal status *and hover status* before starting sequence
            if ((!modal || modal.style.display !== 'flex') && !isMouseOverTile) { // <-- Check hover flag
                 startTileSequence();
            }
        }, IDLE_TIMEOUT);
    }

    // --- MODIFICATION 2: Add hover tracking listeners to tiles ---
    tiles.forEach(tile => {
        tile.addEventListener('mouseenter', () => {
            isMouseOverTile = true;
            // Entering a tile is activity, reset timer (which also stops sequence)
            resetInactivityTimer();
        });
        tile.addEventListener('mouseleave', () => {
            isMouseOverTile = false;
            // Leaving a tile *also* resets the timer.
            // The idle period starts *after* the mouse leaves.
            resetInactivityTimer();
        });
    });
    // --- END MODIFICATION 2 HOVER TRACKING ---


    // Experience data - (Keep as is)
    const experienceData = [
        {
            title: "Google",
            description: "Leading subscription growth (Nest Aware, Fitbit Premium, Google One) and logistics projects at Google Store.",
            tech: ["APM at Google Store", "SWE Intern in Cloud Security", "STEP Intern in Core Privacy"],
            details: "I've spent the last 8 months on the Google Store team where I lead the growth of Nest Aware, Fitbit Premium, and Google One. Additionally, I help out with projects in reverse logistics, retail, and customer support. In this role, I helped set the Google-wide product standard for compliance to FTC subscription laws, collaborated closely with the Fitbit team on their new upcoming subscription-first tracker, and overhauled the site's returns flow (currently in Dogfood). Prior to starting as an APM, I completed two engineering internships where I worked on resource optimization algorithms and distributed ingestion systems.",
            links: [
                { text: "Returns Flow", url: "https://go/online-mlr-mvp",  icon: "fa-file-alt" },
                { text: "New Fitbit Tracker", url: "https://go/radiance-on-gstore-prd",  icon: "fa-file-alt" },
                { text: "FTC Compliance", url: "https://go/gstore-subs-compliance-prd",  icon: "fa-file-alt" }
            ],
            image: "images/gstore.jpg",
            color: "#f4ce1b"
        },
        {
            title: "APM Program",
            description: "Founded the APM Startup Circle, leading the Alumni Database project, and coordinating company visits.",
            tech: ["Startup Circle", "Alumni Database", "Trip Planning"],
            details: "I founded the APM Startup Circle, a community within the APM program (~20 APMs) who are interested in startups. We share knowledge with each other, host events with early-stage investors, learn from founders, and read books together. I also am the lead for the APM Alumni Database. For this project, I built multiple scrapers to try to continuously collect data from Linkedin, at one point even using public library computers. I am know working on a partnership with a YC company to launch a semantic search website for our program alum. Finally, I am helping coordinate APM company visits to Mercor, Scale, Hebbia, Hugging Face, and more.",
            links: [],
            color: "#5c88a1"
        },
        {
            title: "Northwestern",
            description: "Graduated Cum Laude with a BA in Computer Science & Legal Studies, won WildHacks, and led Club Volleyball.",
            tech: ["Computer Science", "Legal Studies", "WildHacks Winner", "Club Volleyball President"],
            details: "I graduated Cum Laude from Northwestern in June 2024. I majored in Computer Science and took several software engineering and machine learning courses. I also took many history, philosophy, economics, and law courses that culminated in a Legal Studies minor. In 2023, I won our university's hackathon with a peer-to-peer mental health coaching service. On campus, I was heavily involved with Club Volleyball, AKPsi (professional fraternity), and in watching every basketball game religiously.",
            links: [
            ],
            image: "images/wildhacks.jpg",
            color: "#5f6fc9"
        },
        {
            title: "Current Projects",
            description: "Developing AI tools for TOEFL essay grading, customer support, and constituent engagement.",
            tech: ["TOEFL Essay Grading", "Customer Support Agent", "Constituent Engagement Agent"],
            details: "I am currently working on an essay grading tool, specific to the TOEFL exam, specialized for tutors in Korea. As the grading criteria for standardized essays is pretty consistent, LLMs + RAG can reliably generate helpful feedback. I also built a customer support agent to learn how to work with multi-agent systems (system diagram below). The process of building for the support use case inspired me to explore a similar solution but for the way that members of congress engage with their constituents.",
            links: [],
            image: "images/system_diagram.jpg",
            color: "#f4a9d8"
        },
        {
            title: "Inbound",
            description: "Founded and led product development for an HR software startup connecting diverse students with companies.",
            tech: ["Founder & Product Lead"],
            details: "During college, I founded a startup that helped companies hire students in specific diversity-oriented student orgnizations for internships and full-time jobs. I led the development of the student platform and the recruiter platform. Additionally, I managed partnerships with student organizations, companies, and universities. I grew the team from just me and my roommate to 10 people.",
            links: [],
            image: "images/inbound.png",
            color: "#506B57"
        },
        {
            title: "Startup Internships",
            description: "Interned in engineering, product, and customer success at startups; participated in Techstars & Bessemer programs.",
            tech: ["Soundskrit", "Onaroll", "Techstars", "Bessemer Venture Partners"],
            details: "My freshman year, I interned at Soundskrit, a startup developing directional MEMS microphone sensors, as an engineering and product intern. I designed D2C use cases and built software to automated electrical and acoustic testing. The picture below is a close-up of one our sensors and it has my name on it! In my junior year, I interned at Onaroll, an employee rewards startup, as a customer success intern. I led a team of 10 support agents in Manila and built the support center. In addition to working at startups, I also interned at the Techstars startup accelerator and was part of the 2023 Bessemer Venture Partners Fellowship class.",
            links: [],
            image: "images/soundskrit.png",
            color: "#A8714C"
        },
        {
            title: "Hobbies",
            description: "Passionate about playing/coaching volleyball, fitness, wellness, meditation, and traveling.",
            tech: ["Volleyball", "Fitness", "Travel", "Meditation"],
            details: "In my free time, I love to play and coach volleyball! I've been playing since I was 11 and it's a core part of my life. I also love anything wellness related, including going to the gym and meditating. I really enjoy seeing the world as well; my favorite recent trip was to Buenos Aires!",
            links: [],
            image: "images/dss.jpg",
            color: "#6A7645"
        },
        {
            title: "Books",
            description: "An avid reader enjoying both nonfiction and fiction, sharing favorite reads from the year.",
            tech: ["Steve Jobs", "The Devil in the White City", "When Breath Becomes Air", "Flowers for Algernon"],
            details: "I love to read. I typically enjoy reading nonfiction but am getting more into fiction / classics lately. Below are my favorite books I've read this year!",
            links: [],
            color: "#654C5D"
        }
    ];

    // Variables for drag scrolling
    let isDown = false;
    let startX;
    let scrollLeft;
    let hasDragged = false; // Flag to distinguish drag from click

    // Add event listeners for user activity (triggering idle timer reset)
    // Consolidate listeners where possible
    ['mousemove', 'mousedown', 'click', 'keydown', 'scroll', 'touchstart', 'touchmove'].forEach(event => {
        document.addEventListener(event, resetInactivityTimer, { capture: true, passive: true });
    });

    // Initialize inactivity timer when page loads
    resetInactivityTimer();


    // Precise drag scrolling implementation
    tilesWrapper.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return; // Only left clicks
        isDown = true;
        hasDragged = false; // Reset drag flag
        tilesWrapper.classList.add('active-drag'); // Use class for styling
        startX = e.pageX - tilesWrapper.offsetLeft;
        scrollLeft = tilesWrapper.scrollLeft;
        tilesWrapper.style.scrollBehavior = 'auto';
    });

    tilesWrapper.addEventListener('mouseleave', () => {
        if (!isDown) return;
        isDown = false;
        tilesWrapper.classList.remove('active-drag');
        tilesWrapper.style.scrollBehavior = 'smooth';
    });

    tilesWrapper.addEventListener('mouseup', (e) => {
        if (!isDown) return;
        isDown = false;
        tilesWrapper.classList.remove('active-drag');
        tilesWrapper.style.scrollBehavior = 'smooth';
        // Now check hasDragged flag in the click handler below
    });

    tilesWrapper.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault(); // Prevent text selection etc. *only* when dragging
        hasDragged = true; // Set flag if mouse moves while down
        const x = e.pageX - tilesWrapper.offsetLeft;
        const walk = (x - startX) * 1.5; // Adjust multiplier as needed
        tilesWrapper.scrollLeft = scrollLeft - walk;
    });

    // Touch support for mobile devices
    tilesWrapper.addEventListener('touchstart', (e) => {
        isDown = true;
        hasDragged = false; // Reset drag flag
        startX = e.touches[0].pageX - tilesWrapper.offsetLeft;
        scrollLeft = tilesWrapper.scrollLeft;
        tilesWrapper.style.scrollBehavior = 'auto';
    }, { passive: true });

    tilesWrapper.addEventListener('touchend', () => {
        if (!isDown) return;
        isDown = false;
        tilesWrapper.style.scrollBehavior = 'smooth';
    });

    tilesWrapper.addEventListener('touchcancel', () => {
         if (!isDown) return;
        isDown = false;
        tilesWrapper.style.scrollBehavior = 'smooth';
    });

    tilesWrapper.addEventListener('touchmove', (e) => {
        if (!isDown) return;
        hasDragged = true; // Set flag if touch moves
        const x = e.touches[0].pageX - tilesWrapper.offsetLeft;
        const walk = (x - startX) * 1.5;
        tilesWrapper.scrollLeft = scrollLeft - walk;
    }, { passive: true });

    // Modal handling
    launchButtons.forEach((button, index) => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            openExperienceModal(index);
            // resetInactivityTimer(); // Handled globally
        });
    });

    // Tile click handling (distinguish from drag)
    tiles.forEach((tile, index) => {
        tile.addEventListener('click', (e) => {
            // Only open modal if it wasn't a drag action and not clicking a button/link
            if (!hasDragged && !e.target.closest('button, a')) {
                openExperienceModal(index);
            }
            // Reset hasDragged after click processing is done
            hasDragged = false;
            // resetInactivityTimer(); // Handled globally
        });
        // Hover listeners moved up for idle animation logic
    });


    // Secondary button handling (if you have any)
    secondaryButtons.forEach((button) => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log("Secondary button clicked");
            // resetInactivityTimer(); // Handled globally
        });
    });

    // Close modal when X is clicked
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            closeExperienceModal();
            // resetInactivityTimer(); // Handled globally
        });
    }

    // Close modal when clicking outside content
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeExperienceModal();
                // resetInactivityTimer(); // Handled globally
            }
        });
    }

    // Close modal with escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.style.display === 'flex') {
            closeExperienceModal();
            // resetInactivityTimer(); // Handled globally
        }
    });

 // Open modal function
 function openExperienceModal(index) {
    stopTileSequence(); // Stop sequence when modal opens
    clearTimeout(inactivityTimer); // Prevent sequence starting right after

    if (!modal || !modalBody || index < 0 || index >= experienceData.length) return;
    const experience = experienceData[index];

    // Build modal HTML
    let modalHTML = `
        <h2 style="color: ${experience.color}">${experience.title}</h2>
        <p>${experience.details}</p>
        <div class="tech-stack">
            ${experience.tech.map(tech => `<span class="tech-item">${tech}</span>`).join('')}
        </div>
        ${experience.image ? `<img src="${experience.image}" alt="${experience.title} screenshot">` : ''}
        <div class="links">
            ${experience.links.map(link =>
                // --- MODIFICATION HERE ---
                `<a href="${link.url}" target="_blank" rel="noopener noreferrer" style="color: ${experience.color}">` +
                    `<i class="fas ${link.icon}"></i> ${link.text}` +
                `</a>`
                // --- END MODIFICATION ---
            ).join('')}
        </div>
    `;
    modalBody.innerHTML = modalHTML;

    modal.style.opacity = '0';
    modal.style.display = 'flex';
    setTimeout(() => modal.style.opacity = '1', 10);
    document.body.style.overflow = 'hidden';
}

    // Close modal function
    function closeExperienceModal() {
        if (!modal) return;
        modal.style.opacity = '0';

        function transitionEndHandler() {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            modal.removeEventListener('transitionend', transitionEndHandler);
            resetInactivityTimer(); // Restart idle timer check after closing
        }

        modal.addEventListener('transitionend', transitionEndHandler, { once: true });

        // Fallback timeout
        setTimeout(() => {
            if (modal.style.opacity === '0') {
                transitionEndHandler(); // Manually trigger if transitionend didn't fire
            }
        }, 350);
    }

    // Default profile image fallback (unchanged)
    function createDefaultProfileImage() {
        const img = document.querySelector('.profile-photo img');
        if (!img) return;
        img.onerror = function() { /* ... rest of function is unchanged ... */
            console.log("Profile image failed to load, creating fallback.");
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                console.error("Canvas context not supported for fallback image.");
                return;
            }
            canvas.width = 200; canvas.height = 200;
            ctx.fillStyle = '#4285f4';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'white';
            ctx.font = 'bold 100px Google Sans, Arial';
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText('YP', canvas.width / 2, canvas.height / 2);
            try {
                this.src = canvas.toDataURL('image/png');
                this.onerror = null;
            } catch (e) {
                console.error("Error creating fallback image data URL:", e);
                this.style.display = 'none';
            }
        };
        if (img.complete && img.naturalHeight === 0) {
            img.dispatchEvent(new Event('error'));
        }
    }

    createDefaultProfileImage();

});