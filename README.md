# Messenger

A modern, scalable real-time chat application built with **NestJS**, **Next.js 14**, and **PostgreSQL**. Designed for performance, security, and scalability, featuring end-to-end encryption, multi-device support, and a responsive UI inspired by Telegram.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![NestJS](https://img.shields.io/badge/NestJS-10.x-red)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![Docker](https://img.shields.io/badge/Docker-Ready-blue)

## 🚀 Key Features

*   **Real-time Messaging**: Instant message delivery using Socket.io with optimistic UI updates.
*   **Secure Authentication**: robust auth system with JWT, OAuth 2.0 (Google & GitHub), and 2FA (TOTP).
*   **End-to-End Encryption**: Signal-like encryption protocol using `libsodium` for secure communication.
*   **Media Sharing**: Support for images, videos, and files with MinIO (S3-compatible) storage.
*   **Full-Text Search**: Lightning-fast message and user search powered by MeiliSearch.
*   **User Presence**: Real-time online/offline status tracking with Redis.
*   **Scalable Infrastructure**: Containerized with Docker and ready for Kubernetes deployment.

## 🛠 Tech Stack

### Backend
*   **Framework**: NestJS (Node.js)
*   **Database**: PostgreSQL with Prisma ORM
*   **Caching**: Redis
*   **Search Engine**: MeiliSearch
*   **Object Storage**: MinIO
*   **Testing**: Jest

### Frontend
*   **Framework**: Next.js 14 (App Router)
*   **Styling**: Tailwind CSS
*   **State Management**: Zustand
*   **Real-time Client**: Socket.io Client
*   **Icons**: Lucide React

### DevOps
*   **Containerization**: Docker & Docker Compose
*   **Orchestration**: Kubernetes (K8s) manifests included
*   **CI/CD**: GitHub Actions workflows
*   **Reverse Proxy**: Nginx

## 📦 Installation

### Prerequisites
*   Docker & Docker Compose
*   Node.js 18+ (for local development without Docker)

### Quick Start (Docker)

1.  **Clone the repository**
    ```bash
    git clone https://github.com/syeedalireza/messenger.git
    cd messenger
    ```

2.  **Configure Environment**
    Copy the example environment file:
    ```bash
    cp .env.example .env
    ```
    *Note: The default settings in `.env.example` work out-of-the-box for the Docker setup.*

3.  **Start the Application**
    ```bash
    docker-compose up -d
    ```

    The application will be available at:
    *   **Frontend**: http://localhost
    *   **Backend API**: http://localhost/api
    *   **API Documentation**: http://localhost/api/docs

## 🔧 Architecture

The project follows a modular monolithic architecture, ensuring separation of concerns while maintaining simplicity.

```mermaid
graph TD
    Client[Frontend (Next.js)] <-->|HTTP/WebSocket| Nginx[Nginx Proxy]
    Nginx <-->|API Requests| API[Backend (NestJS)]
    API <-->|Data| DB[(PostgreSQL)]
    API <-->|Cache/PubSub| Redis[(Redis)]
    API <-->|Search| Search[(MeiliSearch)]
    API <-->|Files| Storage[(MinIO)]
```

## 🛡 Security

*   **Zero Trust Networking**: Internal services (DB, Redis) are not exposed publicly.
*   **Rate Limiting**: Protected against abuse with configurable rate limits.
*   **Security Headers**: Implemented using Helmet.
*   **Input Validation**: Strict DTO validation using `class-validator`.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
