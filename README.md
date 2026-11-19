# Internship REST API

A beginner-friendly Node.js + Express REST API with SQLite persistence, validation, pagination, and CRUD endpoints.

## Requirements
- Node.js 18+ (recommended)
- npm

## Run locally
```bash
npm install
npm run dev
```
The API starts at `http://localhost:3000`. SQLite database file `internships.db` is created automatically.

## Data model
Each internship record contains:
- `id` (auto-generated integer)
- `company` (required string)
- `role` (required string)
- `location` (required string)
- `type` (`Remote`, `Hybrid`, or `On-site`)
- `stipend` (string; defaults to `Not specified`)
- `duration` (required string)
- `apply_url` (valid URL)
- `description` (10–2000 characters)
- `created_at` (auto-generated timestamp)

## Endpoints
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/internships?page=1&limit=10` | List with pagination |
| GET | `/api/internships/:id` | Get one record |
| POST | `/api/internships` | Create |
| PUT | `/api/internships/:id` | Update |
| DELETE | `/api/internships/:id` | Delete |

List supports `search`, for example `/api/internships?search=python`.

## Example POST body
```json
{
  "company": "Acme Labs",
  "role": "Backend Intern",
  "location": "Chennai",
  "type": "Hybrid",
  "stipend": "₹10,000/month",
  "duration": "3 months",
  "apply_url": "https://example.com/apply",
  "description": "Build and test REST APIs with the engineering team."
}
```

## Response format
Successful responses use `success: true` and include `data` (or `pagination` for list responses).
Errors use `success: false` and an `error` message. Validation errors also include `details`.

### HTTP Status Codes

| Status Code | Description |
|---|---|
| 200 OK | Request completed successfully |
| 201 Created | Internship record created successfully |
| 400 Bad Request | Invalid input or validation error |
| 404 Not Found | Internship record not found |
| 500 Internal Server Error | Unexpected server error |

## Quick tests (PowerShell)
```powershell
# Health check
Invoke-RestMethod http://localhost:3000/

# List
Invoke-RestMethod "http://localhost:3000/api/internships?page=1&limit=10"

# Create
$body = @{
  company = "Acme Labs"
  role = "Backend Intern"
  location = "Chennai"
  type = "Hybrid"
  stipend = "₹10000/month"
  duration = "3 months"
  apply_url = "https://example.com/apply"
  description = "Build and test REST APIs with the engineering team."
} | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/internships -ContentType "application/json" -Body $body
```

## Testing

The API was tested using Postman and PowerShell.

The following operations were verified:

- Creating a new internship record.
- Retrieving all internship records.
- Retrieving an internship by ID.
- Updating an existing internship record.
- Deleting an internship record.
- Validating incorrect or missing input data.
- Handling invalid internship IDs.
- Testing pagination using page and limit parameters.
- Verifying data persistence after restarting the server.

All the above operations returned the expected responses.
