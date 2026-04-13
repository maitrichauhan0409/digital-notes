Got it 👍 here is your **clean, professional PRD in English** (ready for submission / viva) 👇

---

# 📄 **Product Requirement Document (PRD)**

## **Project: Digital Notes with User Authentication**

---

## 🧾 1. Project Title

**Digital Notes Application with User Registration and Login System**

---

## 🎯 2. Objective

The objective of this feature is to:

* Provide a **secure user registration and login system**
* Store user data in **MongoDB (Compass)**
* Allow users to manage **personal notes linked to their account**
* Improve the application to a **real-world usable system**

---

## 👥 3. Target Users

* Students
* Personal productivity users
* Beginners learning full-stack development

---

## ⚙️ 4. Features Overview

### 🔐 4.1 User Registration (Sign Up)

Users can create an account by providing:

* Username (NEW)
* Email
* Password
* Contact Number (NEW)

👉 All data will be stored in MongoDB

---

### 🔑 4.2 User Login

* Users login using **Email + Password**
* Valid credentials → access dashboard
* Invalid credentials → error message

---

### 🚪 4.3 Logout

* Ends user session
* Redirects to login page

---

### 🧑 4.4 User-Specific Notes

* Each note is linked to a specific user
* Users can only see their own notes

Example:

```js
{
  title: "My Note",
  content: "Hello",
  userId: "123abc"
}
```

---

## 🗄️ 5. Database Design (MongoDB)

### 📌 Users Collection

```js
{
  _id: ObjectId,
  username: String,
  email: String,
  password: String,
  contact: String,
  createdAt: Date
}
```

---

### 📌 Notes Collection (Updated)

```js
{
  _id: ObjectId,
  title: String,
  content: String,
  userId: ObjectId,
  favourite: Boolean,
  archived: Boolean,
  trash: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔄 6. System Flow

### 🟢 Registration Flow

1. User fills sign-up form
2. Clicks "Sign Up"
3. Backend validates input
4. Data stored in MongoDB
5. Success message displayed

---

### 🔵 Login Flow

1. User enters email & password
2. Backend verifies credentials
3. If valid → login successful
4. Redirect to dashboard

---

### 🟡 Notes Flow

1. Logged-in user creates a note
2. Note is stored with `userId`
3. Only that user can access their notes

---

## 🧩 7. API Endpoints

### 🔐 Authentication APIs

| Method | Endpoint             | Description       |
| ------ | -------------------- | ----------------- |
| POST   | `/api/auth/register` | Register new user |
| POST   | `/api/auth/login`    | Login user        |

---

### 📝 Notes APIs (Updated)

| Method | Endpoint                | Description    |
| ------ | ----------------------- | -------------- |
| GET    | `/api/notes?userId=xyz` | Get user notes |
| POST   | `/api/notes`            | Create note    |
| PUT    | `/api/notes/:id`        | Update note    |

---

## 🎨 8. UI Requirements

### 🟣 Register Page

Fields:

* Username
* Email
* Password
* Contact Number

---

### 🔵 Login Page

Fields:

* Email
* Password

---

### 🟢 Dashboard

* Display username
* Show user’s notes

---

## 🔒 9. Validation Rules

* Email must be unique
* Password is required
* Contact number must be 10 digits
* Username is required

---

## 🚨 10. Error Handling

* User already exists
* Invalid login credentials
* Empty fields
* Server error

---

## 🛠️ 11. Technology Stack

* Frontend: React.js
* Backend: Node.js + Express
* Database: MongoDB (Compass)

---

## 🚀 12. Future Enhancements

* Password encryption (bcrypt)
* JWT authentication
* User profile page
* Forgot password feature

---

# 💥 Final Summary

This feature upgrades the Digital Notes application by adding:

* User registration with **username & contact number**
* Secure login system
* MongoDB-based storage
* User-specific note management

---

If you want next step, I can give you:

✅ Updated backend code
✅ Updated React Register form
✅ Fully working login/register system

Just say: **“give code”** 🚀
