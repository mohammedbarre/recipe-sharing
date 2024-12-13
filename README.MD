### Final Submission Document

#### Outline
This project is a Recipe Sharing application that allows users to register, log in, and explore a wide range of recipes. Users can search, save their favorite recipes, and manage their profiles. Built with Node.js and Express.js for the backend and MySQL for data management, the application ensures a secure and seamless user experience.

#### Links and Logins
- **App URL**: [https://your-app-url.com](https://your-app-url.com)
- **GitHub Repo**: [https://github.com/your-repo](https://github.com/your-repo)
- **Credentials**:  
  - Username: `testuser101`  
  - Password: `Test@user101`

#### Architecture
The app uses a client-server architecture. The backend, powered by Node.js and Express.js, handles the API and user interactions, while MySQL stores structured data. Sessions are used for secure authentication.

#### Data Model
- **Users**: Stores usernames and hashed passwords.
- **Recipes**: Contains recipe details such as name, description, and instructions.
- **Saved_Recipes**: Tracks recipes saved by users.

#### User Functionality
- **Search Recipes**: Users can search for recipes by name or category.
- **Save Recipes**: Save favorite recipes to personal profiles.
- **Profile Management**: View saved recipes and personalize settings.

#### Security
The application incorporates bcrypt for password hashing, input validation, and SQL injection prevention. User-specific features are access-controlled via secure sessions.

#### API Usage
The app provides REST API endpoints for searching, retrieving recipe details, and managing saved recipes.

#### Advanced Techniques
Secure password handling via bcrypt and RESTful API implementation are key technical highlights.
