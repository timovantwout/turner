var turnerVEC = function()
{    
    var that = this;
    
    // variable to store & access the plugin data
    // do not alter the name of this variable - it is used by all the plugins to register themselves
    this.plugins = {};

    this.pluginCategoryToActivePlugin =
    {
        "ViewerConfigPlugin" : "",
        "ItemConfigPlugin"   : ""
    };
    that.activePlugin = "";
    
    // viewer object that is used by all plugins to manipulate the viewer layout and content
    this.viewerAPI = null;
        
    this.dragStartX     = -1;
    this.dragStartY     = -1;
    this.dragElementID  = "";
    this.dragElemStartX = -1;
    this.dragElemStartY = -1;
    this.guidelineElems = [];
    
    this.zippableDirContent = 
    [    
        {
            name : "turner.custom.css",
            type : "file"
        },
        {
            name : "turner.custom.js",
            type : "file"
        },
        {
            name : "scene.glb",
            type : "file"
        },
        {
            name : "index.html",
            type : "file"
        },
        {
            name : "images",
            type : "directory",
            content :
            [
                {
                    name : "three-d-icon.png",
                    type : "file"
                },
                {
                    name : "company-logo.png",
                    type : "file"
                },
                {
                    name : "product-logo.png",
                    type : "file"
                },
                {
                    name : "environment.dds",
                    type : "file"
                }
            ]
        },
        {
            name : "scripts",
            type : "directory",
            content :
            [
                {
                    name : "babylon.js",
                    type : "file"
                },
                {
                    name : "pep.min.js",
                    type : "file"
                },
                {
                    name : "turner.js",
                    type : "file"
                },
                {
                    name : "babylon.glTF2Serializer.min.js",
                    type : "file"
                }
                
            ]
        }
    ];
    
    //---------------------------------------------------------------------------------------------------------
    
    this.blobToUint8Array = function(blob, callback)
    {
        var fileReader = new FileReader();
        
        fileReader.onload = function(event)
        {
            callback(event.target.result);
        };
        
        fileReader.readAsArrayBuffer(blob);
    };
    
    //---------------------------------------------------------------------------------------------------------
    
    this.contentURLtoUint8Array = function(url, callback)
    {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.responseType = "arraybuffer";

        xhr.onload = function (oEvent)
        {
            var arrayBuffer = xhr.response;
            if (arrayBuffer)
            {
                var byteArray = new Uint8Array(arrayBuffer);
                callback(byteArray);
            }
        };

        xhr.send(null);
    };

    //---------------------------------------------------------------------------------------------------------

    this.downloadFromUint8Array = function(filename, uint8data)
    {
        var blob        = new Blob([uint8data], {type: "application/octet-stream"});
        
        var url         = window.URL.createObjectURL(blob);    
        
        var anchor      = document.createElement("a");
        anchor.href     = url;
        anchor.download = filename;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
    };    

    //---------------------------------------------------------------------------------------------------------
    
    this.addPluginArea = function(pluginName)
    {
        var pluginType = this.plugins[pluginName].description.type
        
        var toolSelectionElem = pluginType == "ViewerConfigPlugin" ?
                                    document.getElementById("toolSelectionViewer") : //type is ViewerConfigPlugin
                                    document.getElementById("toolSelectionItem");    //type is ItemConfigPlugin
        
        var newPluginAreaButton = document.createElement("div");
        newPluginAreaButton.classList.add("toolSelectionButton");
        newPluginAreaButton.id = "plugin-button-" + pluginName;
        newPluginAreaButton.style.backgroundImage = "url('plugins/" + pluginName + "/" + pluginName + ".png')";
        newPluginAreaButton.setAttribute("data-toggle", "tooltip");
        newPluginAreaButton.title = this.plugins[pluginName].description.tooltip;
        
        (function(pName){
            newPluginAreaButton.onclick = function()
            {
                that.setActivePlugin(pName);
            };
        })(pluginName);
        
        toolSelectionElem.appendChild(newPluginAreaButton);
                
        var toolsElem = document.getElementById("tools");
        
        var newPluginArea = document.createElement("div");
        newPluginArea.classList.add("pluginArea");
        newPluginArea.id = "pluginArea_" + pluginName;     

        newPluginArea.style.display = "none";
        
        toolsElem.appendChild(newPluginArea);        
    };
    
    //---------------------------------------------------------------------------------------------------------
    
    this.genSpacingHTML = function(pluginUIElemObj)
    {
        var spacingElem = document.createElement("div");
        spacingElem.classList.add("uiSpacingElemContainer");
        
        return spacingElem;
    };
   
    //---------------------------------------------------------------------------------------------------------
      
    this.genSectionHeadingHTML = function(pluginUIElemObj)
    {
        var outerElem = document.createElement("div");
        outerElem.classList.add("uiHeadingElemContainer");
        
        var headingElem = document.createElement("span");
        
        headingElem.classList.add("section-heading-text");
        headingElem.innerText = pluginUIElemObj.text;
        outerElem.appendChild(headingElem);
        
        return outerElem;
    };
    
    //---------------------------------------------------------------------------------------------------------
    
    this.genExplanationTextHTML = function(pluginUIElemObj)
    {
        var outerElem = document.createElement("div");
        outerElem.classList.add("uiElemContainer");
        
        var textElem = document.createElement("span");
        
        textElem.classList.add("explanation-text");
        textElem.innerText = pluginUIElemObj.text;
        outerElem.appendChild(textElem);
        
        return outerElem;
    };

    //---------------------------------------------------------------------------------------------------------

    this.genTextInputHTML = function(pluginUIElemObj)
    {
        var outerElem = document.createElement("div");
        outerElem.classList.add("uiElemContainer");
        
        var labelTextElem = document.createElement("span");
        var helpElem      = document.createElement("span");
        var switchElem    = document.createElement("label");
        var inputElem     = document.createElement("input");
        
        labelTextElem.classList.add("label-text");
        labelTextElem.innerText = pluginUIElemObj.labelText;
        outerElem.appendChild(labelTextElem);

        helpElem.classList.add("help-button");
        helpElem.setAttribute("data-toggle", "tooltip");
        helpElem.title = pluginUIElemObj.tooltipText;
        outerElem.appendChild(helpElem);
           
        inputElem.classList.add("text-input");
        inputElem.setAttribute("spellcheck", "false");
        inputElem.type     = "text";
        inputElem.id       = pluginUIElemObj.id;
        inputElem.value    = pluginUIElemObj.initValue;
        inputElem.oninput  = pluginUIElemObj.callback;
        outerElem.appendChild(inputElem);
        
        return outerElem;
    };

    //---------------------------------------------------------------------------------------------------------

    this.genToggleSwitchHTML = function(pluginUIElemObj)
    {
        var outerElem = document.createElement("div");
        outerElem.classList.add("uiElemContainer");
        
        var labelTextElem = document.createElement("span");
        var helpElem      = document.createElement("span");
        var switchElem    = document.createElement("label");
        var cbElem        = document.createElement("input");
        var sliderElem    = document.createElement("span");
        
        labelTextElem.classList.add("label-text");
        labelTextElem.innerText = pluginUIElemObj.labelText;
        outerElem.appendChild(labelTextElem);

        helpElem.classList.add("help-button");
        helpElem.setAttribute("data-toggle", "tooltip");
        helpElem.title = pluginUIElemObj.tooltipText;
        outerElem.appendChild(helpElem);
        
        switchElem.classList.add("switch");
        outerElem.appendChild(switchElem);
        
        cbElem.type     = "checkbox";
        cbElem.id       = pluginUIElemObj.id;
        cbElem.checked  = pluginUIElemObj.initValue;
        cbElem.onchange = pluginUIElemObj.callback;
        switchElem.appendChild(cbElem);
        
        sliderElem.classList.add("slider");
        sliderElem.classList.add("round");
        switchElem.appendChild(sliderElem);
        
        return outerElem;
    };

    //---------------------------------------------------------------------------------------------------------

    this.genSliderHTML = function(pluginUIElemObj)
    {
        var outerElem = document.createElement("div");
        outerElem.classList.add("uiElemContainer");
        
        var labelTextElem   = document.createElement("span");
        var helpElem        = document.createElement("span");
        var vsContElem      = document.createElement("span");
        var valTextContElem = document.createElement("span");
        var valTextElem     = document.createElement("span");
        var sliderElem      = document.createElement("input");
        
        labelTextElem.classList.add("label-text");
        labelTextElem.innerText = pluginUIElemObj.labelText;
        outerElem.appendChild(labelTextElem);

        helpElem.classList.add("help-button");
        helpElem.setAttribute("data-toggle", "tooltip");
        helpElem.title = pluginUIElemObj.tooltipText;
        outerElem.appendChild(helpElem);
        
        vsContElem.classList.add("valueslider-container");
        outerElem.appendChild(vsContElem);
        
        valTextElem.id        = pluginUIElemObj.id + "_valueTextElem";
        valTextElem.innerHTML = pluginUIElemObj.initValue
        valTextContElem.appendChild(valTextElem);
        
        valTextContElem.classList.add("valueslider-text");
        vsContElem.appendChild(valTextContElem);
        
        sliderElem.classList.add("valueslider");        
        sliderElem.type     = "range";
        sliderElem.id       = pluginUIElemObj.id;
        sliderElem.min      = pluginUIElemObj.minValue;
        sliderElem.max      = pluginUIElemObj.maxValue;
        sliderElem.step     = pluginUIElemObj.step;
        sliderElem.value    = pluginUIElemObj.initValue;        
        (function(valTextElemID)
        {
            sliderElem.oninput = function(event)
            {                
                var valTextElem = document.getElementById(valTextElemID);
                valTextElem.innerHTML = this.value;
                pluginUIElemObj.callback.call(that, event);
                valTextElem.innerHTML = this.value;
            };
            
            sliderElem.onchange = sliderElem.oninput;            
        })(pluginUIElemObj.id + "_valueTextElem");
        vsContElem.appendChild(sliderElem);
        
        return outerElem;
    };
    
    //---------------------------------------------------------------------------------------------------------
         
    this.genImageSelectorHTML = function(pluginUIElemObj)
    {
        var outerElem = document.createElement("div");        
        outerElem.classList.add("uiElemContainer");
        
        var labelTextElem = document.createElement("span");
        var helpElem      = document.createElement("span");
        var imgCContainer = document.createElement("div");
        
        labelTextElem.classList.add("label-text");
        labelTextElem.innerText = pluginUIElemObj.labelText;
        outerElem.appendChild(labelTextElem);

        helpElem.classList.add("help-button");
        helpElem.setAttribute("data-toggle", "tooltip");
        helpElem.title = pluginUIElemObj.tooltipText;
        outerElem.appendChild(helpElem);
        
        outerElem.appendChild(document.createElement("br"));
        
        imgCContainer.classList.add("imagecollection-container");
        imgCContainer.classList.add("clearfix");
        imgCContainer.id = pluginUIElemObj.id;
        outerElem.appendChild(imgCContainer);

        var collectionElems = pluginUIElemObj.content;

        var imageCElem;
        var imageLElem;
        var i = 0;
        var initialSelectionElem = null;
        for (; i < collectionElems.length; ++i)
        {
            imageCElem = document.createElement("div");
            imageCElem.classList.add("imagecollection-element");
            imageCElem.style.backgroundImage = "url('" + collectionElems[i].url + "')";
            imageCElem.id = imgCContainer.id + "_" + collectionElems[i].name;
            imgCContainer.appendChild(imageCElem);
            
            (function(rootID, selectedID, selectedName, callback){
                imageCElem.onclick =  function()
                {                    
                    var oldActiveElem = document.querySelector("#" + rootID + " > .imagecollection-activeelement");
                    oldActiveElem.classList.remove("imagecollection-activeelement");
                    
                    var newActiveElem = document.querySelector("#" + rootID + " > #" + selectedID);
                    newActiveElem.classList.add("imagecollection-activeelement");       
                    
                    callback.call(newActiveElem, selectedName);
                };
            })(imgCContainer.id, imageCElem.id, collectionElems[i].name, pluginUIElemObj.callback);
            
            imageLElem = document.createElement("div");
            imageLElem.classList.add("imagecollection-elementlabel");
            imageLElem.innerHTML = collectionElems[i].displayName;
            imageCElem.appendChild(imageLElem);
            
            // activate first element by default, check for specified element
            if (i == 0 || collectionElems[i].name == pluginUIElemObj.initialSelection)
            {
                imageCElem.classList.add("imagecollection-activeelement");                
                if (initialSelectionElem)
                {
                    initialSelectionElem.classList.remove("imagecollection-activeelement");
                }            
                initialSelectionElem = imageCElem;
            }
        }
                       
        return outerElem;
    };
    
    //---------------------------------------------------------------------------------------------------------
    
    this.genImageConfiguratorHTML = function(pluginUIElemObj)
    {        
        var outerElem = document.createElement("div");        
        outerElem.classList.add("uiElemContainer");
        
        var labelTextElem      = document.createElement("span");
        var helpElem           = document.createElement("span");
        var imgCContainer      = document.createElement("div");        
        var buttonElem         = document.createElement("label");
        var invisibleFileInput = document.createElement("input");
        
        labelTextElem.classList.add("label-text");
        labelTextElem.innerText = pluginUIElemObj.labelText;
        outerElem.appendChild(labelTextElem);

        helpElem.classList.add("help-button");
        helpElem.setAttribute("data-toggle", "tooltip");
        helpElem.title = pluginUIElemObj.tooltipText;
        outerElem.appendChild(helpElem);
        
        buttonElem.classList.add("browse-button");        
        buttonElem.type      = "button";
        buttonElem.innerText = "Browse ...";
        buttonElem.id        = pluginUIElemObj.id;
        buttonElem.checked   = pluginUIElemObj.initValue;        
        outerElem.appendChild(buttonElem);
        
        invisibleFileInput.style.display = "none";
        invisibleFileInput.type          = "file";
        invisibleFileInput.accept        = "image/gif, image/jpeg, image/png";
        (function(buttonElemID)
        {
            invisibleFileInput.onchange = function(event)
            {
                var reader = new FileReader();
                reader.onload = function(e)
                {                    
                    var imgDataURL = e.target.result;
                    
                    // Here, we could access some element to show a thumbnail and / or a text (filename)
                    //var buttonElem = document.getElementById(buttonElemID);
                    //...                                
                    //var fileBrowserVal = event.srcElement.value.replace("C:\\fakepath\\", "");
                
                    pluginUIElemObj.callback.call(that, event, imgDataURL);                    
                };                
                reader.readAsDataURL(event.srcElement.files[0]);
            }
        })(pluginUIElemObj.id);
        buttonElem.appendChild(invisibleFileInput);        
        
        return outerElem;
    }    
    
    //---------------------------------------------------------------------------------------------------------
    
    this.addPluginUIElement = function(pluginUIElemObj, pluginUIAreaElem)
    {
        switch (pluginUIElemObj.type)
        {
            case "spacing":
                pluginUIAreaElem.appendChild(this.genSpacingHTML(pluginUIElemObj));
                break;
            case "heading":
                pluginUIAreaElem.appendChild(this.genSectionHeadingHTML(pluginUIElemObj));
                break;
            case "text":
                pluginUIAreaElem.appendChild(this.genExplanationTextHTML(pluginUIElemObj));
                break;
            case "text-input":
                pluginUIAreaElem.appendChild(this.genTextInputHTML(pluginUIElemObj));
                break;                
            case "toggle":
                pluginUIAreaElem.appendChild(this.genToggleSwitchHTML(pluginUIElemObj));
                break;
            case "slider":
                pluginUIAreaElem.appendChild(this.genSliderHTML(pluginUIElemObj));
                break;  
            case "image-selector":
                pluginUIAreaElem.appendChild(this.genImageSelectorHTML(pluginUIElemObj));                
                break;
            case "image-configurator":
                pluginUIAreaElem.appendChild(this.genImageConfiguratorHTML(pluginUIElemObj));                
                break;                
            default:
                console.error("Plugin UI element type \"" + pluginUIElemObj.type + "\" is not a known type.");
                break;
        }
    };

    //---------------------------------------------------------------------------------------------------------

    this.populatePluginArea = function(pluginName)
    {
        var plugin           = this.plugins[pluginName];    
        var pluginUIAreaElem = document.getElementById("pluginArea_" + pluginName);         
        var pluginUIElemObjs = plugin.uiElements;
        var i;
        
        for (i = 0; i < pluginUIElemObjs.length; ++i)
        {
            this.addPluginUIElement(pluginUIElemObjs[i], pluginUIAreaElem);
        }
    };

    //---------------------------------------------------------------------------------------------------------

    this.loadPlugins = function()
    {
        for (var pluginName in this.plugins)
        {
            if (this.plugins.hasOwnProperty(pluginName))
            {
                (function(piName)
                {
                    that.viewerAPI.addIsReadyCallback(function(){
                        // perform plugin-specific initialization
                        var retVal = that.plugins[piName].init();    
                        if (retVal)
                        {   
                            console.log("Plugin \"" + piName + "\" loaded successfully.");
                        }
                        else
                        {
                            console.error("Error initializing plugin \"" + piName + "\".");
                        }                
                    });
                })(pluginName);
                
                // add the plugin's main button / icon to the UI
                this.addPluginArea(pluginName);
                
                // populate the plugin's area with its own UI elements
                this.populatePluginArea(pluginName);
            }
        }
    };

    //---------------------------------------------------------------------------------------------------------

    this.init = function()
    {
        var viewerVersion = "1.0";
        console.log("This is the turner virtual experience configurator, using turner " + viewerVersion);
        
        var viewerFrame  = document.getElementById('viewer')
        var frameContent = (viewer.contentWindow || viewer.contentDocument);
        this.viewerAPI   = frameContent;
        
        if (this.viewerAPI == null)
        {
            console.error("Unable to connect to viewer.");
            return;
        }
        console.log("Turner viewer connected.");        
        
        // add callbacks for dragging / clicks on 2D UI elements
        this.viewerAPI.addElementPointerDownCallback("company-logo", this.elementPointerDownCallback);
        this.viewerAPI.addElementPointerDownCallback("product-logo", this.elementPointerDownCallback);
        this.viewerAPI.addElementPointerDownCallback("three-d-icon",      this.elementPointerDownCallback);
        this.viewerAPI.addPointerUpCallback(this.pointerUpCallback);
        this.viewerAPI.addPointerMoveCallback(this.pointerMoveCallback);
        
        viewerFrame.addEventListener("pointerout", this.pointerLeaveCallback);  
                        
        this.guidelineElems.push(document.getElementById("mainGuidelineH0"));
        this.guidelineElems.push(document.getElementById("mainGuidelineV0"));       
        this.guidelineElems.push(document.getElementById("mainGuidelineH1"));        
        this.guidelineElems.push(document.getElementById("mainGuidelineV1"));        
        
        // load plugins        
        this.loadPlugins();
        console.log("All plugins loaded.");
        
        // tooltips need extra initialization
        $(document).ready(function(){
            $('[data-toggle="tooltip"]').tooltip(); 
        });
        
        // activate the first plugin
        for (var pluginName in this.plugins)
        {
            if (this.plugins.hasOwnProperty(pluginName))
            {
                this.setActivePlugin(pluginName);
                break;
            }
        }
        
        // disable viewer buttons (edit mode)
        this.viewerAPI.toggleButtons(false);
    };
    
    //---------------------------------------------------------------------------------------------------------
   
    this.setInputElemValue = function(elementID, value)
    {    
        var elem = document.getElementById(elementID);
        
        if (!elem)
        {
            console.error("Cannot find element with ID \"" + elementID + "\".");
            return;
        }
     
        elem.value = value;
    };
    
    //---------------------------------------------------------------------------------------------------------
    
    this.triggerOnChangeEvent = function(elementID)
    {
        var elem = document.getElementById(elementID);
        
        if (!elem)
        {
            console.error("Cannot find element with ID \"" + elementID + "\".");
            return;
        }
        
        if ("createEvent" in document)
        {
            var evt = document.createEvent("HTMLEvents");
            evt.initEvent("change", false, true);            
            elem.dispatchEvent(evt);
        }
        else
        {
            elem.fireEvent("onchange");
        }       
    };
    
    //---------------------------------------------------------------------------------------------------------
    
    this.stopDragging = function()
    {      
        if (this.dragElementID == "")
        {
            return;
        }
        
        this.dragElementID = "";  
                
        var i = 0;
        for (; i < this.guidelineElems.length; ++i)
        {
            this.guidelineElems[i].style.visibility = "hidden";
        }
    };
    
    //---------------------------------------------------------------------------------------------------------
    
    this.positionGuidelines = function(pv0, ph0, pv1, ph1,
                                       ce)
    {
        var glH0 = this.guidelineElems[0];
        var glV0 = this.guidelineElems[1];
        var glH1 = this.guidelineElems[2];
        var glV1 = this.guidelineElems[3];
        
        glV0.style.left = pv0 + "px";
        glV0.style.top  = 0;
        
        glH0.style.left = 0;
        glH0.style.top  = ph0 + "px";
        
        glV1.style.left = pv1 + "px";
        glV1.style.top  = 0;
        
        glH1.style.left = 0;
        glH1.style.top  = ph1 + "px";
    };
    
    //---------------------------------------------------------------------------------------------------------
    //                                      callback functions
    //---------------------------------------------------------------------------------------------------------

    this.configModeButtonClicked = function(elemID)
    {
        var buttonID      = (elemID   == "toolSelectionViewer" ? "viewerConfigButton" : "itemConfigButton");
        var otherButtonID = (buttonID == "viewerConfigButton"  ? "itemConfigButton"   : "viewerConfigButton");
        
        var activatedButtonStyle   = (elemID               == "toolSelectionViewer"          ? "vecToolsButtonAlt1-triggered" : "vecToolsButtonAlt2-triggered");
        var deactivatedButtonStyle = (activatedButtonStyle == "vecToolsButtonAlt1-triggered" ? "vecToolsButtonAlt2-triggered" : "vecToolsButtonAlt1-triggered");
        
        document.getElementById(buttonID     ).classList.add(     activatedButtonStyle);
        document.getElementById(otherButtonID).classList.remove(deactivatedButtonStyle);

        var otherElemID = (elemID == "toolSelectionViewer" ? "toolSelectionItem" : "toolSelectionViewer");
        
        var activatedElem   = document.getElementById(elemID);
        var deactivatedElem = document.getElementById(otherElemID);
        
        activatedElem.style.display   = "inherit";
        deactivatedElem.style.display = "none";
        
        var activeCategory = (elemID == "toolSelectionViewer" ? "ViewerConfigPlugin" : "ItemConfigPlugin");
        
        var firstOrActivePluginName = that.pluginCategoryToActivePlugin[activeCategory];
        var plugin                  = null;
                
        if (firstOrActivePluginName == "")
        {
            for (var pName in that.plugins)
            {     
                if (that.plugins.hasOwnProperty(pName))
                {
                    plugin = that.plugins[pName];                
                    if  (plugin.description.type == activeCategory)
                    {
                        firstOrActivePluginName = pName;
                        break;
                    }                    
                }
            }
        }
        
        that.setActivePlugin(firstOrActivePluginName);
    };

    //---------------------------------------------------------------------------------------------------------

    this.setActivePlugin = function(pluginName)
    {
        if (pluginName == "")
        {
            return; //setting the active plugin to empty string after startup is not covered
        }
        
        var pluginType = "";
        var plugin     = null;
        
        for (var pName in that.plugins)
        {     
            if (that.plugins.hasOwnProperty(pName) &&
                pName == pluginName                       )
            {              
                plugin = that.plugins[pName];                
                if  (plugin.description.type == "ViewerConfigPlugin" ||
                     plugin.description.type == "ItemConfigPlugin"     )
                {
                    pluginType = plugin.description.type;                    
                }
                break;
            }
        }
        
        if (pluginType == "")
        {
            console.error("Unable to activate plugin \"" + pluginName + "\", no valid plugin type found.");
            return;
        }
                
        var pluginAreaElem;
        
        if (that.activePlugin != "")
        {
            pluginButtonElem = document.getElementById("plugin-button-" + that.activePlugin);
            pluginButtonElem.classList.remove("activeToolButton");

            pluginAreaElem = document.getElementById("pluginArea_" + that.activePlugin);
            pluginAreaElem.style.display = "none";
        }
        
        pluginButtonElem = document.getElementById("plugin-button-" + pluginName);
        pluginButtonElem.classList.add("activeToolButton");

        pluginAreaElem = document.getElementById("pluginArea_" + pluginName);
        pluginAreaElem.style.display = "";

        that.activePlugin = pluginName;
        that.pluginCategoryToActivePlugin[pluginType] = pluginName;
    };
    
    //---------------------------------------------------------------------------------------------------------
    
    this.downloadButtonClicked = function()
    {
        var radioButtons = document.getElementsByName("export-choice");
        
        var exportChoice = "all";
        
        for (var i = 0; i < radioButtons.length; ++i)
        {
            if (radioButtons[i].checked)
            {
                exportChoice = radioButtons[i].value;
                break;
            }
        }
        
        var zipReadyCallback = function(content)
        {
            saveAs(content, "turner-viewer.zip");    
        };    
        
        switch (exportChoice)
        {
            default:
            case "all":
                getSceneAsZIP(zipReadyCallback, true);
                break;
            case "viewer":
                getSceneAsZIP(zipReadyCallback, false);
                break;
            case "item":
                getModelAsGLBUint8Array(function(uint8Array)
                {
                    that.downloadFromUint8Array("scene.glb", uint8Array);
                });
                break;
        }        
    };
    
    //---------------------------------------------------------------------------------------------------------
    
    this.toggleDemoModeButtonClicked = function()
    {
        var demoModeButtonElem  = document.getElementById('demoModeButton');
        var controlsOverlayElem = document.getElementById('controls-disabled-overlay');
        
        if (demoModeButtonElem.classList.contains("vecToolsButton-triggered"))
        {
            demoModeButtonElem.classList.remove("vecToolsButton-triggered");    
        
            // going to edit mode        
            that.viewerAPI.toggleButtons(false);            
            controlsOverlayElem.style.visibility = "hidden";
        }        
        else
        {
            demoModeButtonElem.classList.add("vecToolsButton-triggered");
         
            // going to demo mode         
            that.viewerAPI.toggleButtons(true);
            controlsOverlayElem.style.visibility = "visible";
        }        
    };
    
    //---------------------------------------------------------------------------------------------------------
    
    this.toggleViewerSizeButtonClicked = function()
    {
        var resizeModeButtonElem = document.getElementById('resizeViewerButton');
        
        if (resizeModeButtonElem.classList.contains("vecToolsButton-triggered"))
        {
            resizeModeButtonElem.classList.remove("vecToolsButton-triggered");    
        }
        else
        {
            resizeModeButtonElem.classList.add("vecToolsButton-triggered");
        }        
        
        var viewerWrapElem = document.getElementById('viewer-frame-wrapper');
        var viewerElem     = document.getElementById('viewer');
        var labelElem      = document.getElementById('resizeViewerButtonLabel');
        
        // go to shrinked view mode
        if (viewerWrapElem.style.top == "")
        {
            viewerWrapElem.style.position  = "absolute";
            viewerWrapElem.style.top       = "50%";
            viewerWrapElem.style.left      = "50%";
            viewerWrapElem.style.transform = "translate(-50%, -50%)";
            viewerWrapElem.style.border    = "1px dashed #333";
            
            viewerWrapElem.style.width  = "auto";
            viewerWrapElem.style.height = "auto";
            
            viewerElem.style.width  = "300px";
            viewerElem.style.height = "300px";
            viewerElem.style.resize = "both";
            
            // we could change the button text here, if desired
            //labelElem.innerText = "Max. View";
        }
        // go to maximized view mode
        else
        {
            viewerWrapElem.style.position  = "";
            viewerWrapElem.style.top       = "";
            viewerWrapElem.style.left      = "";
            viewerWrapElem.style.transform = "";
            viewerWrapElem.style.border    = "";
            
            viewerWrapElem.style.width  = "";
            viewerWrapElem.style.height = "";
            
            viewerElem.style.width  = "";
            viewerElem.style.height = "";
            viewerElem.style.resize = "";
            
            // we could change the button text here, if desired
            //labelElem.innerText = "Shrink View";
        }
    };
    
    //---------------------------------------------------------------------------------------------------------
    
    this.elementPointerDownCallback = function(event)
    {
        var demoModeButtonElem  = document.getElementById('demoModeButton');        
        var inDemoMode          = demoModeButtonElem.classList.contains("vecToolsButton-triggered");
        if (inDemoMode)
        {
            return;
        }
        
        that.stopDragging();
                
        that.dragStartX = event.screenX;
        that.dragStartY = event.screenY;
        
        that.dragElementID  = this.id;
        that.dragElemStartX = that.viewerAPI.getElementPosX(this.id);
        that.dragElemStartY = that.viewerAPI.getElementPosY(this.id);
        
        var i = 0;        
        for (; i < that.guidelineElems.length; ++i)
        {
            that.guidelineElems[i].style.visibility = "visible";
        }
        
        var elemW = that.viewerAPI.getElementWidth(that.dragElementID);
        var elemH = that.viewerAPI.getElementHeight(that.dragElementID);
        
        that.positionGuidelines(that.dragElemStartX,         that.dragElemStartY,
                                that.dragElemStartX + elemW, that.dragElemStartY + elemH);
    };
    
    //---------------------------------------------------------------------------------------------------------
    
    this.pointerUpCallback = function(event)
    {
        var demoModeButtonElem  = document.getElementById('demoModeButton');        
        var inDemoMode          = demoModeButtonElem.classList.contains("vecToolsButton-triggered");
        if (inDemoMode)
        {
            return;
        }
        
        that.stopDragging();
    };
    
    //---------------------------------------------------------------------------------------------------------
    
    this.pointerLeaveCallback = function(event)
    {
        var demoModeButtonElem  = document.getElementById('demoModeButton');        
        var inDemoMode          = demoModeButtonElem.classList.contains("vecToolsButton-triggered");
        if (inDemoMode)
        {
            return;
        }
        
        // we could stop dragging here, but we don't
        //instead, we clamp the draggable range to allow "sliding" elements on an edge
    };
    
    //---------------------------------------------------------------------------------------------------------
    
    this.pointerMoveCallback = function(event)
    {
        var demoModeButtonElem  = document.getElementById('demoModeButton');        
        var inDemoMode          = demoModeButtonElem.classList.contains("vecToolsButton-triggered");
        if (inDemoMode)
        {
            return;
        }
        
        if (that.dragElementID == "")
        {
            return;
        }
                            
        var dragDiffX = event.screenX - that.dragStartX;
        var dragDiffY = event.screenY - that.dragStartY;
                      
        var newPosX = that.dragElemStartX + dragDiffX;
        var newPosY = that.dragElemStartY + dragDiffY;
        
        var elemW = that.viewerAPI.getElementWidth(that.dragElementID);
        var elemH = that.viewerAPI.getElementHeight(that.dragElementID);

        var viewerW = that.viewerAPI.getViewerWidth();
        var viewerH = that.viewerAPI.getViewerHeight();

        // clamp to keep the element fully inside the viewer        
        newPosX = Math.max(newPosX, 0);
        newPosY = Math.max(newPosY, 0);
        newPosX = Math.min(newPosX, viewerW - elemW);
        newPosY = Math.min(newPosY, viewerH - elemH);
        
        var hOffset   = newPosX;
        var vOffset   = newPosY;
        var hBoundary = "left";
        var vBoundary = "top";
        
        // always position element w.r.t. to the closest boundary
        if (newPosX + 0.5 * elemW >= 0.5 * viewerW)
        {
            hOffset   = viewerW - (newPosX + elemW);
            hBoundary = "right";
        }
                
        if (newPosY + 0.5 * elemH >= 0.5 * viewerH)
        {
            vOffset   = viewerH - (newPosY + elemH);
            vBoundary = "bottom";
        }
        
        that.viewerAPI.setElementPosition(that.dragElementID,
                                          hBoundary, vBoundary,
                                          hOffset + "px", vOffset + "px");

        that.positionGuidelines(newPosX,         newPosY,
                                newPosX + elemW, newPosY + elemH);
    };

    //---------------------------------------------------------------------------------------------------------

    this.modelSelectionButtonClicked = function(event)
    {
        that.viewerAPI.setModelFromFile(event.srcElement.files[0]);
    };
    
    //---------------------------------------------------------------------------------------------------------
    
};

