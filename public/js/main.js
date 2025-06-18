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
    }
});
