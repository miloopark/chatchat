<!-- PROJECT LOGO -->
<h1 align="center">
  <img src="frontend/src/assets/logo.svg" alt="Chat Squared Logo" width="200">
  <br>
  Chat Squared
</h1>

<p align="center">
  <b>An immersive, AI-driven visual learning platform to aid learners who struggle with traditional educational materials.</b>
</p>

<p align="center">
  <a href="#key-features">Key Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#deployment">Deployment</a> •
  <a href="#api-integration">API Integration</a> •
  <a href="#disclaimer">Disclaimer</a> •
  <a href="#license">License</a> •
  <a href="#team">Team</a>
</p>

<div align="center">
  
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Firebase](https://img.shields.io/badge/firebase-%23039BE5.svg?style=for-the-badge&logo=firebase)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![Three.js](https://img.shields.io/badge/threejs-black?style=for-the-badge&logo=three.js&logoColor=white)

</div>

---

## Disclaimer

> **Note on Deployment**: This project is not fully deployed to production due to the cost constraints of API usage. The application relies on OpenAI's API and ElevenLabs' speech API, both of which incur usage costs that would require funding for a public deployment. The repository is set up for local development and testing, or for deployment with your own API keys.

## Key Features

- **Voice-Driven Interaction**: Natural conversations with the AI using the browser's Speech Recognition API with robust fallback mechanisms
- **Personalized Learning**: Customization through questionnaires to tailor the learning experience to individual needs
- **Rich 3D Visualizations**: Interactive 3D models and animations powered by Three.js to enhance learning
- **Smooth UI/UX**: Modern interface with animations using Framer Motion and styled-components
- **Real-time Responses**: Fast, relevant AI-generated content using OpenAI's models
- **Text-to-Speech**: High-quality voice output using ElevenLabs API with browser fallback options
- **Cross-browser Compatibility**: Designed to work across modern browsers with graceful degradation

## Tech Stack

### Frontend

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **State Management**: React Context API with custom reducers
- **UI Components**: Material UI, styled-components
- **Animations**: Framer Motion
- **3D Rendering**: Three.js (@react-three/fiber, @react-three/drei)
- **Speech Integration**: Web Speech API, MediaRecorder API

### Backend

- **Serverless Architecture**: Firebase Cloud Functions
- **Runtime**: Node.js with Express
- **Database**: Firebase Firestore
- **Authentication**: Firebase Authentication
- **Storage**: Firebase Storage
- **API Integration**: OpenAI API, ElevenLabs API

### DevOps

- **Version Control**: Git
- **CI/CD**: GitHub Actions
- **Hosting**: Firebase Hosting (configured but not deployed due to API costs)

## Architecture

Chat Squared follows a modern serverless architecture:

1. **Frontend Client**: React application served via Firebase Hosting
2. **API Layer**: Express.js running on Firebase Cloud Functions
3. **Database**: Firestore document collections for users, conversations, and questionnaire data
4. **External Services**:
   - OpenAI API for natural language processing
   - ElevenLabs API for high-quality speech synthesis
5. **Authentication**: Firebase Authentication for user management

Key data flows:

- User speech input → Speech Recognition → OpenAI → UI Response
- AI text responses → ElevenLabs → Audio playback
- User preferences → Firestore → Personalized experiences

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn
- Firebase CLI (`npm install -g firebase-tools`)
- OpenAI API key
- ElevenLabs API key (optional, for enhanced speech)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/miloopark/chatchat.git
   cd chatchat
   ```

2. **Set up environment variables**

   - Copy the template files and fill in your API keys

   ```bash
   cp frontend/.env.template frontend/.env
   cp backend/.env.template backend/.ENV
   ```

   Required variables:

   - `VITE_FIREBASE_*`: Firebase configuration
   - `VITE_OPENAI_API_KEY`: Your OpenAI API key
   - `VITE_ELEVENLABS_API_KEY`: Your ElevenLabs API key (optional)

3. **Install dependencies**

   ```bash
   # Install root dependencies
   npm install

   # Install frontend dependencies
   cd frontend
   npm install

   # Install backend dependencies
   cd ../backend
   npm install
   ```

4. **Set up Firebase**
   ```bash
   firebase login
   firebase use default
   ```

### Local Development

You have two options for running the backend:

1. **Option 1: Start the simple backend server (recommended for quick setup)**

   ```bash
   cd backend
   npm run start:simple
   # or directly:
   node direct-start.js
   ```

   This starts a simpler version of the backend with all functionality in a single file.

2. **Option 2: Start the TypeScript-based development server**

   ```bash
   cd backend
   npm run dev
   ```

   This compiles and runs the TypeScript Express server on http://localhost:3000

3. **Start the frontend development server**

   ```bash
   cd frontend
   npm run dev
   ```

   This will start the Vite dev server, typically on http://localhost:5173

4. **Use Firebase emulators (optional)**
   ```bash
   firebase emulators:start
   ```
   This will start emulators for Authentication, Firestore, Functions, and Storage

## Deployment

To deploy the application with your own API keys:

1. **Build the frontend**

   ```bash
   cd frontend
   npm run build
   ```

2. **Build the backend**

   ```bash
   cd backend
   npm run build
   ```

3. **Deploy to Firebase**
   ```bash
   firebase deploy
   ```

This will deploy:

- Frontend to Firebase Hosting
- Backend to Firebase Functions
- Firestore rules and indexes
- Storage rules

## API Integration

### OpenAI API

The application uses OpenAI's models for:

- Generating conversational responses
- Creating personalized learning content
- Processing user questions

Configure in `backend/.ENV` with your OpenAI API key.

### ElevenLabs API

Used for high-quality text-to-speech:

- Converting AI text responses to natural speech
- Multiple voice options and languages
- Fallback to browser's native speech synthesis when unavailable

Configure in `frontend/.env` and `backend/.ENV` with your ElevenLabs API key.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Team

- **Min Sung Park** - Project Lead - [GitHub](https://github.com/miloopark) | [Email](mailto:minpark@bu.edu)
- **Thanh Huynh** - Backend Developer - [GitHub](https://github.com/thanhthuynh) | [Email](mailto:thanh910@bu.edu)
- **Jiehoon Lee** - Full-Stack Developer - [GitHub](https://github.com/jiehoonn) | [Email](mailto:jiehoonn@bu.edu)
- **Emmeline Chung** - UX Designer - [Email](mailto:emmchung@bu.edu)

---

<p align="center">
  Made with ❤️ at Boston University
</p>

<!-- PROJECT SHIELDS -->
<!--
*** I'm using markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li> <a href="#git-commit-convention">Git Commit Convention</a> </li>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

<!-- GIT CONVENTION -->

## Git Commit Convention

1. Make a branch before you start working on your code. <br>
   `git checkout -b <new branch name>` <br>
   ⚠️ We are going to be creating branch names with the Jira Issue ID followed by the type of branch prefix (see bottom of this README) <br>
   How we should name branches:
   > ex) `feature/AN-26@create-button-component`
2. After you are done with implementing each issue, create a PR to `dev`.

   1. Commit and push the branch you created.
   2. Create a Pull Request in this repository.
   3. Name you PR correctly according to our Git convention.
   4. Fill out the PR description template.
   5. Label your PR.

   ⚠️ The PR title should be something similar to your branch name. The Jira Issue ID and a short summary of what you implemented. <br>

   > `[AN-24]: create-button-component` <br>
   > ❗ You can label your PR by select the tag on the right side of the PR screen under "Label". <br>

   > You might also have to fast-forward your current working branch to dev in order to prevent merge conflicts.

3. Review the PR.

   ❗❗ Reviewing your peers' code is important. It is not about just clicking "approve". See the changes and comment on the code. <br>
   Suggest them with a better code style. Ask them what you don't understand from the code.

   > `dev` is a protected branch. We need your reviews and approval in order to merge.
   > read your peer's code and add comments to them if needed!
   > It would be great if you switch out to their branch and test it with the simulator running.

4. Merge to `dev`.

   1. When the reviewing process is done and is approved, check for conflicts. <br>
   2. If there are no conflicts the person who created the PR will merge to dev. <br><br>
      ⚠️ MERGING SHOULD BE DONE BY THE PERSON WHO IMPLEMENTED THE CODE!

5. After each SPRINT, Thanh will merge `dev` to `main`.
   > ⭐ Remember to pull before starting any work!!

## Useful stuff

### Check for confilcts

⭐ Don't forget to pull from `dev` and rebase before creating a PR or before merging into `dev`
