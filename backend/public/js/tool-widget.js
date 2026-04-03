/**
 * Wants Tool Widget - Embeddable Widget for Data-Driven Tools
 *
 * Usage (Production):
 * <script src="https://api.wants.chat/js/tool-widget.js" data-token="wgt_xxx"></script>
 *
 * Usage (Development):
 * <script src="http://localhost:3188/js/tool-widget.js" data-token="wgt_xxx"></script>
 *
 * Or with options:
 * <script src="https://api.wants.chat/js/tool-widget.js"
 *   data-token="wgt_xxx"
 *   data-container="my-container-id"
 *   data-theme="dark"
 *   data-api-url="http://localhost:3188"
 * ></script>
 */
(function() {
  'use strict';

  // Get the current script element
  const currentScript = document.currentScript || (function() {
    const scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  // Auto-detect API URL based on script source
  function detectApiUrl() {
    const scriptSrc = currentScript.src || '';
    try {
      const url = new URL(scriptSrc);
      // If script is loaded from localhost, use localhost API
      if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
        return `${url.protocol}//${url.host}`;
      }
    } catch (e) {
      // Ignore URL parsing errors
    }
    // Default to production
    return 'https://api.wants.chat';
  }

  // Configuration from script attributes
  const CONFIG = {
    token: currentScript.getAttribute('data-token') || '',
    container: currentScript.getAttribute('data-container') || null,
    theme: currentScript.getAttribute('data-theme') || 'auto',
    apiUrl: currentScript.getAttribute('data-api-url') || detectApiUrl(),
  };

  // Widget state
  let widgetData = null;
  let widgetConfig = null;
  let containerElement = null;

  // Styles
  const WIDGET_STYLES = `
    .wants-widget {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      box-sizing: border-box;
      background: var(--wants-bg, #ffffff);
      color: var(--wants-text, #1f2937);
      border: 1px solid var(--wants-border, #e5e7eb);
      border-radius: var(--wants-radius, 8px);
      overflow: hidden;
    }

    .wants-widget * {
      box-sizing: border-box;
    }

    .wants-widget.dark {
      --wants-bg: #1f2937;
      --wants-text: #f9fafb;
      --wants-border: #374151;
      --wants-header-bg: #111827;
      --wants-card-bg: #374151;
      --wants-muted: #9ca3af;
    }

    .wants-widget.light {
      --wants-bg: #ffffff;
      --wants-text: #1f2937;
      --wants-border: #e5e7eb;
      --wants-header-bg: #f9fafb;
      --wants-card-bg: #ffffff;
      --wants-muted: #6b7280;
    }

    .wants-widget-header {
      background: var(--wants-header-bg, #f9fafb);
      padding: 16px;
      border-bottom: 1px solid var(--wants-border, #e5e7eb);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .wants-widget-title {
      font-size: 18px;
      font-weight: 600;
      margin: 0;
    }

    .wants-widget-badge {
      font-size: 12px;
      color: var(--wants-muted, #6b7280);
      background: var(--wants-bg, #ffffff);
      padding: 4px 8px;
      border-radius: 4px;
      border: 1px solid var(--wants-border, #e5e7eb);
    }

    .wants-widget-body {
      padding: 16px;
      max-height: 500px;
      overflow-y: auto;
    }

    .wants-widget-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
    }

    .wants-widget-card {
      background: var(--wants-card-bg, #ffffff);
      border: 1px solid var(--wants-border, #e5e7eb);
      border-radius: calc(var(--wants-radius, 8px) - 2px);
      padding: 16px;
      transition: box-shadow 0.2s ease;
    }

    .wants-widget-card:hover {
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }

    .wants-widget-card-title {
      font-size: 16px;
      font-weight: 600;
      margin: 0 0 8px 0;
      color: var(--wants-text, #1f2937);
    }

    .wants-widget-card-field {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 0;
      border-bottom: 1px solid var(--wants-border, #e5e7eb);
      font-size: 14px;
    }

    .wants-widget-card-field:last-child {
      border-bottom: none;
    }

    .wants-widget-card-label {
      color: var(--wants-muted, #6b7280);
    }

    .wants-widget-card-value {
      font-weight: 500;
      color: var(--wants-text, #1f2937);
    }

    .wants-widget-empty {
      text-align: center;
      padding: 40px 20px;
      color: var(--wants-muted, #6b7280);
    }

    .wants-widget-empty-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }

    .wants-widget-error {
      text-align: center;
      padding: 40px 20px;
      color: #ef4444;
    }

    .wants-widget-loading {
      text-align: center;
      padding: 40px 20px;
      color: var(--wants-muted, #6b7280);
    }

    .wants-widget-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid var(--wants-border, #e5e7eb);
      border-top-color: var(--wants-primary, #0d9488);
      border-radius: 50%;
      animation: wants-spin 1s linear infinite;
      margin: 0 auto 16px;
    }

    @keyframes wants-spin {
      to { transform: rotate(360deg); }
    }

    .wants-widget-footer {
      background: var(--wants-header-bg, #f9fafb);
      padding: 12px 16px;
      border-top: 1px solid var(--wants-border, #e5e7eb);
      text-align: center;
      font-size: 12px;
      color: var(--wants-muted, #6b7280);
    }

    .wants-widget-footer a {
      color: var(--wants-primary, #0d9488);
      text-decoration: none;
    }

    .wants-widget-footer a:hover {
      text-decoration: underline;
    }

    .wants-widget-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }

    .wants-widget-table th,
    .wants-widget-table td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid var(--wants-border, #e5e7eb);
    }

    .wants-widget-table th {
      background: var(--wants-header-bg, #f9fafb);
      font-weight: 600;
      color: var(--wants-text, #1f2937);
    }

    .wants-widget-table tr:hover {
      background: var(--wants-header-bg, #f9fafb);
    }
  `;

  // Inject styles
  function injectStyles() {
    const styleEl = document.createElement('style');
    styleEl.id = 'wants-widget-styles';
    styleEl.textContent = WIDGET_STYLES;
    document.head.appendChild(styleEl);
  }

  // Create container
  function createContainer() {
    if (CONFIG.container) {
      containerElement = document.getElementById(CONFIG.container);
      if (!containerElement) {
        console.error('[Wants Widget] Container not found:', CONFIG.container);
        return null;
      }
    } else {
      // Create container after current script
      containerElement = document.createElement('div');
      containerElement.id = 'wants-widget-' + Date.now();
      currentScript.parentNode.insertBefore(containerElement, currentScript.nextSibling);
    }
    return containerElement;
  }

  // Determine theme
  function getTheme() {
    if (widgetConfig?.theme && widgetConfig.theme !== 'auto') {
      return widgetConfig.theme;
    }
    if (CONFIG.theme && CONFIG.theme !== 'auto') {
      return CONFIG.theme;
    }
    // Auto-detect based on system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  // Format value for display
  function formatValue(value, type) {
    if (value === null || value === undefined) return '-';

    switch (type) {
      case 'currency':
        return typeof value === 'number'
          ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
          : value;
      case 'date':
        return new Date(value).toLocaleDateString();
      case 'datetime':
        return new Date(value).toLocaleString();
      case 'checkbox':
        return value ? 'Yes' : 'No';
      case 'multiselect':
        return Array.isArray(value) ? value.join(', ') : value;
      default:
        return String(value);
    }
  }

  // Render loading state
  function renderLoading() {
    containerElement.innerHTML = `
      <div class="wants-widget ${getTheme()}">
        <div class="wants-widget-loading">
          <div class="wants-widget-spinner"></div>
          <div>Loading...</div>
        </div>
      </div>
    `;
  }

  // Render error state
  function renderError(message) {
    containerElement.innerHTML = `
      <div class="wants-widget ${getTheme()}">
        <div class="wants-widget-error">
          <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
          <div>${message}</div>
        </div>
      </div>
    `;
  }

  // Render empty state
  function renderEmpty() {
    const theme = getTheme();
    const showHeader = widgetConfig?.show_header !== false;
    const showFooter = widgetConfig?.show_footer !== false;

    containerElement.innerHTML = `
      <div class="wants-widget ${theme}" style="--wants-primary: ${widgetConfig?.primary_color || '#0d9488'}; --wants-radius: ${widgetConfig?.border_radius || 8}px;">
        ${showHeader ? `
          <div class="wants-widget-header">
            <h3 class="wants-widget-title">${widgetConfig?.widget_name || 'Data Widget'}</h3>
          </div>
        ` : ''}
        <div class="wants-widget-empty">
          <div class="wants-widget-empty-icon">📭</div>
          <div>No data available</div>
        </div>
        ${showFooter ? `
          <div class="wants-widget-footer">
            Powered by <a href="https://wants.chat" target="_blank" rel="noopener">Wants</a>
          </div>
        ` : ''}
      </div>
    `;
  }

  // Get display fields from item and custom fields
  function getDisplayFields(item, customFields) {
    const fields = [];
    const skipFields = ['id', 'createdAt', 'updatedAt', 'created_at', 'updated_at', 'user_id', 'userId'];

    // Add custom fields first
    if (customFields && customFields.length > 0) {
      for (const field of customFields) {
        if (item[field.key] !== undefined) {
          fields.push({
            key: field.key,
            label: field.name,
            value: item[field.key],
            type: field.type,
          });
        }
      }
    }

    // Add standard fields
    for (const [key, value] of Object.entries(item)) {
      if (skipFields.includes(key)) continue;
      if (fields.some(f => f.key === key)) continue;

      fields.push({
        key,
        label: key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim(),
        value,
        type: typeof value === 'number' ? 'number' : 'text',
      });
    }

    return fields.slice(0, 6); // Limit to 6 fields per card
  }

  // Get title field from item
  function getTitleField(item) {
    const titleFields = ['title', 'name', 'label', 'heading', 'subject'];
    for (const field of titleFields) {
      if (item[field]) return item[field];
    }
    return item.id ? `Item #${item.id}` : 'Item';
  }

  // Render widget with data
  function renderWidget() {
    const theme = getTheme();
    const showHeader = widgetConfig?.show_header !== false;
    const showFooter = widgetConfig?.show_footer !== false;
    const items = widgetData?.items || [];
    const customFields = widgetData?.customFields || [];

    if (items.length === 0) {
      return renderEmpty();
    }

    const cardsHtml = items.map(item => {
      const title = getTitleField(item);
      const fields = getDisplayFields(item, customFields);

      return `
        <div class="wants-widget-card">
          <h4 class="wants-widget-card-title">${escapeHtml(title)}</h4>
          ${fields.map(field => `
            <div class="wants-widget-card-field">
              <span class="wants-widget-card-label">${escapeHtml(field.label)}</span>
              <span class="wants-widget-card-value">${escapeHtml(formatValue(field.value, field.type))}</span>
            </div>
          `).join('')}
        </div>
      `;
    }).join('');

    containerElement.innerHTML = `
      <div class="wants-widget ${theme}" style="--wants-primary: ${widgetConfig?.primary_color || '#0d9488'}; --wants-radius: ${widgetConfig?.border_radius || 8}px;">
        ${showHeader ? `
          <div class="wants-widget-header">
            <h3 class="wants-widget-title">${escapeHtml(widgetConfig?.widget_name || 'Data Widget')}</h3>
            <span class="wants-widget-badge">${items.length} items</span>
          </div>
        ` : ''}
        <div class="wants-widget-body">
          <div class="wants-widget-grid">
            ${cardsHtml}
          </div>
        </div>
        ${showFooter ? `
          <div class="wants-widget-footer">
            Powered by <a href="https://wants.chat" target="_blank" rel="noopener">Wants</a>
          </div>
        ` : ''}
      </div>
    `;

    // Apply custom CSS if provided
    if (widgetConfig?.custom_css) {
      const customStyleEl = document.createElement('style');
      customStyleEl.textContent = widgetConfig.custom_css;
      containerElement.querySelector('.wants-widget').appendChild(customStyleEl);
    }
  }

  // Escape HTML
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Fetch widget data
  async function fetchWidgetData() {
    const response = await fetch(`${CONFIG.apiUrl}/api/v1/widgets/embed/${CONFIG.token}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch widget data');
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to load widget');
    }

    return result.data;
  }

  // Log event
  async function logEvent(eventType, eventData = {}) {
    try {
      await fetch(`${CONFIG.apiUrl}/api/v1/widgets/embed/${CONFIG.token}/event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ event_type: eventType, event_data: eventData }),
      });
    } catch (e) {
      // Silently fail
    }
  }

  // Initialize widget
  async function init() {
    if (!CONFIG.token) {
      console.error('[Wants Widget] No token provided. Add data-token attribute to the script tag.');
      return;
    }

    // Inject styles
    if (!document.getElementById('wants-widget-styles')) {
      injectStyles();
    }

    // Create container
    const container = createContainer();
    if (!container) return;

    // Show loading
    renderLoading();

    try {
      // Fetch data
      const data = await fetchWidgetData();
      widgetConfig = data.config;
      widgetData = data;

      // Render widget
      renderWidget();

      // Log view event
      logEvent('view');
    } catch (error) {
      console.error('[Wants Widget] Error:', error);
      renderError(error.message || 'Failed to load widget');
    }
  }

  // Public API
  window.WantsWidget = {
    init,
    refresh: async function() {
      if (!CONFIG.token) return;
      try {
        const data = await fetchWidgetData();
        widgetConfig = data.config;
        widgetData = data;
        renderWidget();
      } catch (error) {
        console.error('[Wants Widget] Refresh error:', error);
      }
    },
    getData: function() {
      return widgetData;
    },
    getConfig: function() {
      return widgetConfig;
    },
  };

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
