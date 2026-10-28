# Local API demo

Start the API/database using the root README, then open **http://localhost:3000/api/docs**. This walkthrough uses data you create locally; no pre-seeded accounts are required.

## 1. Create a restaurant owner

Run `POST /api/auth/register`:

```json
{
  "email": "owner@example.com",
  "password": "DemoPassword123!",
  "name": "Demo Owner",
  "role": "restaurant_owner"
}
```

Copy `access_token` into Swagger's **Authorize** dialog. Public registration accepts `customer` and `restaurant_owner`; it does not create administrators.

## 2. Create a restaurant and menu item

Use `POST /api/restaurants`:

```json
{
  "name": "Demo Kitchen",
  "address": "123 Demo Street",
  "phone": "0900000000",
  "category": "Vietnamese"
}
```

Copy its `id` into `POST /api/restaurants/{restaurantId}/menu`:

```json
{
  "name": "Noodle bowl",
  "price": 55000,
  "category": "Lunch"
}
```

Copy the menu item `id`. Public restaurant/menu endpoints also let the companion frontend display this data.

## 3. Place an order as a customer

Register a second account with `role: "customer"` and a different email. Replace Swagger's bearer token with this customer's token.

Use `POST /api/orders`, substituting real UUIDs:

```json
{
  "restaurantId": "RESTAURANT_UUID",
  "deliveryAddress": "456 Demo Street",
  "items": [{ "menuItemId": "MENU_ITEM_UUID", "quantity": 2 }]
}
```

Expected subtotal: **110,000 VND**. With the default delivery fee, total: **125,000 VND**. The new order starts as `pending`.

## 4. Check authorization and lifecycle rules

- `GET /api/orders` lists this customer's orders.
- An unrelated customer receives `403` for `GET /api/orders/{id}`.
- The restaurant owner can update the order through `PATCH /api/orders/{id}/status` with `{"status":"confirmed"}`.
- A customer can cancel their own pending order through `POST /api/orders/{id}/cancel`; cancellation after confirmation returns `400`.

These paths are exercised by the PostgreSQL-backed integration suite. Payment-method data and order statuses do not trigger an external payment or delivery service.
