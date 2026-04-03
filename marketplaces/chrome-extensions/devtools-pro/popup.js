// DevTools Pro - AI-Powered Developer Tools
// API Configuration
const API_BASE = 'https://api.wants.chat/api/v1';
let userCredits = 5;
let userPlan = 'free';

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  loadUserStatus();
  initTabs();
  initCodeReview();
  initErrorExplainer();
  initRegexBuilder();
  initTypeScriptGenerator();
  initJsonTools();
  initConverters();
});

// Load user status from storage
function loadUserStatus() {
  chrome.storage.local.get(['credits', 'plan', 'apiKey'], (result) => {
    userCredits = result.credits ?? 5;
    userPlan = result.plan ?? 'free';
    updateUserStatus();
  });
}

function updateUserStatus() {
  document.getElementById('user-plan').textContent = userPlan === 'pro' ? 'Pro Plan' : 'Free Plan';
  document.getElementById('user-credits').textContent = userPlan === 'pro'
    ? 'Unlimited AI'
    : `${userCredits} AI credits left`;
}

function useCredit() {
  if (userPlan === 'pro') return true;
  if (userCredits <= 0) {
    showUpgradePrompt();
    return false;
  }
  userCredits--;
  chrome.storage.local.set({ credits: userCredits });
  updateUserStatus();
  return true;
}

function showUpgradePrompt() {
  const result = document.getElementById('code-review-result') ||
                 document.getElementById('error-result') ||
                 document.getElementById('regex-matches');
  if (result) {
    result.innerHTML = `
      <div class="upgrade-banner">
        <h3>Out of Free Credits</h3>
        <p>Upgrade to Pro for unlimited AI-powered code reviews, error explanations, and more.</p>
        <button onclick="window.open('https://wants.chat/devtools-pro', '_blank')">
          Upgrade to Pro - $9.99/month
        </button>
      </div>
    `;
  }
}

// Tab switching
function initTabs() {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tool-container').forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(`${tab.dataset.tool}-tool`).classList.add('active');
    });
  });
}

// ==================== AI CODE REVIEW ====================
function initCodeReview() {
  document.getElementById('btn-review-code').addEventListener('click', reviewCode);
}

async function reviewCode() {
  const code = document.getElementById('code-input').value.trim();
  const language = document.getElementById('code-language').value;
  const status = document.getElementById('code-review-status');
  const result = document.getElementById('code-review-result');

  if (!code) {
    showStatus(status, 'Please paste some code to review', 'error');
    return;
  }

  if (!useCredit()) return;

  const checks = [];
  if (document.getElementById('check-security').checked) checks.push('security');
  if (document.getElementById('check-performance').checked) checks.push('performance');
  if (document.getElementById('check-bestpractices').checked) checks.push('best practices');
  if (document.getElementById('check-bugs').checked) checks.push('potential bugs');

  showStatus(status, '<span class="spinner"></span> Analyzing code with AI...', 'loading');
  result.innerHTML = '';

  try {
    const response = await callAI('code-review', {
      code,
      language,
      checks
    });

    status.style.display = 'none';
    result.innerHTML = formatCodeReviewResult(response);
  } catch (error) {
    showStatus(status, `Error: ${error.message}`, 'error');
  }
}

function formatCodeReviewResult(response) {
  // Mock response for demo - in production this comes from API
  const mockIssues = [
    { severity: 'high', type: 'Security', message: 'SQL Injection vulnerability detected. Use parameterized queries instead of string concatenation.', line: 2 },
    { severity: 'high', type: 'Security', message: 'Plain text password comparison. Never store or compare passwords in plain text.', line: 2 },
    { severity: 'medium', type: 'Performance', message: 'Consider using prepared statements for better query caching.', line: 2 },
    { severity: 'low', type: 'Best Practice', message: 'Add input validation for username and password parameters.', line: 1 }
  ];

  const issues = response?.issues || mockIssues;

  let html = '<div class="result-card"><h4>Review Results</h4><ul>';
  issues.forEach(issue => {
    html += `
      <li>
        <span class="severity-${issue.severity}">[${issue.severity.toUpperCase()}]</span>
        <div>
          <strong>${issue.type}</strong> (line ${issue.line})<br>
          ${issue.message}
        </div>
      </li>
    `;
  });
  html += '</ul></div>';

  if (response?.suggestion) {
    html += `
      <div class="result-card">
        <h4>Suggested Fix</h4>
        <pre style="font-size: 11px; overflow-x: auto; background: #0f0f1a; padding: 10px; border-radius: 4px;">${escapeHtml(response.suggestion)}</pre>
      </div>
    `;
  }

  return html;
}

// ==================== AI ERROR EXPLAINER ====================
function initErrorExplainer() {
  document.getElementById('btn-explain-error').addEventListener('click', explainError);
}

