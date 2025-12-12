/**
 * API Keys for TheDogAPI and TheCatAPI.
 */
const DOG_API_KEY = 'live_MDVz1JPcd96dyCiBhfMyOlDkZ0Wi3rPm8Ry6nytOoyjX8gToNkHIC9MUMwxduiVa';
const CAT_API_KEY = 'live_V6UfZeNGHVHQbhWynCTJDWa3HwsbyYBzdAsx23Ep9iQMR1ehy7TL7dHJCS9lmei6';

let allBreeds = []; // Stores all fetched breeds for client-side filtering
let currentPage = 1;
const breedsPerPage = 9; // Number of breeds to display per page

function initializeSearchPage() {
    setupEventListeners();
    // Fetch all breed data once on page load
    fetchAllBreedsAndRender();
}

/**
 * Updates the results count display.
 */
function updateResultsCount(currentCount, totalCount) {
    document.getElementById('results-count').textContent = `Showing ${currentCount} of ${totalCount} results`;
}

/**
 * Sets up event listeners for filters and search.
 */
function setupEventListeners() {
    const applyFiltersBtn = document.getElementById('apply-filters-btn');
    const searchInput = document.getElementById('breed-search');
    const petTypeRadios = document.querySelectorAll('input[name="pet-type"]');
    const sizeCheckboxes = document.querySelectorAll('#filter-size input[type="checkbox"]');
    const charCheckboxes = document.querySelectorAll('#filter-characteristics input[type="checkbox"]');
    const sortDropdown = document.getElementById('sort-by');
    
    // Main filter button
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', () => fetchAndRenderFilteredBreeds(1)); // Reset to page 1 on filter apply
    }
    
    // Sort dropdown
    if (sortDropdown) {
        sortDropdown.addEventListener('change', () => fetchAndRenderFilteredBreeds(1)); // Reset to page 1 on sort change
    }
    
    // Search input (triggers on pressing Enter)
    if (searchInput) {
        searchInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault(); // Stop form submission
                fetchAndRenderFilteredBreeds(1); // Reset to page 1 on search
            }
        });
    }

    // Pet type radios
    petTypeRadios.forEach(radio => {
        radio.addEventListener('change', () => fetchAndRenderFilteredBreeds(1));
    });

    // Size checkboxes
    sizeCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => fetchAndRenderFilteredBreeds(1));
    });

    // Characteristics checkboxes
    charCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => fetchAndRenderFilteredBreeds(1));
    });
}

/**
 * Collects all current filter values from the DOM.
 * @returns {object} An object containing all selected filter values.
 */
function getFilters() {
    // Get search term (trim whitespace)
    const search = document.getElementById('breed-search').value.trim();
    
    // Get pet type
    const petTypeElement = document.querySelector('input[name="pet-type"]:checked');
    const petType = petTypeElement ? petTypeElement.value : 'all';
    
    // Get sizes (as an array)
    const sizeCheckboxes = document.querySelectorAll('#filter-size input[type="checkbox"]:checked');
    const sizes = Array.from(sizeCheckboxes).map(cb => cb.value);
    
    // Get characteristics (as an array)
    const charCheckboxes = document.querySelectorAll('#filter-characteristics input[type="checkbox"]:checked');
    const characteristics = Array.from(charCheckboxes).map(cb => cb.value);

    // Get sort order
    const sort = document.getElementById('sort-by').value;

    const filters = {
        search,
        petType,
        sizes,
        characteristics,
        sort
    };

    return filters;
}

/**
 * Fetches all dog and cat breeds from their respective APIs and stores them.
 * This function is called once on page load.
 */
