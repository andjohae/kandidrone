# kandiDrone
Bachelor thesis project at Chalmers University of Technology, Gothenburg,
Sweden 2015.

## Introduction
A module for autonomously searching an area for tags using the quadcopter AR.Drone 2.0 which is developed by [Parrot](http://ardrone2.parrot.com/).

This module is built on top of the following Node.js libraries:
* [node-ar-drone](https://github.com/felixge/node-ar-drone)
* [ardrone-autonomy](https://github.com/eschnou/ardrone-autonomy)

**Note:** Changes have been made to the ardrone-autonomy module for usage in this software. Please use the version supplied with kandiDrone on GitHub. No changes have been made to the node-ar-drone module and can therefore be exhanged for more recent versions, although no compatibility is guaranteed.

**WARNING:** This is experimental work. Please use this software carefully and in controlled environments. The user has complete responsibility for any damage caused while the drone is controlled using this software. No functionality is guaranteed in any way.

## Status
Since this module was part of a bachelor thesis project, no further development is currently planned.

## Getting started
Here follows a short introduction of how to obtain and run the software, as well as a short user quide that explains it's intended use.

### Installing the software

The software *kandiDrone* is available on [GitHub](https://github.com/andjohae/kandidrone) and can be installed using the node package manager:
```bash
npm install git://github.com/andjohae/kandidrone.git
```

### User interaction

To run the software, run the *runScript.js* file located the *examples* directory. Please make sure the *examples* folder is your working directory when running the program.
```bash
node ./runScript.js
```
