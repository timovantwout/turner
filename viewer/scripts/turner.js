var maxImgDimPx = 80;

var sceneObj               = null;
var camera                 = null;
var renderPipeline         = null;
var postProcess            = null;
var currentSkybox          = null;
var currentSkyboxScale     = null;
var currentSkyboxBlurLevel = null;

var isFirefoxOrIceweasel = navigator.userAgent.indexOf("Firefox")   >= 0 ||
						   navigator.userAgent.indexOf("Iceweasel") >= 0;
						   
if (isFirefoxOrIceweasel)
{
	//assume we are inside an iframe
	window.addEventListener("DOMMouseScroll", function(e){
		e.preventDefault();	
	});
}
else
{
	//assume we are inside an iframe
	window.addEventListener("mousewheel", function(e)
	{
		e.preventDefault();	
	});
}

var viewerIsReadyCallbacks = [];

var viewerReady = false;

function emitViewerReady()
{
    viewerReady = true;
    
    for (var i = 0; i < viewerIsReadyCallbacks.length; ++i)
    {
        viewerIsReadyCallbacks[i]();
    }
};

var TurnerWheelFOVInput = function (camera, minFOV, maxFOV) {
    this.inertialFovOffset = 0;
    this.scaling = 0.00005;
    this.camera = camera;
    this.minFOV = minFOV;
    this.maxFOV = maxFOV;
}

TurnerWheelFOVInput.prototype.getTypeName = function () {
    return "TurnerWheelFOVInput";
};

TurnerWheelFOVInput.prototype.getSimpleName = function () {
    return "wheelFOV";
};

TurnerWheelFOVInput.prototype.attachControl = function (element, noPreventDefault) {
    if (!this._wheel) {
        var camera = this.camera;
        var _this = this;
        
        this._wheel = function (p, s) {
            if (p.type !== BABYLON.PointerEventTypes.POINTERWHEEL) { return; }
            var event = p.event;
            var delta;
            if (event.wheelDelta) {
                delta = -event.wheelDelta * _this.scaling;
            } else {
                let deltaValue = event.deltaY || event.detail;
                delta = -deltaValue * _this.scaling;
            }
            _this.inertialFovOffset += delta;    
        }
    
        this._observer = camera.getScene().onPointerObservable.add(this._wheel, BABYLON.PointerEventTypes.POINTERWHEEL);
    }
};

TurnerWheelFOVInput.prototype.detachControl = function (element) {
    if (this._observer && element) {
        this.camera.getScene().onPointerObservable.remove(this._observer);
        this._observer = null;
        this._wheel = null;
    }
};

TurnerWheelFOVInput.prototype.checkInputs = function () {
    if(this.inertialFovOffset != 0)
    {
        this.camera.fov += this.inertialFovOffset;
        this.camera.fov = Math.max(this.minFOV, Math.min(this.maxFOV, this.camera.fov));
    
        this.inertialFovOffset *= this.camera.inertia;
        if (Math.abs(this.inertialFovOffset) < BABYLON.Epsilon) {
            this.inertialFovOffset = 0;
        }
    }
};