async function fetchAllBreedsAndRender() {
    const resultsGrid = document.getElementById('results-grid');
    const resultsCount = document.getElementById('results-count');
    
    // 1. Show loading state
    resultsGrid.innerHTML = '<div class="loader lg:col-span-3"></div>';
    resultsCount.textContent = 'Loading results...';

    try {
        // Helper function to fetch breeds safely
        const fetchBreeds = async (url, apiKey) => {
            try {
                const response = await fetch(url, { headers: { 'x-api-key': apiKey } });
                if (!response.ok) {
                    console.error(`API Error: ${response.status} ${response.statusText} for ${url}`);
                    return [];
                }
                return await response.json();
            } catch (error) {
                console.error(`Fetch Error for ${url}:`, error);
                return [];
            }
        };

        // Fetch both concurrently, but failures won't reject the main promise
        const [dogData, catData] = await Promise.all([
            fetchBreeds('https://api.thedogapi.com/v1/breeds?limit=500&page=0', DOG_API_KEY),
            fetchBreeds('https://api.thecatapi.com/v1/breeds?limit=500&page=0', CAT_API_KEY)
        ]);

        const mappedDogBreeds = Array.isArray(dogData) ? dogData.map(breed => ({
            id: `dog-${breed.id}`,
            name: breed.name,
            type: 'Dog',
            description: breed.temperament ? `Temperament: ${breed.temperament}. Life Span: ${breed.life_span}.` : 'No description available.',
            imageUrl: breed.image?.url || `https://placehold.co/600x400/F4E8B8/304A47?text=${breed.name.replace(' ', '+')}`,
            learnMoreUrl: `https://www.google.com/search?q=${encodeURIComponent(breed.name + ' dog breed')}`,
            weight: breed.weight, // { imperial: "60-100", metric: "27-45" }
            height: breed.height, // { imperial: "23-24", metric: "58-61" }
            temperament: breed.temperament,
            hypoallergenic: breed.hypoallergenic || false,
            child_friendly: breed.child_friendly || 0, // 1-5 scale
            dog_friendly: breed.dog_friendly || 0,   // 1-5 scale
            shedding_level: breed.shedding_level || 0 // 1-5 scale
        })) : [];

        const mappedCatBreeds = Array.isArray(catData) ? catData.map(breed => ({
            id: `cat-${breed.id}`,
            name: breed.name,
            type: 'Cat',
            description: breed.temperament ? `Temperament: ${breed.temperament}. Life Span: ${breed.life_span}.` : 'No description available.',
            imageUrl: breed.image?.url || `https://placehold.co/600x400/F4E8B8/304A47?text=${breed.name.replace(' ', '+')}`,
            learnMoreUrl: `https://www.google.com/search?q=${encodeURIComponent(breed.name + ' cat breed')}`,
            weight: breed.weight, // { imperial: "7-10", metric: "3-5" }
            height: null, 
            temperament: breed.temperament,
            hypoallergenic: breed.hypoallergenic || false,
            child_friendly: breed.child_friendly || 0, // 1-5 scale
            dog_friendly: breed.dog_friendly || 0,   // 1-5 scale
            shedding_level: breed.shedding_level || 0 // 1-5 scale
        })) : [];

        allBreeds = [...mappedDogBreeds, ...mappedCatBreeds];
        
        if (allBreeds.length === 0) {
             throw new Error('No breeds loaded from either API.');
        }

        console.log('All breeds fetched:', allBreeds);

        // Reset to page 1 and render
        fetchAndRenderFilteredBreeds(1); 

    } catch (error) {
        console.error('Failed to fetch all breeds:', error);
        resultsGrid.innerHTML = '<p class="text-brand-text-light lg:col-span-3">Failed to load breeds. Please check your API keys and network connection.</p>';
        resultsCount.textContent = 'Error loading breeds.';
    }
}

/**
 * Filters and renders breeds based on current filter settings and page number.
 * @param {number} page - The page number to render.
 */
