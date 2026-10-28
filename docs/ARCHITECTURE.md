# Architecture

The React frontend and NestJS API live in separate repositories. REST endpoints under `/api` use TypeORM repositories to access PostgreSQL.

```mermaid
flowchart LR
    Browser[React frontend] -->|HTTP + bearer token| API[NestJS API]
    API --> Auth[JWT authentication]
    Auth --> Roles[Role guards]
    Roles --> Controllers[Feature controllers]
    Controllers --> Services[Application services]
    Services --> ORM[TypeORM repositories]
    ORM --> DB[(PostgreSQL)]
    Swagger[Swagger UI] --> API
```

Validation rejects extra fields and invalid DTOs. A shared exception filter formats errors, and serialization excludes password fields from entity responses. JWT authentication precedes role authorization; order-detail access additionally checks customer or restaurant ownership.

## Data model

This diagram follows the foreign-key columns in the entity classes.

```mermaid
erDiagram
    USERS ||--o{ RESTAURANTS : owns
    USERS ||--o{ ORDERS : places
    USERS ||--o{ REVIEWS : writes
    RESTAURANTS ||--o{ MENU_ITEMS : offers
    RESTAURANTS ||--o{ ORDERS : receives
    RESTAURANTS ||--o{ REVIEWS : receives
    ORDERS ||--o{ ORDER_ITEMS : contains
    MENU_ITEMS ||--o{ ORDER_ITEMS : references
    ORDERS |o--o{ REVIEWS : optionally_links
    USERS {
        uuid id PK
        varchar email UK
        varchar password
        enum role
    }
    RESTAURANTS {
        uuid id PK
        uuid owner_id FK
        varchar name
        decimal rating
        boolean is_active
    }
    MENU_ITEMS {
        uuid id PK
        uuid restaurant_id FK
        varchar name
        decimal price
        boolean is_available
    }
    ORDERS {
        uuid id PK
        uuid customer_id FK
        uuid restaurant_id FK
        enum status
        decimal subtotal
        decimal delivery_fee
        decimal total
    }
    ORDER_ITEMS {
        uuid id PK
        uuid order_id FK
        uuid menu_item_id FK
        varchar name
        decimal price
        int quantity
    }
    REVIEWS {
        uuid id PK
        uuid user_id FK
        uuid restaurant_id FK
        uuid order_id FK
        int rating
    }
```

## Placing an order

1. The customer submits a restaurant, delivery address, and item IDs/quantities.
2. The service checks that each item exists, is available, and belongs to that restaurant.
3. It calculates the subtotal from stored prices and adds the delivery fee (15,000 VND when omitted).
4. It saves the order and item name/price snapshots, then returns the order with its relations.

Order creation currently performs separate saves for the order and its items. A transaction remains follow-up work; the diagram does not imply atomic persistence. Status updates accept declared enum values rather than enforcing a full transition graph.
