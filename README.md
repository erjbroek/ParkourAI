![Static Badge](https://img.shields.io/badge/npm-v10.9.2-blue)
![GitHub last commit](https://img.shields.io/github/last-commit/erjbroek/parkourAI)
![Three.js](https://img.shields.io/badge/made%20with-Three.js-red)
# ParkourAI
### A TypeScript 3D parkour game using Three.js and NEAT to teach agents


ParkourAI is a project that explores how agents can learn and adapt in a 3D ([Three.js](https://threejs.org/)) environment. The agents start with simple neural networks and, over multiple generations, slowly learn to navigate increasingly complex obstacles and complete levels more efficiently. 

Normally, a neural network’s structure is chosen by a human, and the connection weights are learned through training. This can require a lot of trial and error to find a good setup.This project however uses [NEAT](https://en.wikipedia.org/wiki/Neuroevolution_of_augmenting_topologies) (Neuroevolution of augmenting topologies). NEAT is different from choosing the network: it evolves both the network’s structure and its weights at the same time. This means it can automatically find an effective network topology while learning the best connection values.The goal is to see how agents can learn and adapt to the environment on their own, without being directly programmed to solve the course. As a result, agents can learn to complete many different parkour courses.


![Parkour Demo](assets/parkour.gif)






## Features

**Race the agents** - You can race the agents once they complete a level, to see if you can beat them.
**Custom Levels** - Create your own parkour courses.  
**Adaptive Learning** - Agents improve over generations automatically.  
**Configurable NEAT** - Change mutation rate, strength, population size, and elitism percentage.  
**Neuroevolution Steps** - Initialization → Simulation → Evaluation → Selection → Mutation (repeats continuously).  
**Advanced Mutations** - Mutations can add hidden layers, recurrent connections, extra neurons between layers, change weights and more.  
**Visual Feedback** - Watch agents learn in real-time.  
**Saving generations** - Agent networks can be downloaded as json, which can be used


<br></br>
## Installation

**Clone the repository:**
```bash
git clone https://github.com/erjbroek/ParkourAI
cd parkour-ai
```

**Install dependencies:**
```bash
npm install
```
> `neataptic` is included in the dependencies, so no separate install is needed.

<br></br>

## Running the Game

This project uses [Vite](https://vitejs.dev/) for development.

**Start the local server:**
```bash
npx vite
```

Then open the printed `localhost` address in your browser.
