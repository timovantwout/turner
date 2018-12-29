var turnerVEC = function()
{    
    var that = this;
    
    // variable to store & access the plugin data
    // do not alter the name of this variable - it is used by all the plugins to register themselves
    this.plugins = {};

    // viewer object that is used by all plugins to manipulate the viewer layout and content
    this.viewerAPI = null;
    
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
    }
    
    //---------------------------------------------------------------------------------------------------------
    
    this.addPluginArea = function(pluginName)
    {
        var toolSelectionElem = document.getElementById("toolSelection");
        
        var newPluginAreaButton   = document.createElement("div");
        newPluginAreaButton.classList.add("toolSelectionButton");
        
        toolSelectionElem.appendChild(newPluginAreaButton);
                
        var toolsElem = document.getElementById("tools");
        
        var newPluginArea = document.createElement("div");
        newPluginArea.classList.add("pluginArea");
        newPluginArea.id = "pluginArea_" + pluginName;        
        
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
        var retVal = false;
        
        for (var pluginName in this.plugins)
        {
            if (this.plugins.hasOwnProperty(pluginName))
            {
                // perform plugin-specific initialization
                retVal = this.plugins[pluginName].init();
                
                if (retVal)
                {
                    // add the plugin's main button / icon to the UI
                    this.addPluginArea(pluginName);
                    
                    // populate the plugin's area with its own UI elements
                    this.populatePluginArea(pluginName);
                    
                    console.log("Plugin \"" + pluginName + "\" loaded successfully.");
                }
                else
                {
                    console.error("Error initializing plugin \"" + pluginName + "\".");
                }
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
        
        this.loadPlugins();
        console.log("All plugins loaded.");
    };

    //---------------------------------------------------------------------------------------------------------
    
};

// creates the global variable for the turner virtual experience configurator (turner VEC)
// do not alter the name of this variable - it is used by all the plugins to register themselves,
// and also in the onload callback of the HTML body
var turnerVECMain = new turnerVEC();

