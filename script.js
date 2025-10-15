document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    const resultTextarea = document.getElementById('result');
    const binInput = document.getElementById('bin');
    const monthInput = document.getElementById('month');
    const yearInput = document.getElementById('year');
    const cvcInput = document.getElementById('cvc');
    const quantityInput = document.getElementById('quantity');
    const generateButton = document.querySelector('.btn-block');

    const API_BASE_URL = 'https://cc-gen-lime.vercel.app/generate';

    if (quantityInput) quantityInput.value = 15;

    if (generateButton) {
        generateButton.addEventListener('click', async (e) => {
            e.preventDefault();

            const bin = binInput.value.replace(/[^0-9]/g, '');
            let quantity = parseInt(quantityInput.value, 10) || 15;
            const maxQuantity = 500;  // নতুন লিমিট ৫০০

if (quantity > maxQuantity) {
    resultTextarea.value = `Error: Quantity cannot exceed ${maxQuantity}.`;
    return;
}



            const monthYearCheckbox = document.querySelector('.input-group-addon input[type="checkbox"]');
            const cvcCheckboxElement = document.querySelector('.cvc-group .input-group-addon input[type="checkbox"]');

            const month = monthYearCheckbox?.checked ? monthInput.value : '';
            const year = monthYearCheckbox?.checked ? yearInput.value : '';
            const cvc = cvcCheckboxElement?.checked ? cvcInput.value : '';

            let apiUrl = `${API_BASE_URL}?bin=${bin}&limit=${quantity}`;
            if (month) apiUrl += `&month=${month}`;
            if (year) apiUrl += `&year=${year.slice(-2)}`;
            if (cvc) apiUrl += `&cvv=${cvc}`;

            resultTextarea.value = 'Generating cards... Please wait...';

            try {
                const response = await fetch(apiUrl);
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

                const data = await response.json();

                if (data?.cards?.length > 0) {
                    resultTextarea.value = data.cards
                        .map(card => `${card.number}|${card.expiry}|${card.cvv}`)
                        .join('\n');
                } else {
                    resultTextarea.value = 'No cards were generated. Please check the BIN or API status.';
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                resultTextarea.value = `Error: Could not connect to the API. Details: ${error.message}`;
            }
        });
    }

    const monthYearCheckbox = document.querySelector('.input-group-addon input[type="checkbox"]');
    const cvcCheckboxElement = document.querySelector('.cvc-group .input-group-addon input[type="checkbox"]');

    function populateYears() {
        const currentYear = new Date().getFullYear();
        const endYear = currentYear + 15;
        yearInput.innerHTML = '<option value="">Random</option>';
        for (let year = currentYear; year <= endYear; year++) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearInput.appendChild(option);
        }
    }

    function populateMonths() {
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        const selectedYear = parseInt(yearInput.value, 10);

        monthInput.innerHTML = '<option value="">Random</option>';

        for (let month = 1; month <= 12; month++) {
            const monthStr = month.toString().padStart(2, '0');
            const option = document.createElement('option');
            option.value = monthStr;
            option.textContent = monthStr;

            if (monthYearCheckbox?.checked && selectedYear === currentYear && month < currentMonth) {
                option.disabled = true;
            }
            monthInput.appendChild(option);
        }
    }

    populateYears();
    populateMonths();

    if (monthInput && yearInput) {
        monthInput.disabled = !monthYearCheckbox?.checked;
        yearInput.disabled = !monthYearCheckbox?.checked;
    }
    if (cvcInput) {
        cvcInput.disabled = !cvcCheckboxElement?.checked;
    }

    monthYearCheckbox?.addEventListener('change', () => {
        monthInput.disabled = !monthYearCheckbox.checked;
        yearInput.disabled = !monthYearCheckbox.checked;
        if (!monthYearCheckbox.checked) {
            monthInput.value = '';
            yearInput.value = '';
        } else {
            populateYears();
            populateMonths();
            const currentMonth = new Date().getMonth() + 1;
            const currentYear = new Date().getFullYear();
            if (parseInt(yearInput.value, 10) === currentYear && parseInt(monthInput.value, 10) < currentMonth) {
                monthInput.value = currentMonth.toString().padStart(2, '0');
            }
        }
    });

    cvcCheckboxElement?.addEventListener('change', () => {
        cvcInput.disabled = !cvcCheckboxElement.checked;
        if (!cvcCheckboxElement.checked) cvcInput.value = '';
    });

    monthInput.addEventListener('change', () => {
        const selectedMonth = parseInt(monthInput.value, 10);
        const selectedYear = parseInt(yearInput.value, 10);
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();

        if (monthYearCheckbox?.checked) {
            if (selectedYear === currentYear && selectedMonth < currentMonth) {
                monthInput.value = currentMonth.toString().padStart(2, '0');
            }
        }
    });

    yearInput.addEventListener('change', () => {
        populateMonths();
        const selectedMonth = parseInt(monthInput.value, 10);
        const selectedYear = parseInt(yearInput.value, 10);
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();

        if (monthYearCheckbox?.checked) {
            if (selectedYear === currentYear && selectedMonth < currentMonth) {
                monthInput.value = currentMonth.toString().padStart(2, '0');
            }
        }
    });
});