function fetchAndRenderFilteredBreeds(page) {
    currentPage = page;
    const resultsGrid = document.getElementById('results-grid');
    const resultsCount = document.getElementById('results-count');

    resultsGrid.innerHTML = '<div class="loader lg:col-span-3"></div>';
    resultsCount.textContent = 'Filtering results...';

    const filters = getFilters();
    let filteredBreeds = [...allBreeds];

    // 1. Filter by Pet Type
    if (filters.petType !== 'all') {
        filteredBreeds = filteredBreeds.filter(breed => breed.type.toLowerCase() === filters.petType);
    }

    // 2. Filter by Search Term
    if (filters.search) {
        const searchTermLower = filters.search.toLowerCase();
        filteredBreeds = filteredBreeds.filter(breed =>
            breed.name.toLowerCase().includes(searchTermLower) ||
            breed.description.toLowerCase().includes(searchTermLower) ||
            (breed.temperament && breed.temperament.toLowerCase().includes(searchTermLower))
        );
    }

    // 3. Filter by Size
    if (filters.sizes.length > 0) {
        filteredBreeds = filteredBreeds.filter(breed => {
            const weightImperial = breed.weight?.imperial;
            if (!weightImperial) return false;

            const [minWeight, maxWeight] = weightImperial.split(' - ').map(Number);
            const avgWeight = (minWeight + maxWeight) / 2;

            if (isNaN(avgWeight)) return false;

            let matchesSize = false;
            if (filters.sizes.includes('small') && avgWeight < 20) {
                matchesSize = true;
            }
            if (filters.sizes.includes('medium') && avgWeight >= 20 && avgWeight < 60) {
                matchesSize = true;
            }
            if (filters.sizes.includes('large') && avgWeight >= 60) {
                matchesSize = true;
            }
            return matchesSize;
        });
    }

    // 4. Filter by Characteristics
    if (filters.characteristics.length > 0) {
        filteredBreeds = filteredBreeds.filter(breed => {
            let matchesAllChars = true;
            for (const char of filters.characteristics) {
                switch (char) {
                    case 'hypoallergenic':
                        if (!breed.hypoallergenic) matchesAllChars = false;
                        break;
                    case 'good-with-kids':
                        if (breed.child_friendly < 3) matchesAllChars = false; 
                        break;
                    case 'good-with-pets':
                        if (breed.dog_friendly < 3) matchesAllChars = false;
                        break;
                    case 'low-shedding':
                        if (breed.shedding_level > 2) matchesAllChars = false;
                        break;
                }
                if (!matchesAllChars) break;
            }
            return matchesAllChars;
        });
    }

    // 5. Sort Results
    filteredBreeds.sort((a, b) => {
        if (filters.sort === 'name-asc') {
            return a.name.localeCompare(b.name);
        } else if (filters.sort === 'name-desc') {
            return b.name.localeCompare(a.name);
        } else if (filters.sort === 'size-asc') {
            const aWeight = parseFloat(a.weight?.imperial?.split(' - ')[0] || 0);
            const bWeight = parseFloat(b.weight?.imperial?.split(' - ')[0] || 0);
            return aWeight - bWeight;
        } else if (filters.sort === 'size-desc') {
            const aWeight = parseFloat(a.weight?.imperial?.split(' - ')[0] || 0);
            const bWeight = parseFloat(b.weight?.imperial?.split(' - ')[0] || 0);
            return bWeight - aWeight;
        }
        return 0; // Default or no sort
    });

    // 6. Implement Pagination
    const totalBreeds = filteredBreeds.length;
    const totalPages = Math.ceil(totalBreeds / breedsPerPage);
    const startIndex = (currentPage - 1) * breedsPerPage;
    const endIndex = startIndex + breedsPerPage;
    const breedsToRender = filteredBreeds.slice(startIndex, endIndex);

    // 7. Render results and pagination
    renderResults(breedsToRender);
    renderPagination(totalPages, currentPage);
    updateResultsCount(breedsToRender.length, totalBreeds);
}

/**
 * Renders the breed cards into the results grid.
 * @param {Array<object>} breeds - An array of breed objects from the API.
 */
function renderResults(breeds) {
    const resultsGrid = document.getElementById('results-grid');
    resultsGrid.innerHTML = ''; // Clear loading spinner

    if (!breeds || breeds.length === 0) {
        resultsGrid.innerHTML = '<p class="text-brand-text-light lg:col-span-3">No results found matching your criteria. Try adjusting your filters.</p>';
        return;
    }

    breeds.forEach(breed => {
        const breedName = breed.name || 'Unknown Breed';
        const breedImage = breed.imageUrl || `https://placehold.co/600x400/F4E8B8/304A47?text=${breedName.replace(' ', '+')}`;
        const breedDescription = breed.description || 'No description available.';
        const breedUrl = breed.learnMoreUrl || '#';
        
        let tagsHtml = `<span class="bg-brand-accent text-brand-dark text-xs font-semibold px-3 py-1 rounded-full">${breed.type}</span>`;
        
        // Add characteristics as tags
        if (breed.hypoallergenic) tagsHtml += `<span class="bg-brand-accent text-brand-dark text-xs font-semibold px-3 py-1 rounded-full ml-1">Hypoallergenic</span>`;
        if (breed.child_friendly >= 3) tagsHtml += `<span class="bg-brand-accent text-brand-dark text-xs font-semibold px-3 py-1 rounded-full ml-1">Good with Kids</span>`;
        if (breed.dog_friendly >= 3) tagsHtml += `<span class="bg-brand-accent text-brand-dark text-xs font-semibold px-3 py-1 rounded-full ml-1">Good with Pets</span>`;
        if (breed.shedding_level <= 2 && breed.shedding_level > 0) tagsHtml += `<span class="bg-brand-accent text-brand-dark text-xs font-semibold px-3 py-1 rounded-full ml-1">Low Shedding</span>`;
        
        // Add size tag based on average weight
        const weightImperial = breed.weight?.imperial;
        if (weightImperial) {
            const [minWeight, maxWeight] = weightImperial.split(' - ').map(Number);
            const avgWeight = (minWeight + maxWeight) / 2;
            let sizeTag = '';
            if (avgWeight < 20) sizeTag = 'Small';
            else if (avgWeight >= 20 && avgWeight < 60) sizeTag = 'Medium';
            else if (avgWeight >= 60) sizeTag = 'Large';
            if (sizeTag) tagsHtml += `<span class="bg-brand-accent text-brand-dark text-xs font-semibold px-3 py-1 rounded-full ml-1">${sizeTag}</span>`;
        }

        const cardHtml = `
            <div class="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col">
                <img class="w-full h-56 object-cover" src="${breedImage}" alt="${breedName}" onerror="this.src='https://placehold.co/600x400/F4E8B8/304A47?text=Image+Not+Found'">
                <div class="p-5 flex flex-col flex-grow">
                    <h3 class="text-2xl font-bold text-brand-dark mb-2">${breedName}</h3>
                    <div class="flex flex-wrap gap-2 mb-4">
                        ${tagsHtml}
                    </div>
                    <p class="text-brand-text-light text-sm mb-4 flex-grow">
                        ${breedDescription}
                    </p>
                    <a href="${breedUrl}" target="_blank" class="mt-auto inline-block text-center bg-brand-accent hover:bg-brand-accent-hover rounded-full py-2 px-5 text-brand-dark font-medium no-underline transition-transform hover:-translate-y-0.5">
                        Learn More
                    </a>
                </div>
            </div>
        `;
        resultsGrid.innerHTML += cardHtml;
    });
}

