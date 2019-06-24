# Turner 3D
A responsive, easy-to-use and freely configurable 3D item viewer and for the modern Web.

This is how one can embed the Turner 3D viewer, with default settings:
<div>
  <iframe width="400" height="400" src="https://dgg3d.github.io/turner/viewer/?modelURL=scene.glb"></iframe>
</div>


## Live Demos
* Check out the viewer configurator [here](https://dgg3d.github.io/turner/configurator/?modelURL=scene.glb)
* Check out a plain viewer demo [here](https://dgg3d.github.io/turner/viewer/?modelURL=scene.glb)


# What is Turner 3D?
Turner 3D is a responsive, easy-to-use and freely configurable 3D item viewer for the modern Web. It allows to seamlessly publish 3D models embedded into common Web pages, without any plugins, and it runs on all common Web-capable devices (including smart phones and tablets). Through the extensible configuration backend, 3D model owners can setup the exact user experience and 3D tools they desire for their end users.

Primary use cases include:

* 3D Visualization for *Advertisement* and *Online Shopping*

* 3D Visualization of *Cultural Heritage*

* Visualization of *3D-Scanned Items* for *Science & Education* (e.g., Medicine, Natural History)


# Technical Scope

Setting the technical scope more precisely, Turner 3D is ...

* an optimized framework for the creation of efficient 3D online presentations of (many) single items.

* providing an easy-to-use editor for customizable 3D viewer templates.

* focusing on intuitive 3D interaction and responsive behavior for optimal presentation on all devices, preventing users from getting "lost in (3D) space".


Turner 3D is *not* ...

* a 3D rendering framework itself (instead it relies on [BabylonJS](https://www.babylonjs.com/)).

* a 3D modeling tool.

* an "out-of-core" viewing tool for massive 3D models.


# Which Formats are Supported?

Currently, the only accepted input format for turner is *binary glTF* (.glb).
We believe in open, royalty-free standards, and glTF - the "jpeg for 3D" - fits very well with the mission of Turner 3D: becoming a broadly used, open-source item viewer for the modern Web.


# What URL Parameters are Supported?

The *Viewer* supports the following URL parameters:

* modelURL - URL of the model to be loaded (please not that cross-site restrictions may apply)

The *Configurator* supports the following URL parameters:

* modelURL - URL of the model to be loaded (please not that cross-site restrictions may apply)
* hideGetZIPButton - if set to "true", this hides the "Get ZIP" button
* hideSetModelButton - if set to "true", this hides the "Set Model" button


# What is the Team Behind Turner 3D?

Turner 3D is an open-source project, hosted on [GitHub](https://github.com/DGG3D/turner) and driven by the world-wide 3D community.
It is continuously developed further by following the requirements of many end users.

The GitHub repository is maintained by [DGG](https://github.com/DGG3D), ensuring long-term stability of the software.
Initial contributors to Turner 3D are
* [DGG](http://www.dgg3d.com)
* [Fraunhofer IGD](https://www.igd.fraunhofer.de/en) / [CultLab3D](https://www.cultlab3d.de/)


# How Can I Create a Custom Lighting Environment / Skybox?

In order to use a custom environment for lighting and as a Skybox, Turner 3D requires it in form of a .dds files, ideally of size 1MB or less. For now it is only possible to convert your own HDR Images to dds by using external tools; The following link leads to a very informative tutorial about how to create custom environment lighting for babylon:

* https://doc.babylonjs.com/how_to/use_hdr_environment

The GitHub project mentioned in the tutorials for converting hdr files into dds cubemaps can be found here:

* https://github.com/derkreature/IBLBaker

Some HDR environments can be found here:
* https://hdrihaven.com/ (Public Domain)
* http://www.hdrlabs.com/gallery/ (Licensed under CC BY-NC-SA 3.0 US)

Here is an additional forum link about the topic:
* https://forum.babylonjs.com/t/how-to-create-custom-pbr-environments/613


