var turnerVEC = function()
{    
    var that = this;
    
    // variable to store & access the plugin data
    // do not alter the name of this variable - it is used by all the plugins to register themselves
    this.plugins = {};

    this.activePlugin = "";
    
    // viewer object that is used by all plugins to manipulate the viewer layout and content
    this.viewerAPI = null;
    
    this.dragStartX     = -1;
    this.dragStartY     = -1;
    this.dragElementID  = "";
    this.dragElemStartX = -1;
    this.dragElemStartY = -1;
    this.guidelineElems = [];
    
    //---------------------------------------------------------------------------------------------------------
    
    this.addPluginArea = function(pluginName)
    {
        var toolSelectionElem = document.getElementById("toolSelection");
        
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
        sliderElem.value    = pluginUIElemObj.initValue;        
        (function(valTextElemID)
        {
            sliderElem.oninput = function(event)
            {
                var valTextElem = document.getElementById(valTextElemID);
                valTextElem.innerHTML = this.value;
                pluginUIElemObj.callback.call(this, event);
            }
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
            case "toggle":
                pluginUIAreaElem.appendChild(this.genToggleSwitchHTML(pluginUIElemObj));
                break;
            case "slider":
                pluginUIAreaElem.appendChild(this.genSliderHTML(pluginUIElemObj));
                break;  
            case "image-selector":
                pluginUIAreaElem.appendChild(this.genImageSelectorHTML(pluginUIElemObj));                
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
        
    this.setActivePlugin = function(pluginName)
    {
        var pluginButtonElem;
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
    };
    
    //---------------------------------------------------------------------------------------------------------
    
    this.getZIPButtonClicked = function()
    {
        var zip = new JSZip();

        //TODO: add the real viewer content,
        //      including the current modifications from this configurator
        zip.file("Hello.txt", "Hello World\n");
        
        zip.generateAsync({type:"blob"})
        .then(function(content) {
            saveAs(content, "turner-viewer.zip");
        });
    };
    
    //---------------------------------------------------------------------------------------------------------
    
    this.toggleViewerSizeButtonClicked = function()
    {
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
        that.stopDragging();
    };
    
    //---------------------------------------------------------------------------------------------------------
    
    this.pointerLeaveCallback = function(event)
    {
        // we could stop dragging here, but we don't
        //instead, we clamp the draggable range to allow "sliding" elements on an edge
    };
    
    //---------------------------------------------------------------------------------------------------------
    
    this.pointerMoveCallback = function(event)
    {
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

};

// creates the global variable for the turner virtual experience configurator (turner VEC)
// do not alter the name of this variable - it is used by all the plugins to register themselves,
// and also in the onload callback of the HTML body
var turnerVECMain = new turnerVEC();

