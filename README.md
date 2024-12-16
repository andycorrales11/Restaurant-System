## Getting Started

Welcome to our project! This guide will help you set up the project locally on your machine. Please follow the steps below to get started.

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js and npm**: You can download and install both Node.js and npm from the official site. Follow the instructions here: [Download and Install Node.js and npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm).

### Installation Steps

1. **Clone the Repository**  
   First, clone the repository to your local machine:
   ```bash
   git clone https://github.com/CSCE331-Fall2024/project-3-42-dugg.git
   cd project-3-42-dugg
   ```

2. **Install Dependencies**  
   You will need to install dependencies for both the frontend and backend.

   - **Frontend**:
     ```bash
     cd frontend
     npm install
     ```

   - **Backend**:
     ```bash
     cd ../backend
     npm install
     ```

### Running the Project

To run the application, you'll need to start both the backend and frontend servers.

1. **Start the Backend**  
   Navigate to the backend folder and run:
   ```bash
   npm start
   ```

2. **Start the Frontend**  
   Open a new terminal window, navigate to the frontend folder, and run:
   ```bash
   npm start
   ```

### Accessing the App

Once both servers are running, you can access the application in your web browser at:
```
http://localhost:3000
```

### Troubleshooting

If you encounter any issues, please check the following:

- Ensure Node.js and npm are installed correctly.
- Verify that all dependencies are installed without errors.
- Check the terminal output for any error messages.

### Scrum Meeting Minutes

#### Scrum Meeting 1: 10/28/24

In this scrum meeting, we discussed the progress everyone had made over the weekend. The tech stack was set up, and we took time to explain to everyone what the format and organization looked like, and how different pieces interacted together. Work was also started for the kiosk screens, providing a basis for what frontend screen conversions might look like. For the most part, the biggest obstacle for most people was getting familiar with the tech stack, learning new languages and processes we haven’t used before. We also discussed our plans for sprint 1, which includes establishing our system’s frontend and getting it web hosted.

#### Scrum Meeting 2: 10/30/24

In this scrum meeting, we first discussed the progress everyone had made since the meeting before. Most of the frontend screens had been created, including the kiosk, inventory ordering, reporting, menu editing, and more. We also talked about our plans in regards to web hosting. We decided to use heroku, but had trouble getting an account set up properly, so it was something that was going to take some time. We then worked on figuring out what we wanted to go into our sprint 1 release, and assigned the needed tasks to people to work on.

#### Scrum Meeting 3: 11/1/24

In this scrum meeting, we started by walking through our updates to the project. More frontend screens were created, including further screens within the kiosk view, as well as the login screen and more. We also took some time to merge all of the separatebranches these features were created on, consolidating our project into one place. We then took a look at how were we shaping up for sprint 1, and if we wanted to adjust any of our plans. We determined that our sprint 2 would start by converting the backend of our previous system to the new tech stack, and we assigned tasks for that to be accomplished in the future.