var maxImgDimPx = 120;

var elementIDToLink = 
{
    "company-logo" : "https://www.darmstadt-graphics.com/",
    "product-logo" : "https://dgg3d.github.io/turner"
};

var buttonsEnabled = true;

var elementImageCustomization = 
{
    "company-logo" : "",
    "product-logo" : "",
    "three-d-icon" : ""
};

var environmentMapCustomization = "";

var customModelFileURL = "";

var engine                 = null;
var sceneObj               = null;
var mainMesh               = null;
var camera                 = null;
var renderPipeline         = null;
var postProcess            = null;
var currentSkybox          = null;
var currentSkyboxScale     = null;
var currentSkyboxBlurLevel = null;
var turnerInput            = null;

var initModelRoughness = 0;
var initModelMetallic  = 0;

var refScale = 3.5;
var scaleFactor = 1;

var isFirefoxOrIceweasel = navigator.userAgent.indexOf("Firefox")   >= 0 ||
						   navigator.userAgent.indexOf("Iceweasel") >= 0;

if (isFirefoxOrIceweasel)
{
    //assume we are inside an iframe
    window.addEventListener("DOMMouseScroll", function(e){
        if (turnerInput && turnerInput.minFOV != turnerInput.maxFOV)
        {
            e.preventDefault();	
        }
    });
}
else
{
    //assume we are inside an iframe
    window.addEventListener("mousewheel", function(e)
    {
        if (turnerInput && turnerInput.minFOV != turnerInput.maxFOV)
        {
            e.preventDefault();	
        }
    }, { passive: false });
}

function getURLParamValue(key)
{
    var url    = window.location.search.substring(1);
    var params = url.split('&');
    for (var i = 0; i < params.length; i++) 
    {
        var pname = params[i].split('=');
        if (pname[0] == key) 
        {
            return pname[1];
        }
    }
    return "";
};

var viewerIsReadyCallbacks = [];
var viewerReady            = false;

var modelIsLoadedCallbacks = [];
var modelLoaded            = false;

function emitViewerReady()
{
    viewerReady = true;
    
    for (var i = 0; i < viewerIsReadyCallbacks.length; ++i)
    {
        viewerIsReadyCallbacks[i]();
    }
};

function emitModelLoaded()
{
    modelLoaded = true;
    
    for (var i = 0; i < modelIsLoadedCallbacks.length; ++i)
    {
        modelIsLoadedCallbacks[i]();
    }
};

// TODO: this function should probably also do 3D initialization
var initViewer = function()
{
    // default logos & links
    setElementImage('product-logo', 'images/product-logo.png');
    setElementImage('company-logo', 'images/company-logo.png');
    setElementImage('three-d-icon', 'images/three-d-icon.png');
    setElementImage('measurement-button-0','images/measurement-button-0.png');
    setElementImage('measurement-button-1','images/measurement-button-1.png');
    setElementImage('measurement-button-2','images/measurement-button-2.png');
    setElementImage('measurement-button-3','images/measurement-button-3.png');
    setElementImage('measurement-button-4','images/measurement-button-4.png');
    setElementImage('measurement-button-5','images/measurement-button-5.png');
    setElementImage('option-button'      , 'images/options.png');
    
    setElementLink('product-logo', 'http://rapidcompact.cloud');
    setElementLink('company-logo', 'https://www.dgg3d.com/');
}

