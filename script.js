// Disable or enable ports input based on selected scan type
const allPortsRadio = document.getElementById('allPorts');
const customPortsRadio = document.getElementById('customPorts');
const portsInput = document.getElementById('ports');

allPortsRadio.addEventListener('change', () => portsInput.disabled = true);
customPortsRadio.addEventListener('change', () => portsInput.disabled = false);

// Validate IP Address input: only numbers and dots allowed
document.getElementById('ipAddress').addEventListener('input', (e) => {
  e.target.value = e.target.value.replace(/[^0-9.]/g, '');
});

// Validate Ports input: only numbers and commas allowed
portsInput.addEventListener('input', (e) => {
  e.target.value = e.target.value.replace(/[^0-9,]/g, '');
});

// Form submission and scan logic
document.getElementById('scanForm').addEventListener('submit', async (e) => {
  e.preventDefault(); // Prevent form from reloading the page

  const ipAddress = document.getElementById('ipAddress').value;
  const portsInputValue = portsInput.value;
  const scanType = document.querySelector('input[name="scanType"]:checked').value;

  let ports = [];
  if (scanType === 'custom' && portsInputValue) {
    ports = portsInputValue.split(',').map(port => port.trim());
  }

  const payload = { ip: ipAddress, ports: scanType === 'all' ? [] : ports };

  try {
    const response = await fetch('http://127.0.0.1:5000/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error('Failed to fetch scan results.');
    }

    const results = await response.json();
    displayResults(results);
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred while scanning. Please try again.');
  }
});

function displayResults(results) {
  const openPortsList = document.getElementById('openPorts');
  const closedPortsList = document.getElementById('closedPorts');

  openPortsList.innerHTML = '';
  closedPortsList.innerHTML = '';

  for (const [port, status] of Object.entries(results)) {
    const listItem = document.createElement('li');
    listItem.textContent = `Port ${port}: ${status}`;

    if (status === 'OPEN') {
      openPortsList.appendChild(listItem);
    } else {
      closedPortsList.appendChild(listItem);
    }
  }

  document.getElementById('results').classList.remove('hidden');
}
const toggleSwitch = document.getElementById('toggleSwitch');
const toggleCircle = document.createElement('div');
toggleCircle.classList.add('toggle-circle');
toggleSwitch.appendChild(toggleCircle);

toggleSwitch.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    document.querySelector('.container').classList.toggle('light-mode');
    document.querySelectorAll('input').forEach(input => {
        input.classList.toggle('light-mode');
    });
    toggleSwitch.classList.toggle('light-mode');

    // Move the toggle circle
    toggleCircle.classList.toggle('move');
});