// UI utility functions for toggling dropdown and copy notification
function toggleDropdown(header) {
    const card = header.closest('.bin-dropdown-card');
    if (!card) return;
    
    const details = card.querySelector('.bin-dropdown-details');
    const arrow = card.querySelector('.bin-dropdown-arrow');
    
    if (details && arrow) {
        details.classList.toggle('show');
        arrow.classList.toggle('down');
        
        document.querySelectorAll('.bin-dropdown-card').forEach(otherCard => {
            if (otherCard !== card) {
                otherCard.querySelector('.bin-dropdown-details')?.classList.remove('show');
                otherCard.querySelector('.bin-dropdown-arrow')?.classList.remove('down');
            }
        });
    }
}

function showCopyNotification(message, isError = false) {
    const notification = document.createElement('div');
    notification.className = 'toast-notification';
    if (isError) notification.classList.add('error');
    notification.textContent = message;
    document.body.appendChild(notification);
    
    void notification.offsetWidth;
    
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => document.body.removeChild(notification), 200);
    }, 1500);
}

function copy() {
    const textarea = document.querySelector('textarea');
    if (!textarea || !textarea.value.trim()) {
        showCopyNotification("Nothing to copy, please generate first.", true);
        return;
    }
    
    const textToCopy = textarea.value;

    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(textToCopy)
            .then(() => {
                showCopyNotification("Copy Done! ✓");
                textarea.select();
                textarea.setSelectionRange(0, textarea.value.length);
            })
            .catch(() => showCopyNotification("Failed to copy! Please try again.", true));
    } else {
        try {
            textarea.select();
            document.execCommand('copy');
            showCopyNotification("Copy Done! ✓");
            textarea.select();
            textarea.setSelectionRange(0, textarea.value.length);
        } catch {
            showCopyNotification("Failed to copy! Please try again.", true);
        }
    }
}

document.querySelectorAll('.bin-dropdown-value').forEach(element => {
    element.addEventListener('click', function() {
        const textToCopy = this.textContent;
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(textToCopy)
                .then(() => showCopyNotification("Copy Done! ✓"))
                .catch(() => showCopyNotification("Failed to copy! Please try again.", true));
        } else {
            const tempTextarea = document.createElement('textarea');
            tempTextarea.value = textToCopy;
            document.body.appendChild(tempTextarea);
            tempTextarea.select();
            document.execCommand('copy');
            document.body.removeChild(tempTextarea);
            showCopyNotification("Copy Done! ✓");
        }
    });
});

function toggleMenu() {
    const menu = document.getElementById('dropdown-menu');
    menu.classList.toggle('show');
}

document.addEventListener('click', function (event) {
    const toggle = document.querySelector('.menu-toggle');
    const menu = document.getElementById('dropdown-menu');

    if (!menu.contains(event.target) && !toggle.contains(event.target)) {
        menu.classList.remove('show');
    }
});

