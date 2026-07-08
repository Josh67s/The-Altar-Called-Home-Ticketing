# Firestore Database Design

Amazing Crew TV Production

Project:
Event Ticketing & Event Management Platform

First Event:
THE ALTAR CALLED HOME

## events

Purpose:
Stores information about each event.

Fields:

- eventId
- title
- slug
- description
- venue
- eventDate
- admissionTime
- startTime
- posterUrl
- trailerUrl
- status (draft, published, completed)
- createdAt
- updatedAt

## orders

Purpose:
Stores each completed purchase.

Fields:

- orderId
- eventId
- buyerName
- buyerEmail
- buyerPhone
- totalAmount
- paymentReference
- paymentStatus
- paymentMethod
- ticketCount
- createdAt

## tickets

Purpose:
Stores every individual ticket.

Fields:

- ticketId
- orderId
- eventId
- attendeeName
- attendeeEmail
- attendeePhone
- ticketType
- seatingZone
- qrCode
- checkedIn
- checkedInAt
- createdAt

## users

Purpose:
Stores administrator accounts.

Fields:

- userId
- fullName
- email
- role
- active
- lastLogin
- createdAt

## settings

Purpose:
Stores platform settings.

Fields:

- organizationName
- supportEmail
- supportPhone
- currency
- defaultLanguage
- paystackPublicKey
- eventTheme

## audit_logs

Purpose:
Tracks important administrator activities.

Fields:

- logId
- userId
- action
- target
- timestamp
- ipAddress

events
   │
   ├── orders
   │       │
   │       └── tickets
   │
   └── settings

users
   │
   └── audit_logs

   ## Security Rules

The platform will use Firestore Security Rules to ensure:

- Visitors cannot access admin collections.
- Only authenticated administrators can access management data.
- Check-in Officers can update only ticket check-in status.
- Super Admin has full access.

