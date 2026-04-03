import React, { useState } from 'react';
import {
  Code,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  Key,
  Database,
  Shield,
  Zap,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface Endpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  auth: 'API Key' | 'None';
  requestBody?: string;
  responseExample: string;
}

const ApiDocsPage: React.FC = () => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [expandedEndpoint, setExpandedEndpoint] = useState<string | null>(null);

  const apiBaseUrl = import.meta.env.VITE_API_URL || 'https://api.wants.chat';

  const endpoints: Endpoint[] = [
    {
      method: 'GET',
      path: '/api/v1/tools',
      description: 'List all available tools',
      auth: 'API Key',
      responseExample: `{
  "success": true,
  "data": [
    {
      "slug": "budget-dashboard",
      "name": "Budget Dashboard",
      "category": "finance"
    },
    {
      "slug": "meal-planner",
      "name": "Meal Planner",
      "category": "health"
    }
  ]
}`,
    },
    {
      method: 'GET',
      path: '/api/v1/tools/:toolSlug/data',
      description: 'Get all data for a specific tool',
      auth: 'API Key',
      responseExample: `{
  "success": true,
  "data": [
    {
      "id": "uuid-1",
      "data": { "name": "My Budget", "amount": 5000 },
      "createdAt": "2026-01-04T10:00:00Z",
      "updatedAt": "2026-01-04T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1
  }
}`,
    },
    {
      method: 'GET',
      path: '/api/v1/tools/:toolSlug/data/:id',
      description: 'Get a specific data entry by ID',
      auth: 'API Key',
      responseExample: `{
  "success": true,
  "data": {
    "id": "uuid-1",
    "data": { "name": "My Budget", "amount": 5000 },
    "createdAt": "2026-01-04T10:00:00Z",
    "updatedAt": "2026-01-04T10:00:00Z"
  }
}`,
    },
    {
      method: 'POST',
      path: '/api/v1/tools/:toolSlug/data',
      description: 'Create a new data entry',
      auth: 'API Key',
      requestBody: `{
  "data": {
    "name": "My Budget",
    "amount": 5000,
    "category": "monthly"
  }
}`,
      responseExample: `{
  "success": true,
  "data": {
    "id": "uuid-new",
    "data": { "name": "My Budget", "amount": 5000, "category": "monthly" },
    "createdAt": "2026-01-04T10:00:00Z",
    "updatedAt": "2026-01-04T10:00:00Z"
  }
}`,
    },
    {
      method: 'PUT',
      path: '/api/v1/tools/:toolSlug/data/:id',
      description: 'Update an existing data entry',
      auth: 'API Key',
      requestBody: `{
  "data": {
    "name": "Updated Budget",
    "amount": 6000
  }
}`,
      responseExample: `{
  "success": true,
  "data": {
    "id": "uuid-1",
    "data": { "name": "Updated Budget", "amount": 6000 },
    "updatedAt": "2026-01-04T11:00:00Z"
  }
}`,
    },
    {
      method: 'DELETE',
      path: '/api/v1/tools/:toolSlug/data/:id',
      description: 'Delete a data entry',
      auth: 'API Key',
      responseExample: `{
  "success": true,
  "message": "Data deleted successfully"
}`,
    },
  ];

  const copyToClipboard = async (code: string, id: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const methodColors = {
    GET: 'bg-emerald-500/20 text-emerald-400',
    POST: 'bg-blue-500/20 text-blue-400',
    PUT: 'bg-amber-500/20 text-amber-400',
    DELETE: 'bg-red-500/20 text-red-400',
  };

  const curlExample = `curl -X GET "${apiBaseUrl}/api/v1/tools/budget-dashboard/data" \\
  -H "X-API-Key: sk_live_your_api_key_here" \\
  -H "Content-Type: application/json"`;

  const jsExample = `const response = await fetch('${apiBaseUrl}/api/v1/tools/budget-dashboard/data', {
  method: 'GET',
  headers: {
    'X-API-Key': 'sk_live_your_api_key_here',
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data);`;

  const pythonExample = `import requests

response = requests.get(
    '${apiBaseUrl}/api/v1/tools/budget-dashboard/data',
    headers={
        'X-API-Key': 'sk_live_your_api_key_here',
        'Content-Type': 'application/json'
    }
)

data = response.json()
print(data)`;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1a1a1a] border border-[#333] mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-sm text-gray-400 uppercase tracking-wider">Developer API</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            REST API <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Documentation</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Access your tool data programmatically. Build integrations, automate workflows, and extend Wants functionality.
          </p>
        </div>

        {/* Quick Start */}
        <div className="mb-8 p-6 rounded-2xl bg-[#111] border border-[#222]">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-white">
            <Zap className="w-5 h-5 text-yellow-500" />
            Quick Start
          </h2>

          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
              <div>
                <p className="font-medium text-white">Get your API Key</p>
                <p className="text-sm text-gray-400">
                  <Link to="/login" className="text-emerald-400 hover:text-emerald-300 transition-colors">Sign in</Link> and go to Settings → API Keys to create a new key
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
              <div>
                <p className="font-medium text-white">Add the API Key header</p>
                <p className="text-sm text-gray-400">
                  Include <code className="px-2 py-1 rounded bg-[#1a1a1a] text-emerald-400 text-xs font-mono">X-API-Key: your_key</code> in all requests
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
              <div>
                <p className="font-medium text-white">Make API calls</p>
                <p className="text-sm text-gray-400">
                  Access tool data using the endpoints below
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Authentication */}
        <div className="mb-8 p-6 rounded-2xl bg-[#111] border border-[#222]">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-white">
            <Shield className="w-5 h-5 text-blue-400" />
            Authentication
          </h2>

          <p className="mb-4 text-gray-300">
            All API requests require authentication via an API key. Include your key in the request header:
          </p>

          <div className="p-4 rounded-xl bg-[#0a0a0a] border border-[#222] font-mono text-sm relative group">
            <code className="text-emerald-400">
              X-API-Key: sk_live_your_api_key_here
            </code>
            <button
              onClick={() => copyToClipboard('X-API-Key: sk_live_your_api_key_here', 'auth')}
              className="absolute top-3 right-3 p-1.5 rounded-lg bg-[#1a1a1a] hover:bg-[#222] transition-colors opacity-0 group-hover:opacity-100"
            >
              {copiedCode === 'auth' ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* Base URL */}
        <div className="mb-8 p-6 rounded-2xl bg-[#111] border border-[#222]">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-white">
            <Database className="w-5 h-5 text-purple-400" />
            Base URL
          </h2>

          <div className="p-4 rounded-xl bg-[#0a0a0a] border border-[#222] font-mono text-sm">
            <code className="text-blue-400">{apiBaseUrl}</code>
          </div>
        </div>

        {/* Endpoints */}
        <div className="mb-8 p-6 rounded-2xl bg-[#111] border border-[#222]">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-white">
            <Code className="w-5 h-5 text-teal-400" />
            Endpoints
          </h2>

          <div className="space-y-3">
            {endpoints.map((endpoint, index) => {
              const endpointId = `${endpoint.method}-${endpoint.path}`;
              const isExpanded = expandedEndpoint === endpointId;

              return (
                <div
                  key={index}
                  className="rounded-xl border border-[#222] overflow-hidden bg-[#0a0a0a]"
                >
                  <button
                    onClick={() => setExpandedEndpoint(isExpanded ? null : endpointId)}
                    className="w-full p-4 flex items-center gap-3 text-left hover:bg-[#111] transition-colors"
                  >
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${methodColors[endpoint.method]}`}>
                      {endpoint.method}
                    </span>
                    <code className="text-sm font-mono flex-1 text-gray-300">
                      {endpoint.path}
                    </code>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-500" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="p-4 border-t border-[#222] bg-[#111]">
                      <p className="mb-4 text-gray-300">{endpoint.description}</p>

                      <div className="flex items-center gap-2 mb-4">
                        <Key className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm text-gray-400">
                          Requires: {endpoint.auth}
                        </span>
                      </div>

                      {endpoint.requestBody && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium mb-2 text-gray-300">Request Body:</h4>
                          <pre className="p-4 rounded-xl bg-[#0a0a0a] border border-[#222] text-xs overflow-x-auto text-gray-300 font-mono">
                            {endpoint.requestBody}
                          </pre>
                        </div>
                      )}

                      <div>
                        <h4 className="text-sm font-medium mb-2 text-gray-300">Response:</h4>
                        <pre className="p-4 rounded-xl bg-[#0a0a0a] border border-[#222] text-xs overflow-x-auto text-gray-300 font-mono">
                          {endpoint.responseExample}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Code Examples */}
        <div className="mb-8 p-6 rounded-2xl bg-[#111] border border-[#222]">
          <h2 className="text-xl font-semibold mb-6 text-white">
            Code Examples
          </h2>

          <div className="space-y-6">
            {/* cURL */}
            <div>
              <h3 className="text-sm font-medium mb-3 text-gray-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                cURL
              </h3>
              <div className="p-4 rounded-xl bg-[#0a0a0a] border border-[#222] font-mono text-sm relative group">
                <pre className="overflow-x-auto text-emerald-400">{curlExample}</pre>
                <button
                  onClick={() => copyToClipboard(curlExample, 'curl')}
                  className="absolute top-3 right-3 p-1.5 rounded-lg bg-[#1a1a1a] hover:bg-[#222] transition-colors opacity-0 group-hover:opacity-100"
                >
                  {copiedCode === 'curl' ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* JavaScript */}
            <div>
              <h3 className="text-sm font-medium mb-3 text-gray-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                JavaScript / TypeScript
              </h3>
              <div className="p-4 rounded-xl bg-[#0a0a0a] border border-[#222] font-mono text-sm relative group">
                <pre className="overflow-x-auto text-blue-400">{jsExample}</pre>
                <button
                  onClick={() => copyToClipboard(jsExample, 'js')}
                  className="absolute top-3 right-3 p-1.5 rounded-lg bg-[#1a1a1a] hover:bg-[#222] transition-colors opacity-0 group-hover:opacity-100"
                >
                  {copiedCode === 'js' ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Python */}
            <div>
              <h3 className="text-sm font-medium mb-3 text-gray-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                Python
              </h3>
              <div className="p-4 rounded-xl bg-[#0a0a0a] border border-[#222] font-mono text-sm relative group">
                <pre className="overflow-x-auto text-amber-400">{pythonExample}</pre>
                <button
                  onClick={() => copyToClipboard(pythonExample, 'python')}
                  className="absolute top-3 right-3 p-1.5 rounded-lg bg-[#1a1a1a] hover:bg-[#222] transition-colors opacity-0 group-hover:opacity-100"
                >
                  {copiedCode === 'python' ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Rate Limits */}
        <div className="p-6 rounded-2xl bg-[#111] border border-[#222]">
          <h2 className="text-xl font-semibold mb-4 text-white">
            Rate Limits
          </h2>

          <p className="mb-4 text-gray-300">
            API requests are rate limited based on your API key settings. Default limits:
          </p>

          <ul className="list-none space-y-2 text-gray-400">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              1000 requests per minute (default)
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Rate limits are per API key
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Exceeded limits return HTTP 429
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ApiDocsPage;
