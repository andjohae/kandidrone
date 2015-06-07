# kandiDrone
Bachelor thesis project at Chalmers University of Technology, Gothenburg,
Sweden 2015.

## Introduction
A module for autonomously searching an area for tags using the quadcopter AR.Drone 2.0 which is developed by [Parrot](http://ardrone2.parrot.com/).

This module is built on top of the following Node.js libraries:
* [node-ar-drone](https://github.com/felixge/node-ar-drone)
* [ardrone-autonomy](https://github.com/eschnou/ardrone-autonomy)

**Note:** Changes have been made to the ardrone-autonomy module for usage in this software. Please use the version supplied with kandiDrone on GitHub. No changes have been made to the node-ar-drone module and can therefore be exhanged for more recent versions, although no compatibility is guaranteed.

**WARNING:** This is experimental work. Please use this software carefully and in controlled environments. The user has complete responsibility while using this software and the authors or copyright holders may not be held liable for any damages caused. No functionality is guaranteed in any way.

## Features
*kandiDrone* will control the AR.Drone to autonomously fly over a rectangular area, which have been specified by the user, and search for tags. The tags used are the *oriented roundel* that the AR.Drone 2.0 can detect using its built-in software. The tag positions will be saved when they're considered confirmed. When either the entire search area have been covered or the total number of tags to detect have been confirmed, the drone returns to its starting position.

The module contanins:
* *kandiBrain* - Main submodule that plans the flight route given the user data that defines the search area. The submodule also executes the route and makes sure that the drone flies to the correct positions.
* *tagSearch* - Submodule that handles the tag detection.
* *runScript* - Executable script that initiates the program by binding all the necessary objects and setting the options for the drone.
* *kandiPrompt* - Defines the custom prompt using the *prompt* package and have been placed in a separate file simply for convenience.

**Note:** The copter will always face in the same direction when performing the flight over the search area. This is because problem with yaw-reagulation have been detected and the drone tend to drift.

## Status
Since this module was part of a bachelor thesis project, no further development is currently planned.

## Getting started
Here follows a short introduction of how to obtain and run the software, as well as a short user quide that explains its intended use.

### Installing the software

The software *kandiDrone* is available on [GitHub](https://github.com/andjohae/kandidrone) and can be installed using the node package manager:
```bash
npm install git://github.com/andjohae/kandidrone.git
```

### User guide

To run the software, run the *runScript.js* file located the *examples* directory. Please make sure the *examples* folder is your working directory when running the program.
```bash
node ./runScript.js
```

You will then be prompted to define the search mission. The requested information you need to supply is:

1. Length of search area (in meters). - *mandatory*
2. Width of search area  (in meters). - *mandatory*
3. Number of tags to detect.
4. Flight heigth (in meters).
5. X-coordinate of the start position for the search area (in meters).
6. Y-coordinate of the start position for the search area (in meters).

**Note:** The coordinate system is defined with positive x-axis in the drones forward direction and positive y-axis to its right (as seen from the top of the drone).
