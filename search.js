/**
 * Main entry point for the search page.
 * Waits for the DOM to be fully loaded before initializing.
 */
document.addEventListener('DOMContentLoaded', () => {
    initializeSearchPage();
});

/**
 * Initializes the search page by setting up event listeners
 * and fetching the initial set of breed data.
 */
function initializeSearchPage() {
    setupEventListeners();
    // Fetch initial data on page load
    fetchBreeds();
}

/**
 * Sets up all necessary event listeners for the filter controls.
 * All filter changes will trigger a new call to `fetchBreeds`.
 */
function setupEventListeners() {
    const applyFiltersBtn = document.getElementById('apply-filters-btn');
    const searchInput = document.getElementById('breed-search');
    const sortDropdown = document.getElementById('sort-by');
    
    // Main filter button
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', fetchBreeds);
    }
    
    // Sort dropdown
    if (sortDropdown) {
        sortDropdown.addEventListener('change', fetchBreeds);
    }
    
    // Search input (triggers on pressing Enter)
    if (searchInput) {
        searchInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault(); // Stop form submission
                fetchBreeds();
            }
        });
    }

    // You can also add 'change' listeners to the checkboxes and radio buttons
    // to trigger `fetchBreeds` immediately, or rely on the "Apply Filters" button.
    // Example:
    // document.getElementById('filter-pet-type').addEventListener('change', fetchBreeds);
    // document.getElementById('filter-size').addEventListener('change', fetchBreeds);
}

/**
 * Collects all current filter values from the DOM.
 * @returns {object} An object containing all selected filter values.
 */
function getFilters() {
    // Get search term
    const search = document.getElementById('breed-search').value;
    
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

    console.log('Filters collected:', filters);
    return filters;
}

/**
 * Fetches breed data from the API based on the current filters.
 * This is a MOCK function and should be replaced with a real API call.
 */
