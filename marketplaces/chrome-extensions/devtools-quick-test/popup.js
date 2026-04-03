// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {

  // Tab switching
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tool-container').forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(`${tab.dataset.tool}-tool`).classList.add('active');
    });
  });

  // JSON buttons
  document.getElementById('btn-format-json').addEventListener('click', formatJson);
  document.getElementById('btn-minify-json').addEventListener('click', minifyJson);
  document.getElementById('btn-validate-json').addEventListener('click', validateJson);
  document.getElementById('btn-copy-json').addEventListener('click', () => copyOutput('json-output'));

  // Base64 buttons
  document.getElementById('btn-encode-base64').addEventListener('click', encodeBase64);
  document.getElementById('btn-decode-base64').addEventListener('click', decodeBase64);
  document.getElementById('btn-copy-base64').addEventListener('click', () => copyOutput('base64-output'));

  // Hash buttons
  document.getElementById('btn-generate-hash').addEventListener('click', generateHash);
  document.getElementById('btn-copy-hash').addEventListener('click', () => copyOutput('hash-output'));

  // URL buttons
  document.getElementById('btn-encode-url').addEventListener('click', encodeUrl);
  document.getElementById('btn-decode-url').addEventListener('click', decodeUrl);
  document.getElementById('btn-copy-url').addEventListener('click', () => copyOutput('url-output'));

  // UUID buttons
  document.getElementById('btn-generate-uuid').addEventListener('click', generateUuid);
  document.getElementById('btn-generate-multiple-uuids').addEventListener('click', generateMultipleUuids);
  document.getElementById('btn-copy-uuid').addEventListener('click', () => copyOutput('uuid-output'));

});

// JSON Functions
function formatJson() {
  const input = document.getElementById('json-input').value;
  const output = document.getElementById('json-output');
  const status = document.getElementById('json-status');

  try {
    const parsed = JSON.parse(input);
    output.value = JSON.stringify(parsed, null, 2);
    showStatus(status, 'Valid JSON - Formatted successfully!', 'success');
  } catch (e) {
    showStatus(status, `Invalid JSON: ${e.message}`, 'error');
  }
}

function minifyJson() {
  const input = document.getElementById('json-input').value;
  const output = document.getElementById('json-output');
  const status = document.getElementById('json-status');

  try {
    const parsed = JSON.parse(input);
    output.value = JSON.stringify(parsed);
    showStatus(status, 'Minified successfully!', 'success');
  } catch (e) {
    showStatus(status, `Invalid JSON: ${e.message}`, 'error');
  }
}

function validateJson() {
  const input = document.getElementById('json-input').value;
  const status = document.getElementById('json-status');

  try {
    JSON.parse(input);
    showStatus(status, 'Valid JSON!', 'success');
  } catch (e) {
    showStatus(status, `Invalid: ${e.message}`, 'error');
  }
}

// Base64 Functions
function encodeBase64() {
  const input = document.getElementById('base64-input').value;
  const output = document.getElementById('base64-output');
  const status = document.getElementById('base64-status');

  try {
    output.value = btoa(unescape(encodeURIComponent(input)));
    showStatus(status, 'Encoded successfully!', 'success');
  } catch (e) {
    showStatus(status, `Error: ${e.message}`, 'error');
  }
}

function decodeBase64() {
  const input = document.getElementById('base64-input').value;
  const output = document.getElementById('base64-output');
  const status = document.getElementById('base64-status');

  try {
    output.value = decodeURIComponent(escape(atob(input)));
    showStatus(status, 'Decoded successfully!', 'success');
  } catch (e) {
    showStatus(status, `Invalid Base64: ${e.message}`, 'error');
  }
}

// Hash Functions
async function generateHash() {
  const input = document.getElementById('hash-input').value;
  const output = document.getElementById('hash-output');
  const hashType = document.querySelector('input[name="hash-type"]:checked').value;

  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest(hashType, data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  output.value = hashHex;
}

// URL Functions
function encodeUrl() {
  const input = document.getElementById('url-input').value;
  const output = document.getElementById('url-output');
  output.value = encodeURIComponent(input);
}

function decodeUrl() {
  const input = document.getElementById('url-input').value;
  const output = document.getElementById('url-output');
  try {
    output.value = decodeURIComponent(input);
  } catch (e) {
    output.value = 'Error: Invalid encoded URL';
  }
}

// UUID Functions
function generateUuid() {
  const output = document.getElementById('uuid-output');
  output.value = crypto.randomUUID();
}

function generateMultipleUuids() {
  const output = document.getElementById('uuid-output');
  const uuids = [];
  for (let i = 0; i < 5; i++) {
    uuids.push(crypto.randomUUID());
  }
  output.value = uuids.join('\n');
}

// Utility Functions
function copyOutput(elementId) {
  const output = document.getElementById(elementId);
  navigator.clipboard.writeText(output.value).then(() => {
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(() => {
      btn.textContent = originalText;
    }, 1500);
  });
}

function showStatus(element, message, type) {
  element.textContent = message;
  element.className = `status ${type}`;
  element.style.display = 'block';
  setTimeout(() => {
    element.style.display = 'none';
  }, 3000);
}
