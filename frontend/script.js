// API Base URL - this will be different in production
// We use environment variable if available, otherwise default to localhost
const API_URL = window.ENV_API_URL || 'http://localhost:5000';

// Wait for the page to fully load before running code
document.addEventListener('DOMContentLoaded', function() {
    // Load pets when page loads
    loadPets();
    loadStats();
    
    // Set up modal (popup) functionality
    setupModal();
});

// Function to fetch and display all pets
async function loadPets() {
    const loadingEl = document.getElementById('loading');
    const errorEl = document.getElementById('error');
    const petsGrid = document.getElementById('pets-grid');
    
    try {
        // Show loading message
        loadingEl.style.display = 'block';
        errorEl.style.display = 'none';
        
        // Make API request to get pets
        const response = await fetch(`${API_URL}/api/pets`);
        
        // Check if request was successful
        if (!response.ok) {
            throw new Error('Failed to fetch pets');
        }
        
        // Convert response to JSON
        const pets = await response.json();
        
        // Hide loading message
        loadingEl.style.display = 'none';
        
        // If no pets found
        if (pets.length === 0) {
            petsGrid.innerHTML = '<p>No pets available right now. Check back soon!</p>';
            return;
        }
        
        // Create HTML for each pet
        petsGrid.innerHTML = pets.map(pet => `
            <div class="pet-card" onclick="openAdoptionModal(${pet.id}, '${pet.name}')">
                <img src="${pet.image_url}" alt="${pet.name}" onerror="this.src='https://via.placeholder.com/400x300?text=Pet+Photo'">
                <div class="pet-info">
                    <h3>${pet.name}</h3>
                    <p class="species">${pet.species} ${pet.breed ? '• ' + pet.breed : ''}</p>
                    <p><strong>Age:</strong> ${pet.age} ${pet.age === 1 ? 'year' : 'years'} old</p>
                    <p>${pet.description}</p>
                    <button class="adopt-btn" onclick="event.stopPropagation(); openAdoptionModal(${pet.id}, '${pet.name}')">
                        Adopt Me! 💕
                    </button>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        // Show error message if something went wrong
        console.error('Error loading pets:', error);
        loadingEl.style.display = 'none';
        errorEl.style.display = 'block';
        errorEl.textContent = '❌ Could not load pets. Please try again later.';
    }
}

// Function to load statistics
async function loadStats() {
    try {
        // Get pets count
        const petsResponse = await fetch(`${API_URL}/api/pets`);
        const pets = await petsResponse.json();
        document.getElementById('total-pets').textContent = pets.length;
        
        // Get adoptions count
        const adoptionsResponse = await fetch(`${API_URL}/api/adoptions`);
        const adoptions = await adoptionsResponse.json();
        document.getElementById('total-adoptions').textContent = adoptions.length;
        
    } catch (error) {
        console.error('Error loading stats:', error);
        // Don't show error for stats - it's not critical
    }
}

// Set up modal (popup window) functionality
function setupModal() {
    const modal = document.getElementById('adoption-modal');
    const closeBtn = document.querySelector('.close');
    const form = document.getElementById('adoption-form');
    
    // Close modal when X is clicked
    closeBtn.onclick = function() {
        modal.style.display = 'none';
        form.reset();
        document.getElementById('form-message').textContent = '';
        document.getElementById('form-message').className = '';
    };
    
    // Close modal when clicking outside of it
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
            form.reset();
            document.getElementById('form-message').textContent = '';
            document.getElementById('form-message').className = '';
        }
    };
    
    // Handle form submission
    form.onsubmit = async function(e) {
        e.preventDefault(); // Prevent page reload
        await submitAdoptionRequest();
    };
}

// Open the adoption modal
function openAdoptionModal(petId, petName) {
    const modal = document.getElementById('adoption-modal');
    document.getElementById('modal-pet-name').textContent = petName;
    document.getElementById('pet-id').value = petId;
    modal.style.display = 'block';
}

// Submit adoption request to backend
async function submitAdoptionRequest() {
    const form = document.getElementById('adoption-form');
    const messageEl = document.getElementById('form-message');
    const submitBtn = form.querySelector('button[type="submit"]');
    
    // Get form data
    const formData = {
        pet_id: parseInt(document.getElementById('pet-id').value),
        adopter_name: document.getElementById('adopter-name').value,
        adopter_email: document.getElementById('adopter-email').value,
        message: document.getElementById('message').value
    };
    
    try {
        // Disable submit button while submitting
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';
        
        // Send POST request to backend
        const response = await fetch(`${API_URL}/api/adoptions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            // Success!
            messageEl.textContent = '✅ ' + result.message;
            messageEl.className = 'success';
            form.reset();
            
            // Reload stats to show updated count
            setTimeout(() => {
                loadStats();
                document.getElementById('adoption-modal').style.display = 'none';
                messageEl.textContent = '';
                messageEl.className = '';
            }, 2000);
        } else {
            // Error from backend
            messageEl.textContent = '❌ ' + result.error;
            messageEl.className = 'error';
        }
        
    } catch (error) {
        // Network or other error
        console.error('Error submitting adoption request:', error);
        messageEl.textContent = '❌ Could not submit request. Please try again.';
        messageEl.className = 'error';
    } finally {
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Request 💕';
    }
}