async function fetchBreeds() {
    const resultsGrid = document.getElementById('results-grid');
    const resultsCount = document.getElementById('results-count');
    
    // 1. Show loading state
    resultsGrid.innerHTML = '<div class="loader lg:col-span-3"></div>';
    resultsCount.textContent = 'Loading results...';

    // 2. Get all filter values
    const filters = getFilters();

    // 3. --- API INTEGRATION POINT ---
    //
    // Replace this `setTimeout` block with a real `fetch()` call to your API.
    // Use the `filters` object to build your API query parameters.
    //
    // Example:
    // try {
    //     const params = new URLSearchParams();
    //     params.append('search', filters.search);
    //     params.append('type', filters.petType);
    //     params.append('sort', filters.sort);
    //     filters.sizes.forEach(size => params.append('size', size));
    //     filters.characteristics.forEach(char => params.append('char', char));
    //
    //     const response = await fetch(`https://api.yourpetapi.com/v1/breeds?${params.toString()}`);
    //     if (!response.ok) throw new Error('Network response was not ok');
    //     
    //     const data = await response.json();
    //
    //     renderResults(data.breeds); // 'data.breeds' or whatever your API returns
    //     renderPagination(data.pagination.totalPages, data.pagination.currentPage);
    //     resultsCount.textContent = `Showing ${data.pagination.start}-${data.pagination.end} of ${data.pagination.total} results`;
    //
    // } catch (error) {
    //     console.error('Failed to fetch breeds:', error);
    //     resultsGrid.innerHTML = '<p class="text-brand-text-light lg:col-span-3">Failed to load results. Please try again.</p>';
    // }
    //
    // --- END API INTEGRATION POINT ---

    // --- MOCK DATA (Remove after API integration) ---
    const mockBreeds = [
        {
            id: 1,
            name: "Golden Retriever",
            type: "Dog",
            tags: ["Large", "Friendly", "Good with Kids"],
            description: "Friendly, intelligent, and loyal. Golden Retrievers are great family pets.",
            imageUrl: "https://placehold.co/600x400/F4E8B8/304A47?text=Golden+Retriever",
            learnMoreUrl: "#"
        },
        {
            id: 2,
            name: "Siamese",
            type: "Cat",
            tags: ["Medium", "Vocal", "Social"],
            description: "Known for their striking blue eyes and social, vocal personalities.",
            imageUrl: "https://placehold.co/600x400/F4E8B8/304A47?text=Siamese",
            learnMoreUrl: "#"
        },
        {
            id: 3,
            name: "Beagle",
            type: "Dog",
            tags: ["Medium", "Curious", "Merry"],
            description: "Merry and fun-loving, Beagles are scent hounds who are curious and friendly.",
            imageUrl: "https://placehold.co/600x400/F4E8B8/304A47?text=Beagle",
            learnMoreUrl: "#"
        },
        {
            id: 4,
            name: "Maine Coon",
            type: "Cat",
            tags: ["Large", "Gentle Giant", "Fluffy"],
            description: "One of the largest domesticated cat breeds, known for its gentle nature.",
            imageUrl: "https://placehold.co/600x400/F4E8B8/304A47?text=Maine+Coon",
            learnMoreUrl: "#"
        },
        {
            id: 5,
            name: "Poodle (Standard)",
            type: "Dog",
            tags: ["Large", "Hypoallergenic", "Intelligent"],
            description: "Very smart and active. Their low-shedding coat is great for allergy sufferers.",
            imageUrl: "https://placehold.co/600x400/F4E8B8/304A47?text=Poodle",
            learnMoreUrl: "#"
        },
        {
            id: 6,
            name: "Ragdoll",
            type: "Cat",
            tags: ["Large", "Docile", "Affectionate"],
            description: "Known for their tendency to go limp like a ragdoll when picked up.",
            imageUrl: "https://placehold.co/600x400/F4E8B8/304A4T?text=Ragdoll",
            learnMoreUrl: "#"
        }
    ];

    // Simulate network delay
    setTimeout(() => {
        renderResults(mockBreeds);
        renderPagination(5, 1); // Mock: 5 total pages, currently on page 1
        resultsCount.textContent = `Showing 1-6 of ${mockBreeds.length} results (Mock Data)`;
    }, 1000);
    // --- END MOCK DATA ---
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
        // --- API DATA MAPPING ---
        //
        // Map your API's data fields to this HTML structure.
        // For example, if your API uses `breed_name`, change `breed.name` to `breed.breed_name`.
        //
        const breedName = breed.name || 'Unknown Breed';
        const breedImage = breed.imageUrl || `https://placehold.co/600x400/F4E8B8/304A47?text=${breedName.replace(' ', '+')}`;
        const breedDescription = breed.description || 'No description available.';
        const breedUrl = breed.learnMoreUrl || '#';
        
        // Create tags HTML
        // This assumes breed.tags is an array of strings. Adapt as needed.
        let tagsHtml = `<span class="bg-brand-accent text-brand-dark text-xs font-semibold px-3 py-1 rounded-full">${breed.type || 'Pet'}</span>`;
        if (breed.tags && Array.isArray(breed.tags)) {
            tagsHtml += breed.tags.map(tag => 
                `<span class="bg-brand-accent text-brand-dark text-xs font-semibold px-3 py-1 rounded-full">${tag}</span>`
            ).join('');
        }
        // --- END API DATA MAPPING ---

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
                    <a href="${breedUrl}" class="mt-auto inline-block text-center bg-brand-accent hover:bg-brand-accent-hover rounded-full py-2 px-5 text-brand-dark font-medium no-underline transition-transform hover:-translate-y-0.5">
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
 * This is a MOCK function and should be updated to be dynamic.
 * @param {number} totalPages - The total number of pages from the API.
 * @param {number} currentPage - The current active page.
 */
function renderPagination(totalPages, currentPage) {
    const paginationContainer = document.getElementById('pagination-container');
    
    // --- API INTEGRATION ---
    //
    // This is a mock implementation. You should replace this with a dynamic
    // function that builds the pagination links based on `totalPages` and `currentPage`.
    //
    // Each link should, when clicked, call `fetchBreeds()` and pass the
    // new page number as part of the `getFilters()` logic.
    //
    
    // Mock HTML:
    paginationContainer.innerHTML = `
        <ul class="flex items-center gap-2">
            <!-- Previous (Disabled) -->
            <li>
                <span class="inline-flex items-center justify-center w-10 h-10 rounded-full text-gray-400 bg-gray-100">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                </span>
            </li>
            <!-- Page 1 (Current) -->
            <li class="page-item active">
                <span class_name="inline-flex items-center justify-center w-10 h-10 rounded-full font-semibold text-white bg-brand-dark" aria-current="page">1</span>
            </li>
            <!-- Page 2 -->
            <li class="page-item">
                <a href="#" class="page-link inline-flex items-center justify-center w-10 h-10 rounded-full font-semibold text-brand-dark bg-white hover:bg-brand-accent" data-page="2">2</a>
            </li>
            <!-- Page 3 -->
            <li class="page-item">
                <a href="#" class="page-link inline-flex items-center justify-center w-10 h-10 rounded-full font-semibold text-brand-dark bg-white hover:bg-brand-accent" data-page="3">3</a>
            </li>
            <!-- Next -->
            <li class="page-item">
                <a href="#" class="page-link inline-flex items-center justify-center w-10 h-10 rounded-full font-semibold text-brand-dark bg-white hover:bg-brand-accent" data-page="2">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path></svg>
                </a>
            </li>
        </ul>
    `;

    // Add event listeners to new pagination links
    paginationContainer.querySelectorAll('.page-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = e.currentTarget.dataset.page;
            console.log(`Go to page ${page}`);
            // In a real app, you would add `page` to your filters
            // and call `fetchBreeds()` again.
            // e.g., fetchBreeds(page);
        });
    });
}