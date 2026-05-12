# Ticket Management System

A Laravel + React ticket management system built as a Full Stack home assignment.

The system allows creating, updating, filtering, sorting, assigning, unassigning, and managing tickets.  
It also includes business rules and a scheduled command for stale high-priority tickets.

## Tech Stack

- Laravel
- SQL Server
- Eloquent ORM
- Form Requests
- API Resources
- Service Layer
- Artisan Command + Scheduler
- React
- Vite
- Axios
- Tailwind CSS
- Plain JavaScript helper functions

## Features

- Create tickets
- Update tickets
- Change ticket status
- Assign tickets to users
- Unassign tickets from users
- Assign and unassign tickets directly from the React dashboard
- List tickets with pagination
- Filter by status, priority, and assigned user
- Sort by created date, status, and priority
- Custom business sorting for priority and status
- Dashboard statistics
- React frontend with create-ticket modal
- Prevent closing unassigned tickets
- Automatically reopen stale high-priority tickets

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/ShoshiBloy/ticket-management-system.git
cd ticket-management-system
```

### 2. Install dependencies

```bash
composer install
npm install
```

### 3. Create environment file

Windows:

```bash
copy .env.example .env
```

Linux/Mac:

```bash
cp .env.example .env
```

The repository includes `.env.example`.  
The real `.env` file is intentionally ignored and should be created locally.

### 4. Generate application key

```bash
php artisan key:generate
```

### 5. Create SQL Server database

```sql
CREATE DATABASE ticket_management;
```

### 6. Configure `.env`

```env
APP_NAME="Ticket Management System"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://127.0.0.1:8000
APP_TIMEZONE=Asia/Jerusalem

DB_CONNECTION=sqlsrv
DB_HOST=localhost
DB_PORT=
DB_DATABASE=ticket_management
DB_USERNAME=sa
DB_PASSWORD=your_password
DB_ENCRYPT=no
DB_TRUST_SERVER_CERTIFICATE=true
```

### 7. Run migrations and seeders

```bash
php artisan migrate --seed
```

Or reset the database:

```bash
php artisan migrate:fresh --seed
```

### 8. Run the project

Backend:

```bash
php artisan serve --port=8001
```

Frontend:

```bash
npm run dev
```

Open:

```text
http://127.0.0.1:8001/tickets
```

### 9. Build frontend assets

```bash
npm run build
```

## API Endpoints

| Method    | Endpoint                       | Description                                        |
| --------- | ------------------------------ | -------------------------------------------------- |
| GET       | `/api/users`                   | List users for assignment and filtering            |
| GET       | `/api/tickets`                 | List tickets with filters, sorting, and pagination |
| POST      | `/api/tickets`                 | Create a ticket                                    |
| GET       | `/api/tickets/{ticket}`        | Get a single ticket                                |
| PATCH/PUT | `/api/tickets/{ticket}`        | Update ticket details                              |
| DELETE    | `/api/tickets/{ticket}`        | Delete a ticket                                    |
| PATCH     | `/api/tickets/{ticket}/status` | Change ticket status                               |
| PATCH     | `/api/tickets/{ticket}/assign` | Assign or unassign a ticket                        |
| GET       | `/api/tickets/open`            | Get open tickets                                   |
| GET       | `/api/tickets/stats`           | Get dashboard statistics                           |

Example filtering and sorting:

```http
GET /api/tickets?status=open&priority=high&assigned_user_id=1&sort_by=priority&sort_direction=desc&per_page=10
```

Example assignment:

```http
PATCH /api/tickets/1/assign
```

```json
{
    "assigned_user_id": 1
}
```

Example unassignment:

```http
PATCH /api/tickets/1/assign
```

```json
{
    "assigned_user_id": null
}
```

## Business Rules

### Closing tickets

A ticket cannot be closed unless it is assigned to a user.

This rule is handled in the service layer, so the controller stays clean and the business logic remains reusable.

The React dashboard also prevents closing unassigned tickets and displays a clear error message.

### Assigning and unassigning tickets

Tickets can be assigned to users from both the API and the React dashboard.

The dashboard also allows returning a ticket to an unassigned state.

### Stale high-priority tickets

High-priority tickets that remain in `in_progress` status for more than 48 hours are automatically returned to `open`.

Manual command:

```bash
php artisan tickets:reopen-stale-high-priority
```

Scheduled hourly in Laravel Scheduler:

```php
Schedule::command('tickets:reopen-stale-high-priority')->hourly();
```

For local development:

```bash
php artisan schedule:work
```

On a server, Laravel Scheduler should be executed by a cron job every minute.

## Code Improvement

Original code:

```php
public function getOpenTickets()
{
    $tickets = DB::select("SELECT * FROM tickets WHERE status = 'open'");
    return $tickets;
}
```

### Problems

- Uses raw SQL instead of Eloquent.
- Uses `SELECT *`.
- Hardcodes the status value.
- Does not use the `Ticket` model.
- Does not use pagination.
- Does not use API Resources.
- Does not eager load related data.
- Harder to maintain and extend.

### Improved version

```php
// App\Models\Ticket.php

public function scopeOpen(Builder $query):Builder
{
    return $query->where('status',TicketStatus::OPEN->value);
}
```

```php
// App\Http\Controllers\Api\TicketController.php

public function openTickets()
{
    $tickets=Ticket::query()
        ->with('assignedUser')
        ->open()
        ->latest()
        ->paginate(10);

    return TicketResource::collection($tickets);
}
```

### Why it is better

- Uses Eloquent and the `Ticket` model.
- Uses a reusable `open()` scope.
- Uses `TicketStatus::OPEN->value` instead of a hardcoded string.
- Uses eager loading for the assigned user.
- Uses pagination.
- Returns a consistent API Resource response.

## Frontend

The frontend was implemented with React as a bonus requirement.

It includes:

- Ticket table
- Create ticket modal
- Status update select
- Assignment and unassignment from the table
- Filters by status, priority, and assigned user
- Sorting
- Pagination
- Per-page selection
- Page selection
- Dashboard statistics
- Success and error messages
- Client-side prevention of closing unassigned tickets

Reusable plain JavaScript helper functions were extracted to:

```text
resources/js/ticketHelpers.js
```

These helpers are used for label formatting and frontend ticket validation logic.

## Project Structure

```text
app/
 ├── Console/Commands
 ├── Enums
 ├── Http/
 │   ├── Controllers/Api
 │   ├── Requests
 │   └── Resources
 ├── Models
 └── Services

resources/
 ├── js
 │   ├── app.jsx
 │   └── ticketHelpers.js
 └── views
```

## Useful Commands

```bash
php artisan optimize:clear
php artisan route:list
php artisan migrate:fresh --seed
php artisan tickets:reopen-stale-high-priority
php artisan schedule:list
php artisan test
npm run build
```

## Tests

Feature tests were added for the main ticket workflows:

- Creating a ticket
- Preventing closing an unassigned ticket
- Closing an assigned ticket
- Reopening stale high-priority tickets using the Artisan command

Run tests:

```bash
php artisan test
```

Run only the ticket feature tests:

```bash
php artisan test tests/Feature/TicketApiTest.php
```

## Assumptions

- New tickets are created as `open` by default.
- `handled_at` is set when a ticket moves to `in_progress`.
- High-priority tickets stuck in progress for more than 48 hours should return to `open`.
- Users are loaded from `/api/users` for assignment and filtering.
- Tickets can be assigned and unassigned.
- Status and priority sorting use custom business order instead of simple alphabetical sorting.
- React was used for the frontend bonus.

## Author

Created as part of a Laravel Full Stack home assignment.