async function explainError() {
  const error = document.getElementById('error-input').value.trim();
  const context = document.getElementById('error-context').value.trim();
  const status = document.getElementById('error-status');
  const result = document.getElementById('error-result');

  if (!error) {
    showStatus(status, 'Please paste an error message', 'error');
    return;
  }

  if (!useCredit()) return;

  showStatus(status, '<span class="spinner"></span> Analyzing error with AI...', 'loading');
  result.innerHTML = '';

  try {
    const response = await callAI('error-explain', { error, context });

    status.style.display = 'none';
    result.innerHTML = formatErrorResult(response);
  } catch (err) {
    showStatus(status, `Error: ${err.message}`, 'error');
  }
}

function formatErrorResult(response) {
  // Mock response for demo
  const mock = {
    explanation: "This error occurs when you try to call the .map() method on an undefined value. In React, this typically happens when you're trying to render a list but the data hasn't loaded yet.",
    cause: "The 'users' variable is undefined when the component first renders, before the API call completes.",
    fix: "Add a null check or default value: users?.map() or (users || []).map()",
    code: `// Option 1: Optional chaining
{users?.map(user => <UserCard key={user.id} user={user} />)}

// Option 2: Default empty array
{(users || []).map(user => <UserCard key={user.id} user={user} />)}

// Option 3: Early return
if (!users) return <Loading />;
return users.map(user => <UserCard key={user.id} user={user} />);`
  };

  const data = response || mock;

  return `
    <div class="result-card">
      <h4>What's happening?</h4>
      <p style="font-size: 12px; line-height: 1.5;">${data.explanation}</p>
    </div>
    <div class="result-card">
      <h4>Root Cause</h4>
      <p style="font-size: 12px; line-height: 1.5;">${data.cause}</p>
    </div>
    <div class="result-card">
      <h4>How to Fix</h4>
      <p style="font-size: 12px; line-height: 1.5; margin-bottom: 10px;">${data.fix}</p>
      <pre style="font-size: 11px; overflow-x: auto; background: #0f0f1a; padding: 10px; border-radius: 4px;">${escapeHtml(data.code)}</pre>
    </div>
  `;
}

// ==================== AI REGEX BUILDER ====================
function initRegexBuilder() {
  document.getElementById('btn-build-regex').addEventListener('click', buildRegex);
  document.getElementById('btn-test-regex').addEventListener('click', testRegex);
  document.getElementById('btn-copy-regex').addEventListener('click', () => copyToClipboard('regex-output'));
}

async function buildRegex() {
  const description = document.getElementById('regex-description').value.trim();
  const status = document.getElementById('regex-status');
  const output = document.getElementById('regex-output');

  if (!description) {
    showStatus(status, 'Please describe what you want to match', 'error');
    return;
  }

  if (!useCredit()) return;

  showStatus(status, '<span class="spinner"></span> Generating regex with AI...', 'loading');

  try {
    const response = await callAI('regex-build', { description });

    status.style.display = 'none';
    // Mock response
    const patterns = {
      'email': '/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/g',
      'url': '/https?:\\/\\/[^\\s]+/g',
      'phone': '/\\(\\d{3}\\)\\s?\\d{3}-\\d{4}/g',
      'date': '/\\d{4}-\\d{2}-\\d{2}/g',
      'hashtag': '/#[a-zA-Z0-9_]+/g'
    };

    let pattern = response?.pattern || patterns.email;
    if (description.toLowerCase().includes('url')) pattern = patterns.url;
    if (description.toLowerCase().includes('phone')) pattern = patterns.phone;
    if (description.toLowerCase().includes('date')) pattern = patterns.date;
    if (description.toLowerCase().includes('hashtag')) pattern = patterns.hashtag;

    output.value = pattern;
  } catch (error) {
    showStatus(status, `Error: ${error.message}`, 'error');
  }
}

function testRegex() {
  const pattern = document.getElementById('regex-output').value.trim();
  const testInput = document.getElementById('regex-test-input').value;
  const matchesDiv = document.getElementById('regex-matches');

  if (!pattern) {
    matchesDiv.innerHTML = '<div class="status error" style="display:block;">Generate a pattern first</div>';
    return;
  }

  try {
    // Extract pattern and flags
    const match = pattern.match(/^\/(.*)\/([gimsuvy]*)$/);
    let regex;
    if (match) {
      regex = new RegExp(match[1], match[2]);
    } else {
      regex = new RegExp(pattern, 'g');
    }

    const matches = testInput.match(regex);

    if (matches && matches.length > 0) {
      matchesDiv.innerHTML = `
        <div class="result-card">
          <h4>Matches Found: ${matches.length}</h4>
          <ul>
            ${matches.map((m, i) => `<li><code>${escapeHtml(m)}</code></li>`).join('')}
          </ul>
        </div>
      `;
    } else {
      matchesDiv.innerHTML = '<div class="status error" style="display:block;">No matches found</div>';
    }
  } catch (error) {
    matchesDiv.innerHTML = `<div class="status error" style="display:block;">Invalid regex: ${error.message}</div>`;
  }
}

// ==================== TYPESCRIPT GENERATOR (FREE) ====================
function initTypeScriptGenerator() {
  document.getElementById('btn-generate-ts').addEventListener('click', generateTypeScript);
  document.getElementById('btn-copy-ts').addEventListener('click', () => copyToClipboard('ts-output'));
}

