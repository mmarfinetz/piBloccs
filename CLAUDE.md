# Block Collision π Simulation - Developer Guide

## 🏗️ Build & Run Commands
- **Build React app**: `cd pi-collision-react && npm install && npm run build`
- **Build everything**: `./build.sh`
- **Run the app**: `python app.py` or `node index.js`
- **Frontend dev server**: `cd pi-collision-react && npm start`
- **Run a test**: `cd pi-collision-react && npm test`
- **Lint React code**: `cd pi-collision-react && npx eslint src/`

## 🔧 Code Style Guidelines
- **Python**: PEP 8 format, docstrings for classes & functions, type hints where helpful
- **JavaScript**: ES6 syntax, functional components with hooks for React
- **React**: Component files organized by feature in separate directories
- **Imports**: Group imports by external libraries, then internal modules
- **Naming**: camelCase for JS variables/functions, PascalCase for components/classes
- **Error handling**: Try-catch in JS, try-except in Python with specific exceptions

## 📚 Project Structure
- Python simulation backend (`simulation.py`, `api/`)
- React frontend (`pi-collision-react/`)
- Express Node server (`index.js`)

## 🧪 Testing
- React tests use React Testing Library
- Add tests for any new components or functionality