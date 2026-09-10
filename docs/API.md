# API Reference

## Base URL

```
https://your-supabase-url/functions/v1/ai-gateway
```

## Authentication

All requests require a Bearer token in the `Authorization` header:

```
Authorization: Bearer YOUR_ACCESS_CODE
```

## Endpoints

### Chat Completions

```
POST /v1/chat/completions
```

Creates a chat completion. Fully compatible with the OpenAI API format.

#### Request Body

| Parameter | Type | Required | Description |
|----------|------|----------|-------------|
| `model` | string | Yes | The model to use (e.g. `DeepSeek-V4-Flash`) |
| `messages` | array | Yes | Array of message objects |
| `stream` | boolean | No | Enable streaming (default: false) |
| `max_tokens` | integer | No | Maximum tokens to generate |
| `temperature` | number | No | Sampling temperature (0-2) |

#### Example (Non-streaming)

```bash
curl -X POST https://your-supabase-url/functions/v1/ai-gateway/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_CODE" \
  -d '{
    "model": "DeepSeek-V4-Flash",
    "messages": [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "Hello!"}
    ],
    "max_tokens": 100
  }'
```

#### Example (Streaming)

```bash
curl -X POST https://your-supabase-url/functions/v1/ai-gateway/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_CODE" \
  -d '{
    "model": "DeepSeek-V4-Flash",
    "messages": [{"role": "user", "content": "Hello!"}],
    "stream": true
  }'
```

#### Response (Non-streaming)

```json
{
  "id": "chatcmpl-xxx",
  "object": "chat.completion",
  "created": 1699999999,
  "model": "DeepSeek-V4-Flash",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Hello! How can I help you?"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 8,
    "total_tokens": 18
  }
}
```

#### Response (Streaming)

Each chunk is a Server-Sent Event:

```
data: {"id":"chatcmpl-xxx","object":"chat.completion.chunk","choices":[{"delta":{"content":"Hello"}}]}

data: {"id":"chatcmpl-xxx","object":"chat.completion.chunk","choices":[{"delta":{"content":"!"}}]}

data: [DONE]
```

### List Models

```
GET /v1/models
```

Returns a list of available models across all active providers.

### Providers

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/providers` | List all providers |
| POST | `/api/providers` | Create a new provider |
| PUT | `/api/providers/:id` | Update a provider |
| DELETE | `/api/providers/:id` | Delete a provider |

### Sessions

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/sessions` | List all browser sessions |
| POST | `/api/sessions` | Create a new session |
| PUT | `/api/sessions/:id` | Update a session |
| DELETE | `/api/sessions/:id` | Delete a session |

### Logs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/logs` | List request logs |

### Settings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/settings` | Get gateway settings |
| PUT | `/api/settings` | Update gateway settings |

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List users |

### Risk Scores

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/risk-scores` | List provider risk scores |

### Cost Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cost-summary` | Get cost analysis summary |

## Error Responses

All errors follow this format:

```json
{
  "error": {
    "message": "Description of the error",
    "type": "invalid_request_error",
    "code": "invalid_api_key"
  }
}
```

| Status Code | Description |
|-------------|-------------|
| 400 | Bad request - invalid parameters |
| 401 | Unauthorized - missing or invalid access code |
| 404 | Not found - model or endpoint not found |
| 429 | Rate limit exceeded |
| 500 | Internal server error |
| 502 | Bad gateway - all providers failed |

## SDK Examples

### Python

```python
import openai

client = openai.OpenAI(
    base_url="https://your-supabase-url/functions/v1/ai-gateway/v1",
    api_key="YOUR_ACCESS_CODE",
)

response = client.chat.completions.create(
    model="DeepSeek-V4-Flash",
    messages=[{"role": "user", "content": "Hello!"}],
    stream=True,
)

for chunk in response:
    print(chunk.choices[0].delta.content or "", end="")
```

### JavaScript

```javascript
import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://your-supabase-url/functions/v1/ai-gateway/v1",
  apiKey: "YOUR_ACCESS_CODE",
});

const response = await client.chat.completions.create({
  model: "DeepSeek-V4-Flash",
  messages: [{ role: "user", content: "Hello!" }],
  stream: true,
});

for await (const chunk of response) {
  process.stdout.write(chunk.choices[0].delta.content || "");
}
```

### PHP

```php
<?php
require 'vendor/autoload.php';

$client = new \GuzzleHttp\Client();
$response = $client->post('https://your-supabase-url/functions/v1/ai-gateway/v1/chat/completions', [
    'headers' => [
        'Authorization' => 'Bearer YOUR_ACCESS_CODE',
        'Content-Type' => 'application/json',
    ],
    'json' => [
        'model' => 'DeepSeek-V4-Flash',
        'messages' => [['role' => 'user', 'content' => 'Hello!']],
        'max_tokens' => 100,
    ],
]);

$data = json_decode($response->getBody(), true);
echo $data['choices'][0]['message']['content'];
```
