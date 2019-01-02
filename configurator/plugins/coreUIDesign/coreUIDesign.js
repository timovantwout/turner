var coreUIDesign = function()
{
    //---------------------------------------------------------------------------------------------------------
    //                                  plugin description / tooltip
    //---------------------------------------------------------------------------------------------------------
    
    this.description = 
    {
        "title"   : "UI Design",
        "tooltip" : "Configure basic 2D UI elements"
    };
    
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
    //                                      plugin UI elements
    //---------------------------------------------------------------------------------------------------------
        
    this.uiElements =
    [    
        {
            "type" : "spacing"
        },
        {
            "type"      : "heading",
            "text"      : "Branding"
        },        
        {
            "type"      : "text",
            "text"      : "Configure visibility, image and links for different logos, and drag them around on the canvas."
        },
        {
            "id"          : "coreUIDesign_displayCompanyLogoToggle",
            "type"        : "toggle",
            "initValue"   : true,
            "callback"    : this.displayCompanyLogoToggled,
            "tooltipText" : "Toggles display of the company logo", 
            "labelText"   : "Company Logo"
        },
        {
            "id"          : "coreUIDesign_displayProductLogoToggle",
            "type"        : "toggle",
            "initValue"   : true,
            "callback"    : this.displayProductLogoToggled,
            "tooltipText" : "Toggles display of the product logo", 
            "labelText"   : "Product Logo"
        },
        {
            "id"          : "coreUIDesign_display3DIconToggle",
            "type"        : "toggle",
            "initValue"   : true,
            "callback"    : this.display3DIconToggled,
            "tooltipText" : "Toggles display of the \"3D\" indicator", 
            "labelText"   : "\"3D\" Icon"
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
        var viewer  = turnerVECMain.viewerAPI;
        
        return true;
    }
};

turnerVECMain.plugins.coreUIDesign = new coreUIDesign();
