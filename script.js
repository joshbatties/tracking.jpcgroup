let allShipments = [];
const itemsPerPage = 10;
let currentPage = 1;

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

    document.getElementById('customerSummary').innerHTML = '';
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

            const requiredHeaders = ['Container Number', 'Booking Number', 'B/L Number', 'Status', 'Location', 'ETD', 'ETA', 'Customer Code'];
            const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
            if (missingHeaders.length > 0) {
                console.error(`Missing required columns: ${missingHeaders.join(', ')}`);
                document.getElementById('trackingResult').innerHTML = 'Data format error. Please contact support.';
                return;
            }

            if (customerCode) {
                allShipments = rows.filter(row => 
                    normalizeString(row['Customer Code']) === normalizeString(customerCode)
                );
                if (allShipments.length > 0) {
                    displayCustomerSummary(allShipments);
                    displayShipments(1);
                } else {
                    document.getElementById('customerResult').innerHTML = 'No shipments found for this customer code.';
                }
            } else if (trackingNumber) {
                const shipments = rows.filter(row => {
                    const containerNumbers = normalizeString(row['Container Number']).split(',').map(cn => cn.trim());
                    return containerNumbers.includes(normalizeString(trackingNumber)) ||
                           normalizeString(row['Booking Number']) === normalizeString(trackingNumber) ||
                           normalizeString(row['B/L Number']) === normalizeString(trackingNumber);
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

function displayCustomerSummary(shipments) {
    const totalShipments = shipments.length;
    const uniqueContainers = new Set(shipments.flatMap(s => s['Container Number'].split(',').map(c => c.trim()))).size;

    shipments.sort((a, b) => new Date(b.ETD) - new Date(a.ETD));
    const mostRecentShipment = shipments[0];

    let summaryHTML = `
        <h2>Summary</h2>
        <h3>Recent:</h3>
        <div>
            <p><strong>Booking Number:</strong> ${escapeHTML(mostRecentShipment['Booking Number'] || 'N/A')}</p>
            <p><strong>B/L Number:</strong> ${escapeHTML(mostRecentShipment['B/L Number'] || 'N/A')}</p>
            <p><strong>Status:</strong> ${escapeHTML(mostRecentShipment['Status'] || 'N/A')}</p>
            <p><strong>Current Location:</strong> ${escapeHTML(mostRecentShipment['Location'] || 'N/A')}</p>
            <p><strong>ETD:</strong> ${escapeHTML(mostRecentShipment['ETD'] || 'N/A')}</p>
            <p><strong>ETA:</strong> ${escapeHTML(mostRecentShipment['ETA'] || 'N/A')}</p>
            <p><strong>Container Numbers:</strong> ${escapeHTML(mostRecentShipment['Container Number'] || 'N/A')}</p>
        </div>
        <h3>Totals:</h3>
        <p>Total Shipments: ${totalShipments}</p>
        <p>Total Containers: ${uniqueContainers}</p>
    `;

    document.getElementById('customerSummary').innerHTML = summaryHTML;
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
                <th>Booking Number</th>
                <th>B/L Number</th>
                <th>Container Numbers</th>
                <th>Status</th>
                <th>Location</th>
                <th>ETD</th>
                <th>ETA</th>
            </tr>
    `;

    pageShipments.forEach(shipment => {
        resultHTML += `
            <tr>
                <td>${escapeHTML(shipment['Booking Number'] || 'N/A')}</td>
                <td>${escapeHTML(shipment['B/L Number'] || 'N/A')}</td>
                <td>${shipment['Container Number'].split(',').map(cn => escapeHTML(cn.trim())).join('<br>')}</td>
                <td>${escapeHTML(shipment['Status'] || 'N/A')}</td>
                <td>${escapeHTML(shipment['Location'] || 'N/A')}</td>
                <td>${escapeHTML(shipment['ETD'] || 'N/A')}</td>
                <td>${escapeHTML(shipment['ETA'] || 'N/A')}</td>
            </tr>
        `;
    });

    resultHTML += '</table>';

    document.getElementById('customerResult').innerHTML = resultHTML;

    displayPagination();
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
        const blNumber = escapeHTML(shipment['B/L Number'] || 'N/A');
        const status = escapeHTML(shipment['Status'] || 'N/A');
        const location = escapeHTML(shipment['Location'] || 'N/A');
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
                <p><strong>Bill of Lading Number:</strong> ${blNumber}</p>
                <p><strong>Status:</strong> ${status}</p>
                <p><strong>Current Location:</strong> ${location}</p>
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