var TurnerWheelFOVInput = function (camera, minFOV, maxFOV) {
    this.inertialFovOffset = 0;
    this.scaling = 0.001;
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
                delta = -event.wheelDelta * 0.025 * _this.scaling;
            } else {
                let deltaValue = event.deltaY || event.detail;
                delta = deltaValue * _this.scaling;
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

TurnerWheelFOVInput.prototype.checkInputs = function (forceUpdate) {
    if(this.inertialFovOffset != 0 || forceUpdate)
    {
        this.camera.fov += this.inertialFovOffset;
        this.camera.fov = Math.max(this.minFOV, Math.min(this.maxFOV, this.camera.fov));
    
        this.inertialFovOffset *= this.camera.inertia;
        if (Math.abs(this.inertialFovOffset) < BABYLON.Epsilon) {
            this.inertialFovOffset = 0;
        }
    }
};
 
 
function toggleObjectSpaceNormalMap(useObjectSpaceNormalMap)
{
    if (!useObjectSpaceNormalMap)
    {
        return;
    }
    
    sceneObj.meshes.forEach(function(mesh)
    {
        if (mesh.material)
        {
            mesh.material.useObjectSpaceNormalMap = true;
        }    
    });
}


function setupMainMesh()
{
    mainMesh = new BABYLON.Mesh("mainModelMesh", sceneObj);
                        
    var sceneBBMin = new BABYLON.Vector3( Number.MAX_VALUE,  Number.MAX_VALUE,  Number.MAX_VALUE);
    var sceneBBMax = new BABYLON.Vector3(-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE);
            
    sceneObj.meshes.forEach(function(mesh)
    {
        if (mesh !== mainMesh)
        {
            if (mesh.material)
            {
                mesh.material.forceIrradianceInFragment = true;                    
                mesh.material.backFaceCulling           = false;
            }
        
            mesh.computeWorldMatrix(true);
            var minBox = mesh.getBoundingInfo().boundingBox.minimumWorld;
            var maxBox = mesh.getBoundingInfo().boundingBox.maximumWorld;
            BABYLON.Tools.CheckExtends(minBox, sceneBBMin, sceneBBMax);
            BABYLON.Tools.CheckExtends(maxBox, sceneBBMin, sceneBBMax);
            
            mesh.setParent(mainMesh);
        }
    });
    
    // for empty scenes, use a cubical standard volume to fit to
    if (sceneBBMin.x == Number.MAX_VALUE)
    {
        sceneBBMin.x = -1; sceneBBMin.y = -1; sceneBBMin.z = -1;
        sceneBBMax.x =  1; sceneBBMax.y =  1; sceneBBMax.z =  1;
    }
    
    var centerVec   = sceneBBMax.subtract(sceneBBMin);
    var bSphereRad  = centerVec.length() * 0.5;
    var bbCenter    = sceneBBMin.add(centerVec.multiplyByFloats(0.5, 0.5, 0.5));          
    scaleFactor = refScale / (2.0 * bSphereRad);
                
    mainMesh.scaling = new BABYLON.Vector3(scaleFactor, scaleFactor, scaleFactor);
    mainMesh.translate(bbCenter.negate(), BABYLON.Space.WORLD);    
}


function addOSNormalMapPluginHook(bjsLoaderPlugin)
{
    bjsLoaderPlugin.onParsed = function(glTFData)
    {   
        if (glTFData.json.materials[0] &&
            glTFData.json.materials[0].normalTexture)
        {
            var normalTextureJSON = glTFData.json.materials[0].normalTexture;        
            
            if (normalTextureJSON.extras &&
                normalTextureJSON.extras.objectSpaceNormals)
            {
                console.log("Asset seems to have an object-space normal map. Triggering object-space normal mapping.")
                
                bjsLoaderPlugin.onComplete = function()
                {
                    toggleObjectSpaceNormalMap(true);  
                };                
            }
        }        
    };
}

//TODO: this function is not very clean - there should be a clear separation between init code and model loading code
function loadScene(rootUrl = '', fileName = 'scene.glb', environment = 'images/environment.dds') {
    
    if (engine) {
        engine.dispose();
    }

    engine = new BABYLON.Engine(canvas, true);
    engine.enableOfflineSupport = false;

    engine.loadingUIBackgroundColor = "#f8f8f8";

    //set the following to false in order to hide the animated loading screen
    BABYLON.SceneLoader.ShowLoadingScreen = true;
    
    BABYLON.SceneLoader.ForceFullSceneLoadingForIncremental = true;    
    
    var readyCallback = function(scene)
    {
        sceneObj = scene;

        scene.defaultCursor = "grab";

        sceneObj.onPointerDown = function() {
            scene.defaultCursor = "grabbing";
        };

        sceneObj.onPointerUp = function() {
            scene.defaultCursor = "grab";
            canvas.style.cursor = "grab";
        };
        
        sceneObj.preventDefaultOnPointerDown = false;
        
        sceneObj.clearColor = new BABYLON.Color4(0.0, 0.0, 0.0, 0.0); //transparent background

        setupMainMesh();

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
        //var minFOV = 13.7 * Math.PI / 180;   // 100mm
        //var maxFOV = 46.4 * Math.PI / 180;   //  28mm
        var minFOV = 3 * 9 * Math.PI / 180;
        var maxFOV = 6 * 9 * Math.PI / 180;
        
        turnerInput = new TurnerWheelFOVInput(camera, minFOV, maxFOV);
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
        sceneObj.environmentTexture = new BABYLON.CubeTexture.CreateFromPrefilteredData(environment, sceneObj);

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
        
        initModelRoughness = getItemRoughnessFactor();
        initModelMetallic  = getItemMetallicFactor();
                
        engine.runRenderLoop(function () {
            sceneObj.render();
        });
           
        if (fileName != "")
        {
            emitModelLoaded();
        }
        
        if (!viewerReady)
        {
            emitViewerReady();
        }
    };
        
    // init without model
    if (fileName == "" && !sceneObj)
    {
        readyCallback(new BABYLON.Scene(engine));
    }
    else
    {
        var bjsLoaderPlugin = BABYLON.SceneLoader.Load(rootUrl, fileName, engine, readyCallback);        
        addOSNormalMapPluginHook(bjsLoaderPlugin);    
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
    if (viewerIsReady())
    {
        callback();
    }
    else
    {
        viewerIsReadyCallbacks.push(callback);
    }
}; 

/************************************************************/

/**
 * Tells whether the current model-to-load is already loaded.
 */
 var modelIsLoaded = function()
{
    return modelLoaded;
};

/************************************************************/

/**
 * Adds a callback that is executed whenever a model has been loaded.
 * If a model is already loaded, it is executed right away.
 */
var addModelLoadedCallback = function(callback)
{
    if (modelIsLoaded())
    {
        callback();
    }
    else
    {
        modelIsLoadedCallbacks.push(callback);
    }
};

/************************************************************/

/**
 * Sets the model to be shown inside the viewer.
 */
var setModelFromFile = function(file, rootUrl = "file:")
{
    modelLoaded = false;
    
    var bjsLoaderPlugin = BABYLON.SceneLoader.Append(rootUrl, file, sceneObj,
        function(scene)
        {
            var skyboxEnabled = currentSkybox != null;
            if (skyboxEnabled)
            {
                toggle3DBackground(false);    
            }
            
            mainMesh.dispose();        
            
            setupMainMesh();
            
            if (skyboxEnabled)
            {
                toggle3DBackground(true);
            }
            
            var reader = new FileReader();
            reader.onloadend = function ()
            {
                customModelFileURL = reader.result;
            }
            reader.readAsDataURL(file);
                        
            initModelRoughness = getItemRoughnessFactor();
            initModelMetallic  = getItemMetallicFactor();
            
            emitModelLoaded();
        },
        null,
        function()
        {
            console.error("Unable to load model.");
        }
    );
    
    addOSNormalMapPluginHook(bjsLoaderPlugin);
};

/************************************************************/

var getCustomModelFileURL = function()
{
    return customModelFileURL;    
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
    
    if (!toggled)
    {
        // disable fxaa if we have a transparent background,
        // since we'll otherwise get a visible outline
        renderPipeline.fxaaEnabled = false;
    }
    else
    {
        renderPipeline.fxaaEnabled = true;
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

var setMinZoomFactor = function(value)
{
    value = Math.max(Math.min(value, 10), 1);
    turnerInput.minFOV = value * 9 * Math.PI / 180;
    turnerInput.checkInputs(true);
};

/************************************************************/

var setMaxZoomFactor = function(value)
{
    value = Math.max(Math.min(value, 10), 1);
    turnerInput.maxFOV = value * 9 * Math.PI / 180;
    turnerInput.checkInputs(true);
};

/************************************************************/

/**
 * Toggles sensitivity of the interactive camera panning.
 * A value of zero disables panning.
 */
var setPanningSensitivity = function(value)
{   
    if (value > 0) 
    {
        camera.panningSensibility = (1.1 - value) * 4000;        
    }
    else
    {
        camera.panningSensibility = 0;
    }
};

/************************************************************/

var setContrast = function(value)
{
    setTimeout(function()
    {
    postProcess.contrast = value;
    }, 100);
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
    
    environmentMapCustomization = envFile;
};

/************************************************************/

/**
 * If a different environment than the standard one is used,
 * this function returns the respective URL, otherwise an
 * empty string.
 */
var getEnvironmentMapCustomURL = function()
{
    return environmentMapCustomization;
};

/************************************************************/

/**
 * Switches the interactive buttons on or off.
 * Useful for switching between editing and preview mode.
 */
var toggleButtons = function(val)
{
    if (val != buttonsEnabled)
    {
        buttonsEnabled = val;
     
        for (var p in elementIDToLink)
        {
            if (elementIDToLink.hasOwnProperty(p))
            {
                var elem = document.getElementById(p);        
                if (!elem)
                {
                    continue;
                }
                if (buttonsEnabled && elementIDToLink[p] != "")
                {           
                    elem.setAttribute("href", elementIDToLink[p]);
                }
                else
                {
                    elem.setAttribute("href", "javascript:void(0)");
                }
            }
        }
    }
    else
    {
        buttonsEnabled = val;
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
 * Switches the display of the given element on or off
 */
var toggleDivisionVisibility = function(elementID, toggled)
{
    var elem = document.getElementById(elementID);
    
    if (!elem)
    {
        console.error("Cannot find element with ID \"" + elementID + "\".");
        return;
    }
    
    if (toggled)
    {
        elem.style.display = "block";
    }
    else
    {
        elem.style.display = "none";
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
        }
        
        var canvas = document.createElement('canvas');
        canvas.setAttribute("width",  width);
        canvas.setAttribute("height", height);
        
        var ctx = canvas.getContext("2d");        
        ctx.width  = width;
        ctx.height = height;
        ctx.drawImage(elemImage, 0, 0, width, height);
        
        var rescaledImgDataURL     = canvas.toDataURL("image/png");
        elem.style.backgroundImage = "url('" + rescaledImgDataURL + "')";
        
        elementImageCustomization[elementID] = rescaledImgDataURL;
        
        elem.style.width  = width  + "px";
        elem.style.height = height + "px";
    };
    
    elemImage.src = imageURL;
};

/************************************************************/

var getElementImageCustomURL = function(elementID)
{
    var elem = document.getElementById(elementID);
    
    if (!elem)
    {
        console.error("Cannot find element with ID \"" + elementID + "\".");
        return;
    }
    
    return elementImageCustomization[elementID];
};

/************************************************************/

/**
 * Sets the link to be used for the given element.
 */
var setElementLink = function(elementID, linkURL)
{
    elementIDToLink[elementID] = linkURL;
    
    if (buttonsEnabled)
    {
        var elementID = elementID;
        
        var elem = document.getElementById(elementID);
        
        if (!elem)
        {
            console.error("Cannot find element with ID \"" + elementID + "\".");
            return;
        }
        
        if (linkURL == "")
        {
            elem.setAttribute("href", "javascript:void(0)");
        }
        else
        {
            elem.setAttribute("href", linkURL);
        }
    }    
};

/************************************************************/

/**
 * Returns the link to be used for the given element.
 */
var getElementLink = function(elementID)
{
    var elem = document.getElementById(elementID);
        
    if (!elem)
    {
        console.error("Cannot find element with ID \"" + elementID + "\".");
        return;
    }
    
    return elementIDToLink[elementID];
};

/************************************************************/
/**
 * Configures the given 2D element's background through CSS,
 * using the given value 
 */
var setElementBackground = function(elementID, cssBackgroundStyle)
{
    var elem = document.getElementById(elementID);
    
    if (!elem)
    {
        console.error("Cannot find element with ID \"" + elementID + "\".");
        return;
    }
    
    elem.style.background = cssBackgroundStyle;
};
    
/************************************************************/
/**
 * Positions the given 2D element through CSS, using the given
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
    
    elem.style[otherHSide]     = "inherit";
    elem.style[otherVSide]     = "inherit";
    elem.style[horizontalSide] = horizontalOffset;
    elem.style[verticalSide]   = verticalOffset;
};

/************************************************************/

var getElementCustomCSS = function(elementID, propertyIgnoreList)
{
    var elem = document.getElementById(elementID);
    
    if (!elem)
    {
        console.error("Cannot find element with ID \"" + elementID + "\".");
        return;
    }
    
    var cssStr = "";
    
    for (var i = 0; i < elem.style.length; ++i)
    {
        var propertyName = elem.style[i];
        
        var ignoreElem = false;
        for (var j = 0; j < propertyIgnoreList.length; ++j)
        {
            if (propertyIgnoreList[j] == propertyName)
            {
                ignoreElem = true;
                break;
            }
        }
        
        if (!ignoreElem)
        {
            cssStr += propertyName + ":" + elem.style[propertyName] + ";";
        }
    }
        
    return cssStr;
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

var getItemMetallicFactor = function()
{
    for (var i = 0; i < sceneObj.meshes.length; ++i)
    {
        var mesh = sceneObj.meshes[i];
        if (mesh.material && mesh.material.metallic != undefined)
        {
            return mesh.material.metallic;
        }
    }
    return -1.0;
};

/************************************************************/

var setItemMetallicFactor = function(factor)
{    
    for (var i = 0; i < sceneObj.meshes.length; ++i)
    {
        var mesh = sceneObj.meshes[i];        
        if (mesh.material && mesh.material.metallic != undefined)
        {            
            mesh.material.metallic = factor;            
        }
    }
};

/************************************************************/

var getItemRoughnessFactor = function()
{
    for (var i = 0; i < sceneObj.meshes.length; ++i)
    {
        var mesh = sceneObj.meshes[i];
        if (mesh.material && mesh.material.roughness != undefined)
        {
            return mesh.material.roughness;
        }
    }
    return -1.0;
};

/************************************************************/

var setItemRoughnessFactor = function(factor)
{
    for (var i = 0; i < sceneObj.meshes.length; ++i)
    {
        var mesh = sceneObj.meshes[i];
        if (mesh.material && mesh.material.roughness != undefined)
        {
            mesh.material.roughness = factor;            
        }
    }
};

/************************************************************/

var getItemAsGLBBlob = function(callback)
{
    var options =
    {
        "shouldExportTransformNode" : function(node)
        {
            // ignore the skybox node
            return (node !== currentSkybox);
        }
    };
    
    BABYLON.GLTF2Export.GLBAsync(sceneObj, "scene", options).then((glbFileBlobs) =>
    {
        var glbBlob = glbFileBlobs.glTFFiles["scene.glb"];
        callback(glbBlob);
    });
};

/************************************************************/

var itemIsUnchanged = function()
{
    return initModelRoughness == getItemRoughnessFactor() &&
           initModelMetallic  == getItemMetallicFactor();
};


/***********************************************************/


/***********************************************************/
/***********************Measurement*************************/
/***********************************************************/



//Booleans
var simpleMeasurementBoolean = true;
var simultaneousMeasuermentBoolean;
var multiPointMeasurementBoolean;
var geodesicMeasuermentBoolean;
var dimensionBoolean;
var boundingBoxBoolean;
var optionsBoolean = true;
var unitBoolean = true;


/**
 * 
 * @param {*} name of the Boolean that should be toggled 
 * @param {*} toggle status the boolean shoud be set to
 */
var toggleBoolean = function(name, toggle){

    switch(name){
        case "simpleMeasurementBoolean":
            simpleMeasurementBoolean = toggle;
            break;
        case "simultaneousMeasuermentBoolean":
            simultaneousMeasuermentBoolean = toggle;
            break;
        case "multiPointMeasurementBoolean":
            multiPointMeasurementBoolean = toggle;
            break;
        case "geodesicMeasuermentBoolean":
            geodesicMeasuermentBoolean = toggle;
            break;
        case  "dimensionBoolean":
            dimensionBoolean = toggle;
            break;
        case "boundingBoxBoolean":
            boundingBoxBoolean = toggle;
            break;
        case "optionsBoolean":
            optionsBoolean = toggle;
            break;
        case "unitBoolean":
            unitBoolean = toggle;
            break;
        default:
            console.log(name + "is not a defined boolean of the viewer");
    }
    updateViewerToolbox();
}

/**
 * Shows or hides the tools of the measurement toolbox and adds or removes the listeners on the items
 */
var updateViewerToolbox = function(){

    if(simpleMeasurementBoolean){
        item = document.getElementById('measurement-button-0');
        item.style.display = "block";
        item.addEventListener("click", toggleSimpleMeasurement);
    }else{
        item = document.getElementById('measurement-button-0');
        item.style.display = "none";
        window.removeEventListener("click", toggleSimpleMeasurement);
    }

    if(simultaneousMeasuermentBoolean){
        item = document.getElementById('measurement-button-1');
        item.style.display = "block";
        item.addEventListener("click", toggleSimultaneousMeasuerment);
    }else{
        item = document.getElementById('measurement-button-1');
        item.style.display = "none";
        window.removeEventListener("click", toggleSimultaneousMeasuerment);
    }

    if(multiPointMeasurementBoolean){
        item = document.getElementById('measurement-button-2');
        item.style.display = "block";
        item.addEventListener("click", toggleMultiPointMeasurement);
    }else{
        item = document.getElementById('measurement-button-2');
        item.style.display = "none";
        window.removeEventListener("click", toggleMultiPointMeasurement);
    }

    if(geodesicMeasuermentBoolean){
        item = document.getElementById('measurement-button-3');
        item.style.display = "block";
        item.addEventListener("click", toggleGeodesicMeasuerment);
    }else{
        item = document.getElementById('measurement-button-3');
        item.style.display = "none";
        window.removeEventListener("click", toggleGeodesicMeasuerment);
    }

    if(dimensionBoolean){
        item = document.getElementById('measurement-button-4');
        item.style.display = "block";
        item.addEventListener("click", toggleShowDimension);
    }else{
        item = document.getElementById('measurement-button-4');
        item.style.display = "none"; 
        window.removeEventListener("click", toggleShowDimension);
    }

    if(boundingBoxBoolean){
        item = document.getElementById('measurement-button-5');
        item.style.display = "block";
        item.addEventListener("click", toggleBoundingBox);
    }else{
        item = document.getElementById('measurement-button-5');
        item.style.display = "none";
        window.removeEventListener("click", toggleBoundingBox);
    }

    if(optionsBoolean){
        item = document.getElementById('option-button');
        item.style.display = "block";
        item.addEventListener("click", toggleOptions);
    }else{
        item = document.getElementById('option-button');
        item.style.display = "none";
        window.removeEventListener("click", toggleOptions);
    }

}


//----------General Measurement----------

var measurementObj = [];

/**
 * Converts a point into a String with xyz
 * @param {*} point with xyz value, care x-Axis will be inverted
 */
var pointToString = function(point){
    var res  = "-";
    var val1 = point.x.toFixed(5);
    var val2 = point.y.toFixed(5);
    var val3 = point.z.toFixed(5);

    //x axis is inverted on the mesh (?)
    val1 = -val1;

    val1 = val1 > 0 ? "x:  " + val1 : "x: " + val1;
    val2 = val2 > 0 ? "  y:  " + val2 : "  y: " + val2;
    val3 = val3 > 0 ? "  z:  " + val3 : "  z: " + val3;
    return val1 + val2 + val3;
}

// https://www.paulirish.com/2009/random-hex-color-code-snippets/
var getRandomColor = function(){
    return '#'+Math.floor(Math.random()*16777215).toString(16);
}

var pinSize = 0.05;
/**
 * 
 * @param {*} pickedP Point on sceneObj
 * @param {*} headColor Babylon.Color3
 */
var createPin = function(pickedP, headColor){
    var coordinate = pickedP.pickedPoint;
    var coneLength = pinSize / 10 * 6;
    var sphereSize = pinSize / 10 * 4;

    //Materials or rather Color
    var matSphere = new BABYLON.StandardMaterial('matSphere', sceneObj);
    matSphere.emissiveColor = headColor;
    var matCone = new BABYLON.StandardMaterial('matCone', sceneObj);
    matCone.emissiveColor = new BABYLON.Color3(0.75, 0.75, 0.75);

    //Creation of the Pin
    var sphere = BABYLON.MeshBuilder.CreateSphere('sphere', {diameter: sphereSize, segments: 16}, sceneObj);
    sphere.material = matSphere;
    measurementObj.push(sphere);
    
    var cone = BABYLON.MeshBuilder.CreateCylinder("cone", {diameter: sphereSize / 10, height: coneLength, tessellation: 96}, sceneObj);
    cone.material = matCone;
    measurementObj.push(cone);

    sphere.position.y = coneLength + sphereSize / 2;
    cone.position.y = coneLength / 2;
    var mesh = BABYLON.Mesh.MergeMeshes([sphere, cone], true, true, undefined, false, true);
    measurementObj.push(mesh);

    //Location of the Pin
    mesh.lookAt(BABYLON.Vector3.Zero());
    mesh.position.x = coordinate.x;
    mesh.position.y = coordinate.y;
    mesh.position.z = coordinate.z;

    //Rotation of the Pin
    var axis1 = pickedP.getNormal();
    axis1.x   = -axis1.x;		        //x Achsis has to bin inverted???					        		
    var axis2 = BABYLON.Vector3.Zero();
    var axis3 = BABYLON.Vector3.Zero();
    var start = new BABYLON.Vector3(Math.PI / 2, Math.PI / 2, 0);			

    BABYLON.Vector3.CrossToRef(start, axis1, axis2);
    BABYLON.Vector3.CrossToRef(axis2, axis1, axis3);
    var tmp = BABYLON.Vector3.RotationFromAxis(axis3.negate(), axis1, axis2);
    var quaternion   = BABYLON.Quaternion.RotationYawPitchRoll(tmp.y, tmp.x, tmp.z);
    mesh.rotationQuaternion = quaternion;
}


/**
 * 
 * @param {*} cursorType sets the cursor type as the hover cursor of every mesh
 */
var setCursorOverObject = function(cursorType){
    for (var i = 0; i < sceneObj.meshes.length; ++i){
        var mesh = sceneObj.meshes[i];
        mesh.actionManager = new BABYLON.ActionManager(sceneObj);
        mesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOverTrigger, function(ev){	
            sceneObj.hoverCursor = cursorType;
            }, false));
    }
}

/**
 * removes all actionManagers on the Object
 */
var resetCursor = function(){
    for (var i = 0; i < sceneObj.meshes.length; ++i){
        var mesh = sceneObj.meshes[i];
        if(mesh.actionManager != null){
            mesh.actionManager.actions.length = 0;
        }
    }
}

//Adds metrics the the distance
var distanceUnit = function(dist){
    if (unitBoolean) {
        var res = "";
        var m = 0;
        var cm = 0;
        var mm = 0;
        while (dist > 1) {
            m++;
            dist--;
        }
        dist = dist * 100;
        while (dist > 1) {
            cm++;
            dist--;
        }
        dist = dist * 10;
        while (dist > 1) {
            mm++;
            dist--;
        }

        if (m != 0) {
            res = res + (m < 10 ? ("0" + m) : m) + "m ";
            dist = dist.toFixed(3);
            dist = dist * 1000;
        }
        if (res != "" || cm != 0) {
            res = res + (cm == 0 ? "00" : (cm < 10 ? ("0" + cm) : cm)) + "cm ";
            if (m == 0) {
                dist = dist.toFixed(5);
                dist = dist * 100000;
            }
        }
        if (m == 0 && cm == 0) {
            dist = dist.toFixed(7);
            dist = dist * 10000000;
        }

        return (res + mm + "," + dist + "mm");
    } else {
        dist = dist * 39.3701;

        var res = dist;
        return(res);

}
}

/**
 * Resets general objects
 */
var resetGeneral = function(){
    for(var i = 0; i < measurementObj.length ; i++){
        measurementObj[i].dispose();
        measurementObj[i] = null;
    }
    measurementObj.length = 0;
    
    var resultDisplayElement = document.getElementById("measurement-display");
    while(resultDisplayElement.firstChild){
        resultDisplayElement.removeChild(resultDisplayElement.firstChild);
    }
    resultDisplayElement.style.display = "none";


    //-----ToDo-----
    //Reset the Buttons so no 2 Measurements are active at the same time 

}

//----------Simple Measurement----------
var simpleMeasurementState = false;
var toggleSimpleMeasurement = function(){
    simpleMeasurementState = !simpleMeasurementState;
    simpleMeasurementState ? simpleMeasurement() : resetSimpleMeasurement();
}

var simpleMeasurement = function(){
    document.getElementById('measurement-button-0').style.outlineColor = "black";
    window.addEventListener("click", simpleMeasurementPickPoints);    
}

var resetSimpleMeasurement = function(){
    document.getElementById('measurement-button-0').style.outlineColor = "transparent";
    window.removeEventListener("click", simpleMeasurementPickPoints);
    pointOne = null;
    pointTwo = null;
    resetGeneral();
    resetCursor();
}

var pointOne;
var pointTwo;
var simpleMeasurementPickPoints = function () {

    setCursorOverObject("crosshair");

    var colorOne = new BABYLON.Color3(0.75, 0, 0);
    var colorTwo = new BABYLON.Color3(0.75, 0.75, 0);

    if (!pointOne) {

        var point = sceneObj.pick(sceneObj.pointerX, sceneObj.pointerY);

        if (point.hit) {

            pointOne = point;
            createPin(pointOne, colorOne);

            var resultDisplayElement = document.getElementById("measurement-display");
            resultDisplayElement.style.display = "block";

            var close = document.createElement("img");
            close.setAttribute("src", "images/red-x.png");
            close.style.cssText = "width: 15px; height: 15px; pointer-events: auto; float: right; z: 2000;";
            resultDisplayElement.appendChild(close);
            close.addEventListener("click", toggleSimpleMeasurement);

            var heading = document.createElement("h3");
            heading.innerText = "Two Point Measurement";
            heading.style.textAlign = "center";
            resultDisplayElement.appendChild(heading);

            var displayOne = document.createElement("strong");
            displayOne.style.color = "#bf0000";
            displayOne.innerText = "Point 1: "
            resultDisplayElement.appendChild(displayOne);

            var resultOne = document.createElement("span");
            resultOne.innerText = pointToString(pointOne.pickedPoint.scale(1 / scaleFactor));
            resultDisplayElement.appendChild(resultOne);

        }
    } else {

        var point = sceneObj.pick(sceneObj.pointerX, sceneObj.pointerY);

        if (point.hit) {
            pointTwo = point;
            createPin(pointTwo, colorTwo);

            var resultDisplayElement = document.getElementById("measurement-display");
            resultDisplayElement.appendChild(document.createElement("br"));
            resultDisplayElement.appendChild(document.createElement("br"));

            var displayTwo = document.createElement("strong");
            displayTwo.style.color = "#bfbf00"
            displayTwo.innerText = "Point 2: "
            resultDisplayElement.appendChild(displayTwo);

            var resultTwo = document.createElement("span");
            resultTwo.innerText = pointToString(pointTwo.pickedPoint.scale(1 / scaleFactor));
            resultDisplayElement.appendChild(resultTwo);

            resultDisplayElement.appendChild(document.createElement("br"));
            resultDisplayElement.appendChild(document.createElement("br"));

            var displayDis = document.createElement("strong");
            displayDis.innerText = "Distance: "
            resultDisplayElement.appendChild(displayDis);

            var resultDis = document.createElement("span");
            resultDis.innerText = distanceUnit(BABYLON.Vector3.Distance(pointOne.pickedPoint.scale(1/scaleFactor), pointTwo.pickedPoint.scale(1/scaleFactor)));
            resultDisplayElement.appendChild(resultDis);

            //Tube
            var resultTube = BABYLON.MeshBuilder.CreateTube("resultTube",{path : [pointOne.pickedPoint, pointTwo.pickedPoint], radius : 0.0025, tessellation: 96},sceneObj);
            resultTube.material = new BABYLON.StandardMaterial("resultMat", sceneObj);
            resultTube.material.emissiveColor = new BABYLON.Color3(1,0,0);
            measurementObj.push(resultTube);

            window.removeEventListener("click", simpleMeasurementPickPoints);
            resetCursor();
        }
    }
}


var toggleSimultaneousMeasuerment = function(){}


//-----Multioint------
var showPin = function(){
    //https://doc.babylonjs.com/how_to/camera_behaviors
    //Look at function
}

var multiPointMeasurementState = false;
var toggleMultiPointMeasurement = function(){
    multiPointMeasurementState = !multiPointMeasurementState;
    multiPointMeasurementState ? multiPointMeasurement() : resetMultiPointMeasurement();
}

var multiPointMeasurement = function () {
    document.getElementById('measurement-button-2').style.outlineColor = "black";
    window.addEventListener("click", multiPointMeasurementPickPoints);

    var resultDisplayElement = document.getElementById("measurement-display");
    resultDisplayElement.style.display = "block";

    var table = document.createElement("table");
    table.id = "table"

    var row = document.createElement("tr")

    var col1 = document.createElement("th");
    col1.innerText = "Name";
    row.appendChild(col1);

    var col2 = document.createElement("th");
    col2.innerText = "X";
    row.appendChild(col2);

    var col3 = document.createElement("th");
    col3.innerText = "Y";
    row.appendChild(col3);

    var col4 = document.createElement("th");
    col4.innerText = "Z";
    row.appendChild(col4);

    var col5 = document.createElement("th");
    search = document.createElement("img");
    search.setAttribute("src", "images/lupe.png");
    search.style.cssText = "width: 15px; height: 15px; pointer-events: auto; float: right; z: 2000;";
    col5.appendChild(search);
    row.appendChild(col5);

    table.appendChild(row);
    resultDisplayElement.appendChild(table);
}

var resetMultiPointMeasurement = function () {
    document.getElementById('measurement-button-2').style.outlineColor = "transparent";
    window.removeEventListener("click", multiPointMeasurementPickPoints);
    resetGeneral();
    resetCursor();
}

var multiPointMeasurementPickPoints = function () {
    setCursorOverObject("crosshair");

    var point = sceneObj.pick(sceneObj.pointerX, sceneObj.pointerY);

    if (point.hit) {


        var hex = getRandomColor();
        var color = new BABYLON.Color3.FromHexString(hex);
        createPin(point, color);
        var pointName = "N.N."

        var table = document.getElementById("table");

        var row = document.createElement("tr")

        var col1 = document.createElement("td");
        col1.innerText = pointName;
        row.appendChild(col1);
        col1.style.cssText = "pointer-events: auto; z-index: 12;";
        col1.addEventListener("click", function () {
            changeTableContent(col1);
        });

        var col2 = document.createElement("td");
        col2.innerText = -point.pickedPoint.scale(1 / scaleFactor).x.toFixed(5);
        row.appendChild(col2);

        var col3 = document.createElement("td");
        col3.innerText = point.pickedPoint.scale(1 / scaleFactor).y.toFixed(5);
        row.appendChild(col3);

        var col4 = document.createElement("td");
        col4.innerText = point.pickedPoint.scale(1 / scaleFactor).z.toFixed(5);
        row.appendChild(col4);

        var col5 = document.createElement("td");
        col5.bgColor = hex;
        col5.style.cssText = "border-radius: 50px; pointer-events: auto; z-index: 12;";
        col5.addEventListener("click", showPin())
        row.appendChild(col5);

        table.appendChild(row);

        var input = document.createElement("input");
        input.id = "this-input"
        input.type = "text";
        input.value = pointName;


        var x = event.clientX;
        var y = event.clientY;

        input.style.cssText = "position: fixed; pointer-events: auto; z-index: 12;";
        input.style.top = y + "px";
        input.style.left = x + "px";

        table.appendChild(input);
        input.focus();

        input.addEventListener("focusout", function () {
                col1.innerText = input.value;
                input.parentNode.removeChild(input);
        }, {once: true});

        input.addEventListener("keyup", function(event){
            event.preventDefault();
            if(event.keyCode ===13){
                    col1.innerText = input.value;
                    input.parentNode.removeChild(input);
            }
        });
    }

}

var changeTableContent = function(elem){
    var resultDisplayElement = document.getElementById("measurement-display");
    var input = document.createElement("input");
    input.type = "text";
    input.value = elem.innerText;
    input.style.cssText = "pointer-events: auto";
    resultDisplayElement.appendChild(input);
    input.focus();
    input.addEventListener("focusout", function(){
        if(resultDisplayElement.contains(input)){
            elem.innerText = input.value;
            resultDisplayElement.removeChild(input);
        }
    }, {once: true});
    input.addEventListener("keyup", function(event){
        event.preventDefault();
        if(event.keyCode ===13){
            if(resultDisplayElement.contains(input)){
                elem.innerText = input.value;
                resultDisplayElement.removeChild(input);
            }
            
        }
    });
}

var toggleGeodesicMeasuerment = function(){}
var toggleShowDimension = function(){}
var toggleBoundingBox = function(){}
var toggleOptions = function(){
    console.log(Math.random().toFixed(2))
}

/************************************************************/
