var sceneObj               = null;
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
            
            var sceneCenter = new BABYLON.Vector3(0,0,0);//bbCenter.multiplyByFloats(scaleFactor, scaleFactor, scaleFactor);
                        
            var refDist       = (0.5 * refScale) / Math.tan(0.5 * camera.fov);
            var cameraInitPos = sceneCenter.add(new BABYLON.Vector3(0,0, refDist));
                        
            camera.setPosition(cameraInitPos);
            camera.setTarget(sceneCenter);
            
            camera.lowerRadiusLimit = refDist * 0.5;
            camera.upperRadiusLimit = refDist * 4.0;
            		
            camera.minZ = camera.lowerRadiusLimit * 0.1;
            camera.maxZ = camera.upperRadiusLimit * 10.0;
			
            camera.wheelPrecision *= 10;
            camera.pinchPrecision *= 10;
                        
            camera.attachControl(canvas, true);   
			
			
			// setup environment
			sceneObj.environmentTexture = new BABYLON.CubeTexture.CreateFromPrefilteredData("images/environment.dds", sceneObj);    
			
			currentSkyboxScale     = 4.0 * camera.upperRadiusLimit;
			currentSkyboxBlurLevel = 0.5;
			
			currentSkybox = sceneObj.createDefaultSkybox(sceneObj.environmentTexture, true, currentSkyboxScale, currentSkyboxBlurLevel);


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
}

/************************************************************/