function generateTypeScript() {
  const jsonInput = document.getElementById('ts-json-input').value.trim();
  const interfaceName = document.getElementById('ts-interface-name').value.trim() || 'Root';
  const status = document.getElementById('ts-status');
  const output = document.getElementById('ts-output');

  if (!jsonInput) {
    showStatus(status, 'Please paste JSON to convert', 'error');
    return;
  }

  try {
    const parsed = JSON.parse(jsonInput);
    const interfaces = [];
    const generatedInterface = jsonToTypeScript(parsed, interfaceName, interfaces);
    output.value = interfaces.join('\n\n');
    showStatus(status, 'TypeScript interfaces generated!', 'success');
  } catch (error) {
    showStatus(status, `Invalid JSON: ${error.message}`, 'error');
  }
}

function jsonToTypeScript(obj, name, interfaces, depth = 0) {
  const indent = '  ';
  let result = `interface ${name} {\n`;

  for (const [key, value] of Object.entries(obj)) {
    const type = getTypeScriptType(value, key, interfaces, depth);
    result += `${indent}${key}: ${type};\n`;
  }

  result += '}';
  interfaces.push(result);
  return name;
}

function getTypeScriptType(value, key, interfaces, depth) {
  if (value === null) return 'null';
  if (Array.isArray(value)) {
    if (value.length === 0) return 'any[]';
    const firstType = getTypeScriptType(value[0], key, interfaces, depth);
    return `${firstType}[]`;
  }

  switch (typeof value) {
    case 'string': return 'string';
    case 'number': return 'number';
    case 'boolean': return 'boolean';
    case 'object':
      const nestedName = capitalize(key);
      jsonToTypeScript(value, nestedName, interfaces, depth + 1);
      return nestedName;
    default: return 'any';
  }
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ==================== JSON TOOLS (FREE) ====================
function initJsonTools() {
  document.getElementById('btn-format-json').addEventListener('click', formatJson);
  document.getElementById('btn-minify-json').addEventListener('click', minifyJson);
  document.getElementById('btn-validate-json').addEventListener('click', validateJson);
  document.getElementById('btn-copy-json').addEventListener('click', () => copyToClipboard('json-output'));
}

function formatJson() {
  const input = document.getElementById('json-input').value;
  const output = document.getElementById('json-output');
  const status = document.getElementById('json-status');

  try {
    const parsed = JSON.parse(input);
    output.value = JSON.stringify(parsed, null, 2);
    showStatus(status, 'Formatted successfully!', 'success');
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

// ==================== CONVERTERS (FREE) ====================
function initConverters() {
  document.getElementById('btn-convert').addEventListener('click', convert);
  document.getElementById('btn-copy-convert').addEventListener('click', () => copyToClipboard('convert-output'));
}

async function convert() {
  const type = document.getElementById('converter-type').value;
  const input = document.getElementById('convert-input').value;
  const output = document.getElementById('convert-output');
  const status = document.getElementById('convert-status');

  try {
    let result;
    switch (type) {
      case 'base64-encode':
        result = btoa(unescape(encodeURIComponent(input)));
        break;
      case 'base64-decode':
        result = decodeURIComponent(escape(atob(input)));
        break;
      case 'url-encode':
        result = encodeURIComponent(input);
        break;
      case 'url-decode':
        result = decodeURIComponent(input);
        break;
      case 'hash-sha256':
        result = await hashText(input, 'SHA-256');
        break;
      case 'hash-sha512':
        result = await hashText(input, 'SHA-512');
        break;
      case 'uuid':
        result = crypto.randomUUID();
        break;
      case 'jwt-decode':
        result = decodeJWT(input);
        break;
    }
    output.value = result;
    showStatus(status, 'Converted successfully!', 'success');
  } catch (e) {
    showStatus(status, `Error: ${e.message}`, 'error');
  }
}

async function hashText(text, algorithm) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest(algorithm, data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function decodeJWT(token) {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Invalid JWT format');

  const header = JSON.parse(atob(parts[0]));
  const payload = JSON.parse(atob(parts[1]));

  return JSON.stringify({ header, payload }, null, 2);
}

// ==================== API CALL ====================
async function callAI(endpoint, data) {
  // For demo/testing, return mock data
  // In production, uncomment the fetch call below

  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
  return null; // Let individual functions handle mock data

  /*
  const response = await fetch(`${API_BASE}/devtools/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${await getApiKey()}`
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error('API request failed');
  }

  return response.json();
  */
}

async function getApiKey() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['apiKey'], (result) => {
      resolve(result.apiKey || '');
    });
  });
}

// ==================== UTILITIES ====================
function showStatus(element, message, type) {
  element.innerHTML = message;
  element.className = `status ${type}`;
  element.style.display = 'block';

  if (type !== 'loading') {
    setTimeout(() => {
      element.style.display = 'none';
    }, 4000);
  }
}

function copyToClipboard(elementId) {
  const element = document.getElementById(elementId);
  navigator.clipboard.writeText(element.value).then(() => {
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(() => {
      btn.textContent = originalText;
    }, 1500);
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
