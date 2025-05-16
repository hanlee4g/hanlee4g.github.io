// IMPORTANT: You need to import the GoogleGenerativeAI class
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "https://esm.run/@google/generative-ai";

document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    const genreButtons = document.querySelectorAll('.genre-button');
    const inspirationContentDiv = document.getElementById('inspiration-content');

    const apiKeyInputContainer = document.querySelector('.api-key-input-container');
    const apiKeyInput = document.getElementById('apiKey');
    const saveApiKeyButton = document.getElementById('saveApiKey');
    const apiKeyStatus = document.getElementById('apiKeyStatus');
    let GEMINI_API_KEY = localStorage.getItem('geminiApiKeyReubenDemo');

    if (!GEMINI_API_KEY) {
        apiKeyInputContainer.style.display = 'block';
        apiKeyStatus.textContent = "Please enter your Gemini API Key.";
    } else {
        apiKeyInput.value = GEMINI_API_KEY;
        apiKeyStatus.textContent = "API Key loaded from storage.";
    }

    saveApiKeyButton.addEventListener('click', () => {
        const key = apiKeyInput.value.trim();
        if (key) {
            GEMINI_API_KEY = key;
            localStorage.setItem('geminiApiKeyReubenDemo', key);
            apiKeyStatus.textContent = "API Key saved! You might need to reload.";
            apiKeyInputContainer.style.display = 'none';
            initializeGemini();
        } else {
            apiKeyStatus.textContent = "Please enter a valid API Key.";
        }
    });

    let genAI;
    let model; // This will be our primary model for song analysis and copyright check

    function initializeGemini() {
        if (GEMINI_API_KEY && !genAI) {
            try {
                genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
                model = genAI.getGenerativeModel({
                    model: "gemini-1.5-flash-latest",
                    // Optional: Configure safety settings if default is too restrictive or not enough
                    // safetySettings: [
                    //   { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                    //   { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                    //   { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                    //   { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                    // ],
                });
                console.log("Gemini AI Initialized with model:", model.model);
                apiKeyStatus.textContent = "Gemini AI Initialized.";
                apiKeyInputContainer.style.display = 'none';
                return true;
            } catch (error) {
                console.error("Error initializing Gemini AI:", error);
                apiKeyStatus.textContent = `Error initializing Gemini: ${error.message}. Check console.`;
                apiKeyInputContainer.style.display = 'block';
                GEMINI_API_KEY = null;
                localStorage.removeItem('geminiApiKeyReubenDemo');
                genAI = null; model = null;
                return false;
            }
        } else if (!GEMINI_API_KEY) {
            apiKeyStatus.textContent = "Gemini API Key not set. Please set it to use Inspiration tab.";
            apiKeyInputContainer.style.display = 'block';
            return false;
        } else if (genAI && model) {
            return true;
        }
        return false;
    }

    let inspirationData = [];
    let inspirationLoaded = false;
    let selectedInspirationItem = null;
    let selectedGenreButton = null;

    const audioFiles = [
        "song1.mp3", "song2.mp3", "song3.mp3", "song4.mp3", "song5.mp3"
    ];

    function shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }

    function blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    async function analyzeSongWithGemini(audioFileBlob, fileName) {
        console.log(`[analyzeSongWithGemini] Called for: ${fileName}, blob size: ${audioFileBlob.size}`);
        if (!model) throw new Error("Gemini model not initialized.");

        const base64Audio = await blobToBase64(audioFileBlob);
        const generationPrompt = `
            Analyze the following audio music file.
            Describe its key musical characteristics such as tempo (e.g., slow, mid-tempo, fast, very fast),
            primary genre influences (e.g., pop, rock, jazz, electronic, folk, classical, hip-hop, R&B, etc.),
            overall mood or emotion it evokes (e.g., melancholic, joyful, energetic, relaxing, intense, dreamy),
            and prominent instrumentation (e.g., acoustic guitar, electric guitar, piano, synths, drums, strings, brass, specific percussive elements).
            Also describe the general vibe or feeling it creates (e.g., good for studying, dancing, a road trip, a quiet evening).
            The description should be suitable as a prompt for an AI music generation model to create a *similar sounding* new piece of music.
            IMPORTANT: Do NOT mention any real-world artist's name, song title, or any specific recognizable lyrics from any song.
            Focus solely on the musical and stylistic qualities. Keep the description concise, ideally one paragraph.
            Example of good output: "An upbeat electronic pop track with a driving synth bassline, shimmering pads, and a four-on-the-floor drum beat. It has a joyful, energetic mood, perfect for a summer festival vibe. Features prominent vocal chops and layered synth melodies."
            Now analyze the provided audio.
        `;
        const audioPart = { inlineData: { data: base64Audio, mimeType: 'audio/mpeg' } };

        try {
            const result = await model.generateContent([generationPrompt, audioPart]);
            const response = result.response;
            const text = response.text();
            console.log(`[analyzeSongWithGemini] Gemini raw response for ${fileName}: "${text.substring(0, 70)}..."`);
            return text;
        } catch (error) {
            console.error(`Error analyzing ${fileName} with Gemini:`, error);
            let errorMessage = error.message;
            if (error.response?.candidates?.[0]?.finishReason) {
                errorMessage += ` Finish Reason: ${error.response.candidates[0].finishReason}`;
                if(error.response.candidates[0].safetyRatings) {
                    errorMessage += ` Safety Ratings: ${JSON.stringify(error.response.candidates[0].safetyRatings)}`;
                }
            } else if (error.statusInfo) {
                 errorMessage = `${error.statusInfo.message} (Code: ${error.statusInfo.code})`;
            }
            throw new Error(`Failed to analyze ${fileName}. Gemini API Error: ${errorMessage}`);
        }
    }

    async function checkForCopyrightViolations(generatedPrompt, originalFileName) {
        console.log(`[checkForCopyrightViolations] Checking prompt for ${originalFileName}: "${generatedPrompt.substring(0,70)}..."`);
        if (!model) throw new Error("Gemini model not initialized for copyright check.");

        const checkerPrompt = `
You are a copyright detection assistant. Your task is to analyze the following text, which is a description of a piece of music, and determine if it contains any of the following:
1. The specific name of any real-world musical artist or band (e.g., "Taylor Swift", "The Beatles").
2. The specific title of any real-world song or album (e.g., "'Bohemian Rhapsody'", "'Thriller' album").
3. Any direct quotes of specific, recognizable lyrics from a real-world song (e.g., "lyrics 'Is this the real life?'").

Do not be overly sensitive to common words or generic phrases that *might* be part of a title or lyric if used generally. Only flag clear, specific, and identifiable mentions.
For example:
- Input: "Sounds like a Taylor Swift song." -> Output: VIOLATION_DETECTED
- Input: "Has a vibe similar to 'Bohemian Rhapsody'." -> Output: VIOLATION_DETECTED
- Input: "Includes the lyrics 'Yesterday, all my troubles seemed so far away'." -> Output: VIOLATION_DETECTED
- Input: "A powerful rock ballad with Queen-like harmonies." -> Output: NO_VIOLATION (descriptive, not specific title/name)
- Input: "Features a catchy chorus and a memorable guitar solo." -> Output: NO_VIOLATION (generic terms)
- Input: "The song mentions feeling 'happy'." -> Output: NO_VIOLATION (common word, not specific lyric quote unless very unique)

Analyze the following text:
---
${generatedPrompt}
---

Respond with ONLY ONE of the following lines:
NO_VIOLATION
VIOLATION_DETECTED
        `;
        try {
            const result = await model.generateContent(checkerPrompt);
            const response = result.response;
            const decision = response.text().trim();
            console.log(`[checkForCopyrightViolations] Decision for ${originalFileName}: ${decision}`);
            return decision === "VIOLATION_DETECTED";
        } catch (error) {
            console.error(`Error during copyright check for prompt from ${originalFileName}:`, error);
            // If the checker fails, it's safer to assume a potential violation or signal an error.
            // For this demo, let's log and treat as "no violation" to not block too much,
            // but in production, you might want to handle this error more strictly.
            return false; // Or throw error to be caught upstream
        }
    }

    async function getTrendingPromptsFromAudio() {
        if (!initializeGemini()) {
            return audioFiles.slice(0, Math.min(3, audioFiles.length)).map(fileName => ({
                type: 'trending', promptText: `Could not analyze ${fileName}. Gemini API Key issue.`, originalFile: fileName
            }));
        }

        const shuffledFiles = shuffleArray(audioFiles);
        const filesToProcessCount = Math.min(3, shuffledFiles.length);
        const selectedFiles = shuffledFiles.slice(0, filesToProcessCount);
        console.log("Selected files for analysis:", selectedFiles);

        inspirationContentDiv.innerHTML = `<div class="loading-message">Fetching songs and passing through Gemini 1.5 Flash...</div>`;

        let validPrompts = [];
        let filesAttempted = 0;
        let currentFileIndex = 0; // To pick next song from shuffled list if one fails copyright

        // Try to get up to `filesToProcessCount` valid prompts
        while (validPrompts.length < filesToProcessCount && filesAttempted < shuffledFiles.length) {
            if (currentFileIndex >= shuffledFiles.length) break; // No more unique files to try

            const fileName = shuffledFiles[currentFileIndex];
            filesAttempted++;
            currentFileIndex++;

            console.log(`[MAP-LIKE] Attempting to process file: ${fileName} (Attempt ${filesAttempted})`);
            try {
                const response = await fetch(`audio/${fileName}`);
                if (!response.ok) {
                    console.error(`[MAP-LIKE-ERROR] Failed to fetch ${fileName}`);
                    // Skip this file, don't add to validPrompts
                    continue;
                }
                const audioBlob = await response.blob();
                console.log(`[MAP-LIKE] Fetched ${fileName}, size: ${audioBlob.size}. Calling analyzeSongWithGemini.`);
                const description = await analyzeSongWithGemini(audioBlob, fileName);

                inspirationContentDiv.innerHTML = `<div class="loading-message">Checking '${fileName}' prompt for copyright... (${validPrompts.length + 1}/${filesToProcessCount})</div>`;
                const isViolation = await checkForCopyrightViolations(description, fileName);

                if (isViolation) {
                    console.warn(`[COPYRIGHT] Violation detected for prompt from ${fileName}. Discarding.`);
                    // Don't add to validPrompts, loop will continue to try next file
                } else {
                    console.log(`[COPYRIGHT] No violation for prompt from ${fileName}. Adding to list.`);
                    validPrompts.push({ type: 'trending', promptText: description, originalFile: fileName });
                }
            } catch (error) {
                console.error(`[MAP-LIKE-CATCH] Error processing ${fileName}:`, error);
                // Don't add to validPrompts, loop will continue
            }
        }
        console.log("Final valid prompts after copyright check:", validPrompts);
        return validPrompts;
    }


    const popularInspirationsData = [
        // ... (your existing popular mock data remains the same)
        {
            type: 'popular',
            promptText: "An upbeat synthwave track with a driving beat, ethereal pads, and a retro 80s vibe, perfect for late-night drives.",
            friends: ["10", "25", "30"],
            others: 1352
        },
        {
            type: 'popular',
            promptText: "A melancholic acoustic folk song featuring gentle fingerpicked guitar, a haunting cello melody, and soft, breathy vocals.",
            friends: ["40", "55", "60"],
            others: 876
        },
        {
            type: 'popular',
            promptText: "High-energy trap beat with heavy 808s, crisp hi-hats, and a catchy flute melody, ideal for a workout playlist.",
            friends: ["70", "10", "40"],
            others: 2103
        }
    ];

    async function loadInspirationContent() {
        if (!GEMINI_API_KEY && !initializeGemini()) {
             inspirationContentDiv.innerHTML = '<div class="loading-message">Please set your Gemini API Key above to load inspirations.</div>';
             inspirationLoaded = false; return;
        }
        if (!model && !initializeGemini()) {
            inspirationContentDiv.innerHTML = '<div class="loading-message">Error initializing Gemini. Check API key and console.</div>';
            inspirationLoaded = false; return;
        }
    
        inspirationContentDiv.innerHTML = '<div class="loading-message">Collecting Musical Inspiration...</div>';
        inspirationLoaded = false;
    
        try {
            const trendingItems = await getTrendingPromptsFromAudio();
            const popularItems = popularInspirationsData;
    
            inspirationData = shuffleArray([...trendingItems, ...popularItems]);
            inspirationContentDiv.innerHTML = ''; // Clear loading message
    
            if (inspirationData.length === 0 && popularInspirationsData.length === 0) {
                 inspirationContentDiv.innerHTML = '<div class="loading-message">No inspirations available. All AI suggestions might have been filtered.</div>';
            } else if (trendingItems.length === 0 && inspirationData.length > 0 && inspirationData.every(item => item.type === 'popular')) {
                const noTrendingMsg = document.createElement('div');
                noTrendingMsg.className = 'loading-message';
                noTrendingMsg.style.marginBottom = '10px';
                noTrendingMsg.textContent = 'No new trending inspirations passed checks. Showing popular only.';
                inspirationContentDiv.appendChild(noTrendingMsg);
            }
    
            inspirationData.forEach(dataItem => {
                const item = document.createElement('div');
                item.classList.add('inspiration-item');
    
                let popularDetailsHtml = '';
                if (dataItem.type === 'popular') {
                    let profilePicsHtml = '<div class="profile-pics">';
                    dataItem.friends.forEach(friendId => {
                        profilePicsHtml += `<img src="https://i.pravatar.cc/30?img=${friendId}" alt="friend profile pic">`;
                    });
                    profilePicsHtml += '</div>';
                    popularDetailsHtml = `
                        <div class="inspiration-popular-details">
                            ${profilePicsHtml}
                            <span>and ${dataItem.others.toLocaleString()} more</span>
                        </div>
                    `;
                }
    
                // Main structure for the item
                item.innerHTML = `
                    <div class="inspiration-label">${dataItem.type.toUpperCase()}</div>
                    <div class="inspiration-prompt">${dataItem.promptText}</div>
                    <button class="read-more-toggle">Read more</button>
                    ${popularDetailsHtml}
                    ${dataItem.type === 'trending' ? `<!-- <small style="color: #777; display: block; margin-top: 5px;">Source: ${dataItem.originalFile || 'N/A'}</small> -->` : ''}
                `;
    
                inspirationContentDiv.appendChild(item); // Append item to DOM first
    
                // Now get references to the prompt and toggle elements within the appended item
                const promptElement = item.querySelector('.inspiration-prompt');
                const toggleButton = item.querySelector('.read-more-toggle');
    
                // Check if the prompt is actually truncated
                // This check is more reliable after the element is in the DOM and styled
                const isClamped = promptElement.scrollHeight > promptElement.clientHeight;
    
                if (isClamped) {
                    toggleButton.style.display = 'inline'; // Show the button
                    toggleButton.addEventListener('click', () => {
                        const isExpanded = promptElement.classList.toggle('expanded');
                        toggleButton.textContent = isExpanded ? 'Read less' : 'Read more';
                    });
                } else {
                    toggleButton.remove(); // Remove the button if not needed
                }
    
                item.addEventListener('click', (e) => {
                    // Prevent item selection when clicking the "Read more/less" button
                    if (e.target !== toggleButton) {
                        selectInspirationItem(item);
                    }
                });
            });
    
            inspirationLoaded = true;
        } catch (error) {
            console.error("Failed to load inspiration content:", error);
            inspirationContentDiv.innerHTML = `<div class="loading-message">Error loading inspiration: ${error.message}. Check the console.</div>`;
            inspirationLoaded = false;
        }
    }

    // ... (selectInspirationItem, selectGenreButton, tab listeners, etc. remain the same)
    function selectInspirationItem(item) {
        if (selectedInspirationItem) {
            selectedInspirationItem.classList.remove('selected');
        }
        item.classList.add('selected');
        selectedInspirationItem = item;
    }

    function selectGenreButton(button) {
        if (selectedGenreButton) {
            selectedGenreButton.classList.remove('selected');
        }
        button.classList.add('selected');
        selectedGenreButton = button;
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            tab.classList.add('active');
            const targetContentId = tab.getAttribute('data-tab') + '-content';
            document.getElementById(targetContentId).classList.add('active');

            if (tab.getAttribute('data-tab') === 'inspiration' && !inspirationLoaded) {
                loadInspirationContent();
            } else if (tab.getAttribute('data-tab') === 'inspiration' && inspirationLoaded) {
                // To re-fetch and re-check every time:
                // inspirationLoaded = false; // Reset flag to allow re-loading
                // loadInspirationContent();
            }
        });
    });

    genreButtons.forEach(button => {
        button.addEventListener('click', () => {
            selectGenreButton(button);
        });
    });

    document.querySelector('.tab-button[data-tab="custom"]').classList.add('active');
    document.getElementById('custom-content').classList.add('active');

    if (GEMINI_API_KEY) {
        initializeGemini();
    }
});