-- Create the database
CREATE DATABASE recipe_sharing;

-- Switch to the database
USE recipe_sharing;

-- Create the `users` table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- Create the `recipes` table
CREATE TABLE recipes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    user_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create a new MySQL user with a username and password
CREATE USER 'recipe_user'@'localhost' IDENTIFIED BY 'securepassword123';

-- Grant the new user access to the `recipe_sharing` database
GRANT ALL PRIVILEGES ON recipe_sharing.* TO 'recipe_user'@'localhost';

-- Apply the privilege changes
FLUSH PRIVILEGES;