function loadScene() {
    if (engine) {
        engine.dispose();
    }

    engine = new BABYLON.Engine(canvas, true);
    engine.enableOfflineSupport = false;

    var rootUrl  = "";    
    var fileName = "scene.gltf";

    //set the following to false in order to hide the animated loading screen
    BABYLON.SceneLoader.ShowLoadingScreen = true;
    
    BABYLON.SceneLoader.ForceFullSceneLoadingForIncremental = true;    
    
    var xhr = new XMLHttpRequest();
    xhr.open("GET", fileName, true);
    xhr.send();
    
    xhr.onload = function()
    {    
        // check glTF extras for object space normals
        var sceneJSON = JSON.parse(xhr.responseText);
        
        var useObjectSpaceNormalMap = false;
        
        if (sceneJSON.materials[0] && sceneJSON.materials[0].normalTexture)
        {
            var normalTextureJSON    = sceneJSON.materials[0].normalTexture;        
             useObjectSpaceNormalMap = normalTextureJSON.extras && normalTextureJSON.extras.objectSpaceNormals;
        }
            
        BABYLON.SceneLoader.Load(rootUrl, fileName, engine, function (scene) {
            
            sceneObj = scene;
            
            sceneObj.clearColor = new BABYLON.Color4(1.0, 1.0, 1.0, 1.0);
            
            var mainMesh = new BABYLON.Mesh("mainModelMesh", sceneObj);
            
            var sceneBBMin = new BABYLON.Vector3( Number.MAX_VALUE,  Number.MAX_VALUE,  Number.MAX_VALUE);
            var sceneBBMax = new BABYLON.Vector3(-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE);
                    
            sceneObj.meshes.forEach(function(mesh)
            {
                if (mesh !== mainMesh && mesh.material)
                {
                    mesh.material.forceIrradianceInFragment = true;
                
                    mesh.material.cameraExposure          = 1.2;
                    mesh.material.cameraContrast          = 1.5;
                    mesh.material.backFaceCulling         = false;
                    
                    if (useObjectSpaceNormalMap)
                    {
                        mesh.material.useObjectSpaceNormalMap = true;        
                    }
                                        
                    mesh.computeWorldMatrix(true);
                    var minBox = mesh.getBoundingInfo().boundingBox.minimumWorld;
                    var maxBox = mesh.getBoundingInfo().boundingBox.maximumWorld;
                    BABYLON.Tools.CheckExtends(minBox, sceneBBMin, sceneBBMax);
                    BABYLON.Tools.CheckExtends(maxBox, sceneBBMin, sceneBBMax);
                    
                    mesh.setParent(mainMesh);
                }
            });
			
            var centerVec  = sceneBBMax.subtract(sceneBBMin);
            var bSphereRad = centerVec.length() * 0.5;
            var bbCenter   = sceneBBMin.add(centerVec.multiplyByFloats(0.5, 0.5, 0.5));
                    
            var refScale    = 3.5;
            var scaleFactor = refScale / (2.0 * bSphereRad);
                        
            mainMesh.scaling = new BABYLON.Vector3(scaleFactor, scaleFactor, scaleFactor);
            mainMesh.translate(bbCenter.negate(), BABYLON.Space.WORLD);            
                        
            // these values will be overridden anyway when we set the position
            var alpha  = 0;
            var beta   = 0;
            var radius = 3;
            
            camera = new BABYLON.ArcRotateCamera("camera", alpha, beta, radius, BABYLON.Vector3.Zero(), sceneObj);
          
            
            camera.inputs.removeByType("ArcRotateCameraMouseWheelInput");

            // fov = 2 * arctan(frame_size / (focal_len * 2))
            // focal_len = h x W D / fov
            // tan (fov/2) = (d/2)/f
            // f = (d/2)/tan(fov/2)
            var minFOV = 13.7 * Math.PI / 180; // 100mm
            var maxFOV = 46.4 * Math.PI / 180; //  28mm
            var turnerInput = new TurnerWheelFOVInput(camera, minFOV, maxFOV);
            camera.inputs.add(turnerInput);


            var sceneCenter = new BABYLON.Vector3(0,0,0);//bbCenter.multiplyByFloats(scaleFactor, scaleFactor, scaleFactor);
                        

            // setting a typical 35mm focal length on 35mm film
            camera.fov = 0.66;

            var refDist       = (0.5 * refScale) / Math.tan(0.5 * camera.fov);
            var cameraInitPos = sceneCenter.add(new BABYLON.Vector3(0,0, refDist));
                        
            camera.setPosition(cameraInitPos);
            camera.setTarget(sceneCenter);
            
            camera.lowerRadiusLimit = refDist * 0.3;
            camera.upperRadiusLimit = refDist * 1.5;

            camera.minZ = camera.lowerRadiusLimit * 0.1;
            camera.maxZ = camera.upperRadiusLimit * 10.0;
			
            camera.wheelPrecision *= 20;
            camera.pinchPrecision *= 20;
                        
            camera.attachControl(canvas, true);   
			
			// setup environment
			sceneObj.environmentTexture = new BABYLON.CubeTexture.CreateFromPrefilteredData("images/environment.dds", sceneObj);

        	currentSkyboxScale     = 4.0 * camera.upperRadiusLimit;
			currentSkyboxBlurLevel = 0.5;
			
			currentSkybox = sceneObj.createDefaultSkybox(sceneObj.environmentTexture, true, currentSkyboxScale, currentSkyboxBlurLevel);

            renderPipeline            = new BABYLON.DefaultRenderingPipeline("default", true, sceneObj, [camera]);            
            renderPipeline.fxaaEnabled  = true;
            renderPipeline.bloomEnabled = true;
            renderPipeline.bloomWeight  = 0.5;
            
            // setup post processing            
            postProcess = renderPipeline.imageProcessing;
            postProcess.contrast = 1.0;
            postProcess.exposure = 1.0;
                        
            emitViewerReady();

            engine.runRenderLoop(function () {
                sceneObj.render();
            });
        });
    }
}


