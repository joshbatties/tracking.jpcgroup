async function fetchFromBackend() {
    try {
      const response = await fetch('https://your-vercel-project-name.vercel.app/api/sheets'); // Replace with your Vercel URL
      const data = await response.json();

      if (data) {
        const dataContainer = document.getElementById('data');
        data.forEach(row => {
          const rowElement = document.createElement('p');
          rowElement.textContent = row.join(', ');
          dataContainer.appendChild(rowElement);
        });
      } else {
        console.log('No data found');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  fetchFromBackend();
