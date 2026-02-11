# Revil ERP System Architecture

This diagram represents the complete "ERP" (Enterprise Resource Planning) ecosystem of the Revil e-commerce platform, detailing how different interfaces, the backend core, and external services interact to manage resources (Inventory, Orders, Finances).

## System Context Diagram

```mermaid
graph TD
    Customer["Customer (Web/Mobile)"]
    Admin["Admin / Store Owner"]
    
    subgraph "Revil Ecosystem"
        Frontend["Frontend Application"]
        AdminPanel["Admin Dashboard (ERP)"]
        Backend["Node.js / Express API"]
        DB[("MongoDB Database")]
    end
    
    subgraph "External Services"
        PaymentGW["Payment Gateways<br/>(Stripe / Razorpay)"]
        CloudStorage["Media Storage<br/>(Cloudinary)"]
    end

    Customer -->|Browses Products, Places Orders| Frontend
    Admin -->|Manages Inventory, Orders, Users| AdminPanel
    
    Frontend -->|API Requests| Backend
    AdminPanel -->|API Requests| Backend
    
    Backend -->|Read/Write Data| DB
    Backend -->|Process Payments| PaymentGW
    Backend -->|Upload Product Images| CloudStorage
```

## detailed ERP Process Flow

This section details the flow of data for key ERP modules: **Inventory**, **Order Processing**, and **Financials**.

```mermaid
sequenceDiagram
    participant Admin
    participant User
    participant System as Revil Backend
    participant DB as Database
    participant Ext as Stripe/Razorpay
    
    %% Inventory Management Flow
    rect rgb(240, 248, 255)
    note right of Admin: Inventory Management
    Admin->>System: Add/Update Product (Stock, Price)
    System->>DB: Save Product Data
    System-->>Admin: Confirmation
    end

    %% Order & Inventory Deduction Flow
    rect rgb(255, 240, 245)
    note right of User: Order & Inventory Flow
    User->>System: Place Order (Items, Qty)
    System->>DB: Check Stock Availability
    alt Stock Available
        System->>Ext: Initiate Payment
        Ext-->>System: Payment Success
        System->>DB: Create Order Record
        System->>DB: Decrement Stock (Reserve Inventory)
        System-->>User: Order Confirmation
    else Stock Unavailable
        System-->>User: Error: Out of Stock
    end
    end

    %% Order Fulfillment Flow
    rect rgb(240, 255, 240)
    note right of Admin: Fulfillment Process
    Admin->>System: View Pending Orders
    System->>DB: Fetch Orders
    System-->>Admin: List of Orders
    Admin->>System: Update Status (Packing -> Shipped)
    System->>DB: Update Order Status
    end
```

## Data Modules (ERP Core)

```mermaid
classDiagram
    class InventoryModule {
        +Product_Management
        +Stock_Tracking
        +Low_Stock_Alerts
        +Category_Organization
    }

    class OrderModule {
        +Order_Processing
        +Status_Workflow
        +Tracking_Info_Management
        +Cancellation_Logic
    }

    class FinanceModule {
        +Revenue_Tracking
        +Payment_Reconciliation
        +Discount_Coupon_Management
    }

    class UserModule {
        +Customer_Profiles
        +Authentication
        +Address_Book
        +Admin_Access_Control
    }

    InventoryModule -- OrderModule : Supply Check
    OrderModule -- FinanceModule : Transaction Record
    UserModule -- OrderModule : Placing Entity
```

## Detailed Product Management Flow

This visualizes the lifecycle of a product from creation to stock update.

```mermaid
sequenceDiagram
    participant Admin
    participant Frontend
    participant Backend
    participant Cloudinary
    participant DB

    %% Product Creation
    rect rgb(230, 230, 250)
    note right of Admin: Create New Product
    Admin->>Frontend: Enter Details & Select Images
    Frontend->>Backend: POST /api/product/add (Multipart Data)
    
    par Image Upload
        Backend->>Cloudinary: Upload Image 1
        Backend->>Cloudinary: Upload Image 2
        Cloudinary-->>Backend: Return URL 1
        Cloudinary-->>Backend: Return URL 2
    end
    
    Backend->>DB: Save Product Document (with Image URLs)
    DB-->>Backend: Success
    Backend-->>Frontend: Product Added Successfully
    Frontend-->>Admin: Show Success Message
    end

    %% Stock Update
    rect rgb(255, 250, 205)
    note right of Admin: Update Stock/Details
    Admin->>Frontend: Edit Product (Update Stock Map)
    Frontend->>Backend: POST /api/product/update
    Backend->>DB: Find Product by ID
    Backend->>DB: Update Fields (Stock, Price, etc.)
    DB-->>Backend: Updated Document
    Backend-->>Frontend: Product Updated
    Frontend-->>Admin: Refresh Product List
    end
```