// creates the global variable for the turner virtual experience configurator (turner VEC)
// do not alter the name of this variable - it is used by all the plugins to register themselves,
// and also in the onload callback of the HTML body
var turnerVECMain = new turnerVEC();


/************************************************************/
/********************* CONFIGURATOR API *********************/
/************************************************************/

/**
 * Stores the current viewer as a ZIP file.
 * Optionally, the 3D model file can be included as well.
 */
 var getSceneAsZIP = function(zipReadyCallback, include3DModel)
 {
    var zip = new JSZip();
        
    var fileCount = 0;
    
    // callback to be invoked for each added file
    // as soon as all files have been added, create & download the ZIP
    var fileAddedToZIP = function()
    {
        --fileCount;            
        
        if (fileCount == 0)
        {
            zip.generateAsync({type:"blob"}).then(function(content)
            {
                zipReadyCallback(content);
            });   
        }            
    };
    
    // collect css and js customizations from all plugins
    var turnerCustomCSS = "";
    var turnerCustomJS  = "addIsReadyCallback(function(){\n\n";
    
    for (var pluginName in turnerVECMain.plugins)
    {
        if (turnerVECMain.plugins.hasOwnProperty(pluginName))
        {
            turnerCustomCSS += turnerVECMain.plugins[pluginName].getCustomCSS();
            turnerCustomJS  += turnerVECMain.plugins[pluginName].getCustomJS();
        }
    }

    turnerCustomJS += "\n});\n";

    // callback that adds a file download, asynchronously,
    // and makes sure "fileAddedToZIP" is called as soon as the download is finished
    var addFileDownloadCallback = function(filename, path)
    {
        var fullFilename = path + "/" + filename;
        
        // special cases
        if (filename == "three-d-icon.png" ||
            filename == "company-logo.png" ||
            filename == "product-logo.png"   )
        {                
            var filenameWithoutExtension = filename.split(".")[0];
            var customURL                = turnerVECMain.viewerAPI.getElementImageCustomURL(filenameWithoutExtension);
            
            if (customURL != "")
            {
                // we know that custom data is always converted to PNG
                turnerVECMain.contentURLtoUint8Array(customURL,
                    function(uint8Data)
                    {
                        zip.file(fullFilename, uint8Data);
                        fileAddedToZIP();
                    }
                );                    
                return;
            }
        }
        else if (filename == "turner.custom.css" ||
                 filename == "turner.custom.js"    )
        {
            return;
        }
        else if (filename == "environment.dds")
        {
            var customEnvURL = turnerVECMain.viewerAPI.getEnvironmentMapCustomURL();
            
            if (customEnvURL != "")
            {
                // we know that custom environments are always given as DDS
                turnerVECMain.contentURLtoUint8Array(customEnvURL,
                    function(uint8Data)
                    {
                        zip.file(fullFilename, uint8Data);
                        fileAddedToZIP();
                    }
                );                    
                return;
            }
        }
        else if (filename == "scene.glb")
        {
            if (include3DModel)
            {                
                getModelAsGLBUint8Array(function(uint8Data){
                    zip.file(fullFilename, uint8Data);
                    fileAddedToZIP();
                });                
            }            
            return;
        }
                    
        // general case            
        turnerVECMain.contentURLtoUint8Array("../viewer/" + fullFilename,
            function(uint8Data)
            {
                zip.file(fullFilename, uint8Data);
                fileAddedToZIP();
            }
        );
    };
    // callback that can simply be used to count files
    var countFile = function(filename, path)
    {
        ++fileCount;
    };
    
    // function that recursively walks over the directory content list and invokes the given function for each file
    var addDirectoryContent = function(contentList, basePath, processFileCallback)
    {
        for (var i = 0; i < contentList.length; ++i)
        {
            var elem = contentList[i];
            
            if (elem.type == "file")
            {
                if (!include3DModel && elem.name == "scene.glb")
                {
                    continue;
                }                
                processFileCallback(elem.name, basePath);
            }
            else if (elem.type == "directory")
            {
                addDirectoryContent(elem.content, basePath + elem.name, processFileCallback);
            }
        }
    };

    // count files
    addDirectoryContent(turnerVECMain.zippableDirContent, "", countFile);

    // asynchronously add files to zip, except for turner.custom.css/js
    addDirectoryContent(turnerVECMain.zippableDirContent, "", addFileDownloadCallback);
    
    // asynchronously add  turner.custom.css/js and download result when complete
    zip.file("turner.custom.css", turnerCustomCSS);
    fileAddedToZIP();        
    zip.file("turner.custom.js",  turnerCustomJS);
    fileAddedToZIP();
 };

/************************************************************/

/**
 * Stores the current viewer as a ZIP file.
 * Optionally, the 3D model file can be included as well.
 */
var getModelAsGLBUint8Array = function(callback)
{
    // if the model has been manipulated during runtime,
    // we have to use the BabylonJS .glb exporter
    if (!turnerVECMain.viewerAPI.itemIsUnchanged())
    {   
        turnerVECMain.viewerAPI.getItemAsGLBBlob(function(glbBlob)
        {
            turnerVECMain.blobToUint8Array(glbBlob, function(uint8Array)
            {
                callback(uint8Array);
            });
        });
    }
    // if there were no changes to the model, simply use the existing file
    else
    {        
        var customModelURL = turnerVECMain.viewerAPI.getCustomModelFileURL();
        
        // unaltered non-default model file
        if (customModelURL != "")
        {            
            turnerVECMain.contentURLtoUint8Array(customModelURL, callback);
        }
        // unaltered default model file
        else
        {
            turnerVECMain.contentURLtoUint8Array("../viewer/scene.glb", callback);
        }
    }
};
