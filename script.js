let allShipments = [];
const itemsPerPage = 10;
let currentPage = 1;
let currentSortColumn = 'ETA';
let currentSortOrder = 'desc';

function escapeHTML(str) {
    return str.replace(/[&<>"']/g, function(match) {
        const escapeChars = {
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        };
        return escapeChars[match];
    });
}

function normalizeString(str) {
    return str ? str.trim().toLowerCase() : '';
}

function isValidInput(value) {
    const pattern = /^[a-zA-Z0-9\-]+$/;
    return pattern.test(value.trim());
}

function displayInputError(message) {
    const errorDiv = document.getElementById('inputError');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

function hideInputError() {
    const errorDiv = document.getElementById('inputError');
    errorDiv.style.display = 'none';
    errorDiv.textContent = '';
}

function showLoadingIndicator(type) {
    document.getElementById(type + 'LoadingIndicator').style.display = 'block';
}

function hideLoadingIndicator(type) {
    document.getElementById(type + 'LoadingIndicator').style.display = 'none';
}

function fetchTrackingInfo(trackingNumber, customerCode) {
    if (trackingNumber) {
        showLoadingIndicator('tracking');
        document.getElementById('trackingResult').innerHTML = '';
    } else if (customerCode) {
        showLoadingIndicator('customer');
        document.getElementById('customerResult').innerHTML = '';
    }

    document.getElementById('pagination').innerHTML = '';
    hideInputError();

    const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSkDs6aIbB2a4acdPJZ3t_0ZQcKwrDZyQbdpImZaF7JK644zL4yPcB_k06Revw3skUHISd6JSMISP5e/pub?gid=0&single=true&output=csv';

    Papa.parse(url, {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
            if (trackingNumber) {
                hideLoadingIndicator('tracking');
            } else if (customerCode) {
                hideLoadingIndicator('customer');
            }

            const rows = results.data;
            const headers = results.meta.fields;

            const requiredHeaders = ['Container Number', 'Booking Number', 'PO Number', 'Status', 'POL', 'POD', 'ETD', 'ETA', 'Customer Code'];
            const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
            if (missingHeaders.length > 0) {
                console.error(`Missing required columns: ${missingHeaders.join(', ')}`);
                const errorElement = trackingNumber ? 'trackingResult' : 'customerResult';
                document.getElementById(errorElement).innerHTML = 'Data format error. Please contact support.';
                return;
            }

            if (customerCode) {
                console.log(`Searching for customer code: ${customerCode}`);
                allShipments = rows.filter(row => 
                    normalizeString(row['Customer Code']) === normalizeString(customerCode)
                );
                console.log(`Found ${allShipments.length} shipments for customer code ${customerCode}`);
                if (allShipments.length > 0) {
                    sortShipments('ETA'); // Initially sort by ETA
                    displayShipments(1);
                } else {
                    document.getElementById('customerResult').innerHTML = 'No shipments found for this customer code.';
                }
            } else if (trackingNumber) {
                const shipments = rows.filter(row => {
                    const containerNumbers = normalizeString(row['Container Number']).split(',').map(cn => cn.trim());
                    return containerNumbers.includes(normalizeString(trackingNumber)) ||
                           normalizeString(row['Booking Number']) === normalizeString(trackingNumber) ||
                           normalizeString(row['PO Number']) === normalizeString(trackingNumber);
                });
                if (shipments.length > 0) {
                    displayTrackingInfo(shipments, trackingNumber);
                } else {
                    document.getElementById('trackingResult').innerHTML = 'No matching shipments found.';
                }
            }
        },
        error: function(err) {
            if (trackingNumber) {
                hideLoadingIndicator('tracking');
            } else if (customerCode) {
                hideLoadingIndicator('customer');
            }
            console.error('Error parsing CSV:', err);
            const errorElement = trackingNumber ? 'trackingResult' : 'customerResult';
            document.getElementById(errorElement).innerHTML = 'An error occurred while fetching tracking information. Please try again later.';
        }
    });
}

