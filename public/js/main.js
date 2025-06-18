// Client-side JavaScript for Superhero Website

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Automatically dismiss alerts after 5 seconds
    setTimeout(function() {
        const alerts = document.querySelectorAll('.alert');
        alerts.forEach(function(alert) {
            // Create a Bootstrap alert instance and call close
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        });
    }, 5000);

    // Add favorite button functionality
    const favoriteButtons = document.querySelectorAll('.btn-favorite');
    favoriteButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            // Toggle between filled and outline heart icon
            const icon = this.querySelector('i');
            if (icon.classList.contains('far')) {
                icon.classList.remove('far');
                icon.classList.add('fas');
            } else {
                icon.classList.remove('fas');
                icon.classList.add('far');
            }
        });
    });

    // Add tooltips to any elements with data-bs-toggle="tooltip"
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Enhance search experience
    const searchForm = document.querySelector('#search-form');
    if (searchForm) {
        const searchInput = searchForm.querySelector('input[type="search"]');
        searchInput.addEventListener('focus', function() {
            this.parentElement.classList.add('shadow');
        });
        searchInput.addEventListener('blur', function() {
            this.parentElement.classList.remove('shadow');
        });
    }    // Set hero images as card backgrounds
    setTimeout(function() {
        // Only target individual hero cards within the grid, not container cards
        const heroCards = document.querySelectorAll('.row-cols-1 .card');
        console.log('Found', heroCards.length, 'hero cards');
        
        heroCards.forEach(function(card, index) {
            const img = card.querySelector('.card-img-top');
            if (img) {
                // Wait for image to load
                if (img.complete) {
                    setCardBackground(card, img, index);
                } else {
                    img.onload = function() {
                        setCardBackground(card, img, index);
                    };
                }
            } else {
                console.log('No image found for card', index);
            }
        });
    }, 100);    function setCardBackground(card, img, index) {
        const imageUrl = img.src;
        console.log('Setting background for card', index, 'with image:', imageUrl);
        
        // Set the background image
        card.style.backgroundImage = `url("${imageUrl}")`;
        card.style.backgroundSize = 'cover';
        card.style.backgroundPosition = 'center';
        card.style.backgroundRepeat = 'no-repeat';
        
        // Don't hide the images for now
        /* 
        setTimeout(function() {
            img.style.opacity = '0';
            setTimeout(function() {
                img.style.display = 'none';
            }, 300);
        }, 500);
        */
    }    // Modal functionality improvements
    // Handle profile edit modal
    const profileEditModal = document.getElementById('profileEditModal');
    if (profileEditModal) {
        // Fix modal interaction function
        const fixModalInteraction = function() {
            // Make sure modal content is interactive
            profileEditModal.style.zIndex = '9000';
            
            const modalContent = profileEditModal.querySelector('.modal-content');
            if (modalContent) {
                modalContent.style.pointerEvents = 'auto';
                modalContent.style.zIndex = '9050';
            }
            
            const modalForm = profileEditModal.querySelector('form');
            if (modalForm) {
                modalForm.style.pointerEvents = 'auto';
                modalForm.style.zIndex = '9100';
            }
            
            // Ensure ALL form elements are interactive
            const formElements = profileEditModal.querySelectorAll('.form-control, .form-check-input, button, label, textarea, input, select, .form-text');
            formElements.forEach(function(element) {
                element.style.pointerEvents = 'auto';
                element.style.position = 'relative';
                element.style.zIndex = '9100';
            });

            // Remove any potential overlays
            document.querySelectorAll('.modal-backdrop').forEach(function(backdrop) {
                backdrop.style.pointerEvents = 'none';
            });
        };
        
        // Apply fixes immediately
        fixModalInteraction();
        
        // Also apply when modal is shown
        profileEditModal.addEventListener('shown.bs.modal', function() {
            fixModalInteraction();
            
            // Focus first input when modal opens
            const firstInput = this.querySelector('.form-control');
            if (firstInput) {
                firstInput.focus();
            }
        });
    }    // Simplified modal enhancement code - overlay has been removed
    const modals = document.querySelectorAll('.modal');
    
    modals.forEach(function(modal) {
        // When modal is about to be shown
        modal.addEventListener('show.bs.modal', function() {
            // Add class to body for any potential styling
            document.body.classList.add('modal-showing');
        });
        
        // When modal is fully shown
        modal.addEventListener('shown.bs.modal', function() {
            // Set opacity of form elements to ensure they're fully visible
            const formElements = modal.querySelectorAll('input, textarea, select, button, .form-control');
            formElements.forEach(function(el) {
                el.style.opacity = '1';
                el.style.visibility = 'visible';
            });
            
            // Set background color of modal to be solid
            const modalContent = modal.querySelector('.modal-content');
            if (modalContent) {
                modalContent.style.backgroundColor = '#212529'; 
                modalContent.style.opacity = '1';
            }
        });
        
        // When modal is hidden
        modal.addEventListener('hidden.bs.modal', function() {
            // Remove class from body 
            document.body.classList.remove('modal-showing');
        });
    });
});
