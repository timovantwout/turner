var coreUIDesign = function()
{
    //---------------------------------------------------------------------------------------------------------
    //                                  plugin description / tooltip
    //---------------------------------------------------------------------------------------------------------
    
    this.description = 
    {
        "title"   : "UI Design",
        "tooltip" : "Configure 2D elements"
    };
    
    //---------------------------------------------------------------------------------------------------------
    //                                        plugin variables
    //---------------------------------------------------------------------------------------------------------

    this.initialCompanyLink = "http://dgg3d.com";
    this.initialProductLink = "https://dgg3d.github.io/turner/";

    //---------------------------------------------------------------------------------------------------------
    //                                    plugin UI element callbacks
    //---------------------------------------------------------------------------------------------------------
    
    this.displayCompanyLogoToggled = function(event)
    {        
        var toggled = event.target.checked;
        var viewer  = turnerVECMain.viewerAPI;
               
        viewer.toggleElementVisibility("company-logo", toggled);
    };
    
    //---------------------------------------------------------------------------------------------------------
    
    this.displayProductLogoToggled = function(event)
    {        
        var toggled = event.target.checked;
        var viewer  = turnerVECMain.viewerAPI;
               
        viewer.toggleElementVisibility("product-logo", toggled);
    };
    
    //---------------------------------------------------------------------------------------------------------
    
    this.display3DIconToggled = function(event)
    {        
        var toggled = event.target.checked;
        var viewer  = turnerVECMain.viewerAPI;
               
        viewer.toggleElementVisibility("three-d-icon", toggled);
    };
    
    //---------------------------------------------------------------------------------------------------------
    
    this.display3DBackgroundToggled = function(event)
    {        
        var toggled = event.target.checked;
        var viewer  = turnerVECMain.viewerAPI;
               
        viewer.toggle3DBackground(toggled);
    };
      
    //---------------------------------------------------------------------------------------------------------

    this.companyLogoChooserTriggered = function(event, dataURL)
    {   
        var viewer = turnerVECMain.viewerAPI;
        
        viewer.setElementImage("company-logo", dataURL);
        
        // assuming one changes the logo, the link should potentiall be changed as well
        // in order to prevent a case where users accidentally link to the default with their custom logo,
        // simply clear the link on every logo change, for now
        turnerVECMain.setInputElemValue("coreUIDesign_companyLogoLinkInput", "");
    };

    //---------------------------------------------------------------------------------------------------------

    this.productLogoChooserTriggered = function(event, dataURL)
    {        
        var viewer = turnerVECMain.viewerAPI;
        
        viewer.setElementImage("product-logo", dataURL);
        
        // assuming one changes the logo, the link should potentiall be changed as well
        // in order to prevent a case where users accidentally link to the default with their custom logo,
        // simply clear the link on every logo change, for now
        turnerVECMain.setInputElemValue("coreUIDesign_productLogoLinkInput", "");
    };

    //---------------------------------------------------------------------------------------------------------
    
    this.three3DIconChooserTriggered = function(event, dataURL)
    {        
        var viewer = turnerVECMain.viewerAPI;
        
        viewer.setElementImage("three-d-icon", dataURL);
    };
    
     //---------------------------------------------------------------------------------------------------------

    this.companyLogoLinkInputChanged = function(event)
    {   
        var viewer = turnerVECMain.viewerAPI;
        
        viewer.setElementLink("company-logo", event.srcElement.value);
    };
    
    //---------------------------------------------------------------------------------------------------------

    this.productLogoLinkInputChanged = function(event, dataURL)
    {        
        var viewer = turnerVECMain.viewerAPI;
        
        viewer.setElementLink("product-logo", event.srcElement.value);
    };
        
    //---------------------------------------------------------------------------------------------------------
    //                                      plugin UI elements
    //---------------------------------------------------------------------------------------------------------
        
    this.uiElements =
    [    
        {
            "type"      : "heading",
            "text"      : "Branding"
        },        
        {
            "type"      : "text",
            "text"      : "Configure visibility, image and links for different logos, and drag them around on the canvas."
        },
        {
            "id"          : "coreUIDesign_companyLogoChooser",
            "type"        : "toggle",
            "initValue"   : true,
            "callback"    : this.displayCompanyLogoToggled,
            "tooltipText" : "Toggles display of the company logo", 
            "labelText"   : "Show Company Logo"
        },      
        {
            "id"          : "coreUIDesign_displayProductLogoToggle",
            "type"        : "toggle",
            "initValue"   : true,
            "callback"    : this.displayProductLogoToggled,
            "tooltipText" : "Toggles display of the product logo", 
            "labelText"   : "Show Product Logo"
        },
        {
            "id"          : "coreUIDesign_display3DIconToggle",
            "type"        : "toggle",
            "initValue"   : true,
            "callback"    : this.display3DIconToggled,
            "tooltipText" : "Toggles display of the \"3D\" indicator", 
            "labelText"   : "Show \"3D\" Icon"
        },
        {
            "id"          : "coreUIDesign_displayCompanyLogoToggle",
            "type"        : "image-configurator",
            "initValue"   : "images/company-logo.png",
            "callback"    : this.companyLogoChooserTriggered,
            "tooltipText" : "Selects the image to be used for the company logo",
            "labelText"   : "Company Logo Image"
        },
        {
            "id"          : "coreUIDesign_productLogoChooser",
            "type"        : "image-configurator",
            "initValue"   : "images/product-logo.png",
            "callback"    : this.productLogoChooserTriggered,
            "tooltipText" : "Selects the image to be used for the product logo",
            "labelText"   : "Product Logo Image"
        },        
        {
            "id"          : "coreUIDesign_3DIconChooser",
            "type"        : "image-configurator",
            "initValue"   : "images/3d-icon.svg",
            "callback"    : this.three3DIconChooserTriggered,
            "tooltipText" : "Selects the image to be used for the 3D icon",
            "labelText"   : "3D Icon Image"
        },
        {
            "id"          : "coreUIDesign_companyLogoLinkInput",
            "type"        : "text-input",
            "initValue"   : this.initialCompanyLink,
            "callback"    : this.companyLogoLinkInputChanged,
            "tooltipText" : "Configure the link to be used behind the company logo, if any - leave this empty for no link",
            "labelText"   : "Company Logo Link"
        },
        {
            "id"          : "coreUIDesign_productLogoLinkInput",
            "type"        : "text-input",
            "initValue"   : this.initialProductLink,
            "callback"    : this.productLogoLinkInputChanged,
            "tooltipText" : "Configure the link to be used behind the product logo, if any - leave this empty for no link",
            "labelText"   : "Product Logo Link"
        },
        {
            "type" : "spacing"
        },
        {
            "id"   : "coreUIDesign_pageBackgroundSection",
            "type" : "heading",
            "text" : "Page Background"
        },        
        {
            "type"      : "text",
            "text"      : "Configure the canvas background to display 3D scene content, transparent HTML, a single color, a gradient, or an image."
        },
        {
            "id"          : "coreUIDesign_display3DBackgroundToggle",
            "type"        : "toggle",
            "initValue"   : true,
            "callback"    : this.display3DBackgroundToggled,
            "tooltipText" : "Toggles display of the 3D scene background", 
            "labelText"   : "3D Scene Background"
        }
    ];

    //---------------------------------------------------------------------------------------------------------
    
    this.init = function()
    {        
        return true;
    }
};

turnerVECMain.plugins.coreUIDesign = new coreUIDesign();