function parseDate(dateString) {
    if (dateString.toUpperCase() === 'TBA') {
        return { display: 'TBA', sortValue: new Date(8640000000000000) }; // Max date for sorting
    }
    // Assuming date format is DD/MM/YYYY
    const parts = dateString.split('/');
    if (parts.length === 3) {
        // Convert to Date object for sorting
        const dateObject = new Date(parts[2], parts[1] - 1, parts[0]);
        if (!isNaN(dateObject)) {
            return { 
                display: dateString, // Keep original string for display
                sortValue: dateObject // Use Date object for sorting
            };
        }
    }
    return { display: dateString, sortValue: new Date(0) }; // Invalid date, use epoch for sorting
}

const statusOrder = [
    "Not ready to ship",
    "Ready to ship",
    "On board vessel",
    "In transit",
    "Arrived at POD",
    "Delivered"
];

function getStatusSortIndex(status) {
    const index = statusOrder.indexOf(status);
    return index === -1 ? statusOrder.length : index; // Put unknown statuses at the end
}

function sortShipments(column) {
    if (column === currentSortColumn) {
        currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
    } else {
        currentSortColumn = column;
        currentSortOrder = 'asc';
    }

    allShipments.sort((a, b) => {
        let valueA = a[column] || '';
        let valueB = b[column] || '';

        if (column === 'Status') {
            const indexA = getStatusSortIndex(valueA);
            const indexB = getStatusSortIndex(valueB);
            return currentSortOrder === 'asc' ? indexA - indexB : indexB - indexA;
        } else if (column === 'ETD' || column === 'ETA') {
            const dateA = parseDate(valueA);
            const dateB = parseDate(valueB);

            if (dateA.sortValue < dateB.sortValue) return currentSortOrder === 'asc' ? -1 : 1;
            if (dateA.sortValue > dateB.sortValue) return currentSortOrder === 'asc' ? 1 : -1;
            return 0;
        } else {
            valueA = valueA.toLowerCase();
            valueB = valueB.toLowerCase();

            if (valueA < valueB) return currentSortOrder === 'asc' ? -1 : 1;
            if (valueA > valueB) return currentSortOrder === 'asc' ? 1 : -1;
            return 0;
        }
    });

    displayShipments(1);
}

function displayShipments(page) {
    currentPage = page;
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageShipments = allShipments.slice(start, end);

    let resultHTML = `
        <h2>All Shipments (Page ${page})</h2>
        <table>
            <tr>
                <th><button onclick="sortShipments('Booking Number')">Booking Number ${getSortIndicator('Booking Number')}</button></th>
                <th><button onclick="sortShipments('PO Number')">PO Number ${getSortIndicator('PO Number')}</button></th>
                <th><button onclick="sortShipments('Container Number')">Container Numbers ${getSortIndicator('Container Number')}</button></th>
                <th><button onclick="sortShipments('Status')">Status ${getSortIndicator('Status')}</button></th>
                <th><button onclick="sortShipments('POL')">POL ${getSortIndicator('POL')}</button></th>
                <th><button onclick="sortShipments('POD')">POD ${getSortIndicator('POD')}</button></th>
                <th><button onclick="sortShipments('ETD')">ETD ${getSortIndicator('ETD')}</button></th>
                <th><button onclick="sortShipments('ETA')">ETA ${getSortIndicator('ETA')}</button></th>
            </tr>
    `;

    pageShipments.forEach(shipment => {
        resultHTML += `
            <tr>
                <td>${escapeHTML(shipment['Booking Number'] || 'N/A')}</td>
                <td>${escapeHTML(shipment['PO Number'] || 'N/A')}</td>
                <td>${shipment['Container Number'].split(',').map(cn => escapeHTML(cn.trim())).join('<br>')}</td>
                <td>${escapeHTML(shipment['Status'] || 'N/A')}</td>
                <td>${escapeHTML(shipment['POL'] || 'N/A')}</td>
                <td>${escapeHTML(shipment['POD'] || 'N/A')}</td>
                <td>${escapeHTML(shipment['ETD'] || 'N/A')}</td>
                <td>${escapeHTML(shipment['ETA'] || 'N/A')}</td>
            </tr>
        `;
    });

    resultHTML += '</table>';

    document.getElementById('customerResult').innerHTML = resultHTML;

    displayPagination();
}