/************************************************************/
/************************ VIEWER API ************************/
/************************************************************/

/**
 * Tells whether the viewer is already initialized.
 */
var viewerIsReady = function()
{
    return viewerReady;
};

/************************************************************/
  
/**
 * Adds a callback that is executed whenever the viewer is ready.
 * If the viewer is already ready, it is executed right away.
 */
var addIsReadyCallback = function(callback)
{
    viewerIsReadyCallbacks.push(callback);
    
    if (viewerIsReady())
    {
        callback();
    }
}; 

/************************************************************/

/**
 * switches the display of the 3D environment on or off
 */
var toggle3DBackground = function(toggled)
{
    if (toggled && currentSkybox == null)
    {
        currentSkybox = sceneObj.createDefaultSkybox(sceneObj.environmentTexture, true, currentSkyboxScale, currentSkyboxBlurLevel);
    }
    else if (!toggled && currentSkybox != null)
    {
        currentSkybox.dispose();
        currentSkybox = null;
    }
};

/************************************************************/

var setSkyboxSharpness = function(value)
{
    currentSkyboxBlurLevel = 1.0 - value;
    
    if (currentSkybox)
    {
        currentSkybox.dispose();
        currentSkybox = sceneObj.createDefaultSkybox(sceneObj.environmentTexture, true, currentSkyboxScale, currentSkyboxBlurLevel);
    }
};

/************************************************************/

var setMinVerticalCameraAngle = function(value)
{
    // map from [-90°, 90°] to [PI, 0]
    camera.upperBetaLimit = ((180.0 - (value + 90)) / 180.0) * Math.PI;
};

/************************************************************/

var setMaxVerticalCameraAngle = function(value)
{
    // map from [-90°, 90°] to [PI, 0]
    camera.lowerBetaLimit = ((180.0 - (value + 90)) / 180.0) * Math.PI;
};

/************************************************************/

var setContrast = function(value)
{
    postProcess.contrast = value;
};

/************************************************************/

var setExposure = function(value)
{
    postProcess.exposure = value;
};

/************************************************************/

var setBloom = function(value)
{
    if (value > 0.0)
    {
        renderPipeline.bloomEnabled = true;
    }
    else
    {
        renderPipeline.bloomEnabled = false;
    }
    
    renderPipeline.bloomWeight = value;
};

/************************************************************/

/**
 * Sets the 3D environment map to be used, must be a ".dds"
 * or ".env" file compatible with BabylonJS.
 */
var setEnvironmentMap = function(envFile)
{
    if (sceneObj.environmentTexture)
    {
        sceneObj.environmentTexture.dispose();
    }
    sceneObj.environmentTexture = new BABYLON.CubeTexture.CreateFromPrefilteredData(envFile, sceneObj);    			    
    
    if (currentSkybox != null)
    {
        currentSkybox.dispose();
        currentSkybox = sceneObj.createDefaultSkybox(sceneObj.environmentTexture, true, currentSkyboxScale, currentSkyboxBlurLevel);
    }    
};

/************************************************************/

/**
 * Switches the display of the given element on or off
 */
var toggleElementVisibility = function(elementID, toggled)
{
    var elem = document.getElementById(elementID);
    
    if (!elem)
    {
        console.error("Cannot find element with ID \"" + elementID + "\".");
        return;
    }
    
    if (toggled)
    {
        elem.style.visibility = "visible";
    }
    else
    {
        elem.style.visibility = "hidden";
    }
};

/************************************************************/