/**
 * Renders the pagination links.
 * @param {number} totalPages - The total number of pages.
 * @param {number} currentPage - The current active page.
 */
function renderPagination(totalPages, currentPage) {
    const paginationContainer = document.getElementById('pagination-container');
    paginationContainer.innerHTML = ''; // Clear previous pagination

    if (totalPages <= 1) {
        return; // No pagination needed for 1 or fewer pages
    }

    const ul = document.createElement('ul');
    ul.className = 'flex items-center gap-2';

    // Previous button
    const prevLi = document.createElement('li');
    const prevButton = document.createElement('a');
    prevButton.href = '#';
    prevButton.className = `inline-flex items-center justify-center w-10 h-10 rounded-full font-semibold ${currentPage === 1 ? 'text-gray-400 bg-gray-100 cursor-not-allowed' : 'text-brand-dark bg-white hover:bg-brand-accent'}`;
    prevButton.innerHTML = `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>`;
    prevButton.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentPage > 1) {
            fetchAndRenderFilteredBreeds(currentPage - 1);
        }
    });
    prevLi.appendChild(prevButton);
    ul.appendChild(prevLi);

    // Page numbers
    const maxPageButtons = 5; // Max number of page buttons to show
    let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

    if (endPage - startPage + 1 < maxPageButtons) {
        startPage = Math.max(1, endPage - maxPageButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        const pageLi = document.createElement('li');
        const pageButton = document.createElement('a');
        pageButton.href = '#';
        pageButton.className = `inline-flex items-center justify-center w-10 h-10 rounded-full font-semibold ${i === currentPage ? 'text-white bg-brand-dark' : 'text-brand-dark bg-white hover:bg-brand-accent'}`;
        pageButton.textContent = i;
        pageButton.dataset.page = i;
        pageButton.addEventListener('click', (e) => {
            e.preventDefault();
            fetchAndRenderFilteredBreeds(parseInt(e.currentTarget.dataset.page));
        });
        pageLi.appendChild(pageButton);
        ul.appendChild(pageLi);
    }

    // Next button
    const nextLi = document.createElement('li');
    const nextButton = document.createElement('a');
    nextButton.href = '#';
    nextButton.className = `inline-flex items-center justify-center w-10 h-10 rounded-full font-semibold ${currentPage === totalPages ? 'text-gray-400 bg-gray-100 cursor-not-allowed' : 'text-brand-dark bg-white hover:bg-brand-accent'}`;
    nextButton.innerHTML = `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path></svg>`;
    nextButton.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentPage < totalPages) {
            fetchAndRenderFilteredBreeds(currentPage + 1);
        }
    });
    nextLi.appendChild(nextButton);
    ul.appendChild(nextLi);

    paginationContainer.appendChild(ul);
}