function getSortIndicator(column) {
    if (column === currentSortColumn) {
        return currentSortOrder === 'asc' ? '▲' : '▼';
    }
    return '';
}

function displayPagination() {
    const totalPages = Math.ceil(allShipments.length / itemsPerPage);
    let paginationHTML = '';

    if (currentPage > 1) {
        paginationHTML += `<button onclick="displayShipments(${currentPage - 1})">Previous</button>`;
    }

    paginationHTML += `<span>Page ${currentPage} of ${totalPages}</span>`;

    if (currentPage < totalPages) {
        paginationHTML += `<button onclick="displayShipments(${currentPage + 1})">Next</button>`;
    }

    document.getElementById('pagination').innerHTML = paginationHTML;
}

function displayTrackingInfo(shipments, searchedNumber) {
    let resultHTML = '<h2>Tracking Information</h2>';

    shipments.forEach(shipment => {
        const bookingNumber = escapeHTML(shipment['Booking Number'] || 'N/A');
        const poNumber = escapeHTML(shipment['PO Number'] || 'N/A');
        const status = escapeHTML(shipment['Status'] || 'N/A');
        const pol = escapeHTML(shipment['POL'] || 'N/A');
        const pod = escapeHTML(shipment['POD'] || 'N/A');
        const etd = escapeHTML(shipment['ETD'] || 'N/A');
        const eta = escapeHTML(shipment['ETA'] || 'N/A');
        const customerCodeDisplay = escapeHTML(shipment['Customer Code'] || 'N/A');

        const containerNumbers = shipment['Container Number'].split(',').map(cn => cn.trim());
        const containerLabel = containerNumbers.length > 1 ? "Container/s" : "Container";
        const containerDisplay = containerNumbers.join(', ');

        resultHTML += `
            <div>
                <p><strong>Customer Code:</strong> ${customerCodeDisplay}</p>
                <p><strong>Booking Number:</strong> ${bookingNumber}</p>
                <p><strong>PO Number:</strong> ${poNumber}</p>
                <p><strong>Status:</strong> ${status}</p>
                <p><strong>POL:</strong> ${pol}</p>
                <p><strong>POD:</strong> ${pod}</p>
                <p><strong>Estimated Time of Departure:</strong> ${etd}</p>
                <p><strong>Estimated Time of Arrival:</strong> ${eta}</p>
                <p><strong>${containerLabel}:</strong> ${escapeHTML(containerDisplay)}</p>
            </div>
        `;
    });

    document.getElementById('trackingResult').innerHTML = resultHTML;
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('trackShipmentBtn').addEventListener('click', function() {
        const trackingNumber = document.getElementById('trackingNumber').value.trim();
        if (!trackingNumber) {
            displayInputError('Please enter a tracking number.');
            return;
        }
        if (!isValidInput(trackingNumber)) {
            displayInputError('Please enter a valid alphanumeric tracking number.');
            return;
        }
        fetchTrackingInfo(trackingNumber, '');
    });

    document.getElementById('searchCustomerBtn').addEventListener('click', function() {
        const customerCode = document.getElementById('customerCode').value.trim();
        if (!customerCode) {
            displayInputError('Please enter a customer code.');
            return;
        }
        if (!isValidInput(customerCode)) {
            displayInputError('Please enter a valid alphanumeric customer code.');
            return;
        }
        fetchTrackingInfo('', customerCode);
    });
});