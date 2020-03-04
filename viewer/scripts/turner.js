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

var isTextureDisabled = false;
var originalMaterials = [];

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
           
        // textures should be disabled
        if (isTextureDisabled) {
            // reset the state, initially the textures would be enabled
            isTextureDisabled = false;
            hideTexture(true);
        }

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

/************************************************************/

var toggleShadow = function(toggle){


    var ground = BABYLON.MeshBuilder.CreateGround("ground", {height: 3, width:2}, sceneObj);
    ground.position.y = -scaleFactor - 0.2;
    ground.receiveShadows = true;

    var light = new BABYLON.DirectionalLight("dir01", new BABYLON.Vector3(0, -toggle, 0), sceneObj);
    light.intensity = 0.5;

    var shadowLight = new BABYLON.DirectionalLight("dir01", new BABYLON.Vector3(0, -1, 0), sceneObj);
    shadowLight.intensity = 1;
    
    var shadowGenerator = new BABYLON.ShadowGenerator(1024, shadowLight);
    shadowGenerator.useExponentialShadowMap = true;
    shadowGenerator.usePoissonSampling = true;
    shadowGenerator.useBlurExponentialShadowMap = true;


    for ( var i = 0; i < mainMesh._children.length ; i++){
        shadowGenerator.addShadowCaster(mainMesh._children[i]);
    }
    
    
}

/************************************************************/