/**
 * Sets the image to be used for the given element.
 */
var setElementImage = function(elementID, imageURL)
{
    var elem = document.getElementById(elementID);
    
    if (!elem)
    {
        console.error("Cannot find element with ID \"" + elementID + "\".");
        return;
    }
        
    var elemImage = new Image();
    
    elemImage.crossOrigin = "anonymous";
    
    elemImage.onload = function()
    {        
        var maxW   = maxImgDimPx;
        var maxH   = maxImgDimPx;
        var width  = elemImage.width;
        var height = elemImage.height;

        // image needs rescaling
        if (width > maxW || height > maxH)
        {
            if (width > height)
            {
                if (width > maxW)
                {
                    height *= maxW / width;
                    width = maxW;
                }
            }
            else
            {
                if (height > maxH)
                {
                    width *= maxH / height;
                    height = maxH;
                }
            }
            
            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext("2d");
            ctx.drawImage(elemImage, 0, 0);
        
            ctx.width  = width;
            ctx.height = height;
            
            var ctx = canvas.getContext("2d");
            ctx.drawImage(elemImage, 0, 0, width, height);

            var rescaledImgDataURL     = canvas.toDataURL("image/png");
            elem.style.backgroundImage = "url('" + rescaledImgDataURL + "')";
        }
        // image does not need rescaling
        else
        {
            elem.style.backgroundImage = "url('" + imageURL + "')";    
        }
        
        elem.style.width  = width  + "px";
        elem.style.height = height + "px";
    };
    
    elemImage.src = imageURL;    
};

/************************************************************/

/**
 * positions the given 2D element through CSS, using the given
 * values for sides and px offsets
 * example: "top" and "3px" means "top: 3px;" in cSS
 */
var setElementPosition = function(elementID,
                                  horizontalSide,   verticalSide,
                                  horizontalOffset, verticalOffset)
{
    var elem = document.getElementById(elementID);
    
    if (!elem)
    {
        console.error("Cannot find element with ID \"" + elementID + "\".");
        return;
    }
    
    var otherHSide = (horizontalSide == "left") ? "right"  : "left";
    var otherVSide = (verticalSide   == "top")  ? "bottom" : "top";
    
    elem.style[otherHSide]     = "";
    elem.style[otherVSide]     = "";
    elem.style[horizontalSide] = horizontalOffset;
    elem.style[verticalSide]   = verticalOffset;
};

/************************************************************/

var getElementPosX = function(elementID)
{
    var elem = document.getElementById(elementID);
    
    if (!elem)
    {
        console.error("Cannot find element with ID \"" + elementID + "\".");
        return;
    }
    
    return elem.offsetLeft;
};

/************************************************************/

var getElementPosY = function(elementID)
{
    var elem = document.getElementById(elementID);
    
    if (!elem)
    {
        console.error("Cannot find element with ID \"" + elementID + "\".");
        return;
    }
    
    return elem.offsetTop;
};


/************************************************************/

var getElementWidth = function(elementID)
{
    var elem = document.getElementById(elementID);
    
    if (!elem)
    {
        console.error("Cannot find element with ID \"" + elementID + "\".");
        return;
    }
    
    return elem.offsetWidth;
};

/************************************************************/

var getElementHeight = function(elementID)
{
    var elem = document.getElementById(elementID);
    
    if (!elem)
    {
        console.error("Cannot find element with ID \"" + elementID + "\".");
        return;
    }
    
    return elem.offsetHeight;
};

/************************************************************/

var getViewerWidth = function()
{
    return document.body.offsetWidth;
};

/************************************************************/

var getViewerHeight = function()
{
    return document.body.offsetHeight;
};

/************************************************************/

var addElementPointerDownCallback = function(elementID, callback)
{
    var elem = document.getElementById(elementID);
    
    if (!elem)
    {
        console.error("Cannot find element with ID \"" + elementID + "\".");
        return;
    }

    elem.addEventListener("pointerdown", callback);
};

/************************************************************/

var addPointerUpCallback = function(callback)
{   
    window.addEventListener("pointerup", callback);
};

/************************************************************/

var addPointerMoveCallback = function(callback)
{   
    window.addEventListener("pointermove", callback);
};

/************************************************************/
