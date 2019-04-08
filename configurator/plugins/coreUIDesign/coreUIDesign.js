var coreUIDesign = function()
{
    //---------------------------------------------------------------------------------------------------------
    //                                  plugin description / tooltip
    //---------------------------------------------------------------------------------------------------------
    
    this.description = 
    {
        "title"   : "UI Design",
        "type"    : "ViewerConfigPlugin",
        "tooltip" : "Configure 2D elements"
    };
    
    //---------------------------------------------------------------------------------------------------------
    //                                        plugin variables
    //---------------------------------------------------------------------------------------------------------

    var that = this;
    
    this.initialCompanyLink        = "http://dgg3d.com";
    this.initialProductLink        = "https://turner3d.org";
    this.backgroundIs3D            = true;
    this.plainBackgroundColor      = "#ffffff";
    this.gradientBackgroundColor1  = "#ffffff";
    this.gradientBackgroundColor2  = "#aaaaaa";

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
        that.backgroundIs3D = event.target.checked;
        var viewer          = turnerVECMain.viewerAPI;
               
        viewer.toggle3DBackground(that.backgroundIs3D);

        //document.getElementById("coreUIDesign_displayBackgroundImageToggle").checked      = false;
        document.getElementById("coreUIDesign_displayGradientBackgroundToggle").checked   = false;
        document.getElementById("coreUIDesign_displayPlainColorBackgroundToggle").checked = false;
                
        viewer.setElementBackground("renderCanvas", "none");
    };
    
    //---------------------------------------------------------------------------------------------------------
    
    this.displayGradientBackgroundToggled = function(event)
    {
        var viewer          = turnerVECMain.viewerAPI;        
        that.backgroundIs3D = false;
        
        viewer.toggle3DBackground(false);
        
        document.getElementById("coreUIDesign_display3DBackgroundToggle").checked         = false;
        //document.getElementById("coreUIDesign_displayBackgroundImageToggle").checked      = false;
        document.getElementById("coreUIDesign_displayPlainColorBackgroundToggle").checked = false;
                
        if (event.target.checked)
        {
            viewer.setElementBackground("renderCanvas", "linear-gradient(" + that.gradientBackgroundColor1 + "," +
                                                                             that.gradientBackgroundColor2 + ")");
        }
        else
        {
            viewer.setElementBackground("renderCanvas", "none");
        }
    };
      
    //---------------------------------------------------------------------------------------------------------

    this.displayPlainColorBackgroundToggled = function(event)
    {
        var viewer          = turnerVECMain.viewerAPI;        
        that.backgroundIs3D = false;
        
        viewer.toggle3DBackground(false);
        
        document.getElementById("coreUIDesign_display3DBackgroundToggle").checked       = false;
        //document.getElementById("coreUIDesign_displayBackgroundImageToggle").checked    = false;
        document.getElementById("coreUIDesign_displayGradientBackgroundToggle").checked = false;
                
        if (event.target.checked)
        {
            viewer.setElementBackground("renderCanvas", that.plainBackgroundColor);
        }
        else
        {
            viewer.setElementBackground("renderCanvas", "none");
        }
    };
    
    //---------------------------------------------------------------------------------------------------------
    
    this.plainColorBackgroundColorChanged = function(event)
    {
        that.plainBackgroundColor = event.target.value;
        
        if (document.getElementById("coreUIDesign_displayPlainColorBackgroundToggle").checked)
        {
            turnerVECMain.viewerAPI.setElementBackground("renderCanvas", that.plainBackgroundColor);
        }
    };

    //---------------------------------------------------------------------------------------------------------
    
    this.gradientBackgroundColor1Changed = function(event)
    {
        that.gradientBackgroundColor1 = event.target.value;
        
        if (document.getElementById("coreUIDesign_displayGradientBackgroundToggle").checked)
        {
            turnerVECMain.viewerAPI.setElementBackground("renderCanvas",
                                        "linear-gradient(" + that.gradientBackgroundColor1 + "," +
                                                             that.gradientBackgroundColor2 + ")");
        }
    };
    
    //---------------------------------------------------------------------------------------------------------
    
    this.gradientBackgroundColor2Changed = function(event)
    {
        that.gradientBackgroundColor2 = event.target.value;
        
        if (document.getElementById("coreUIDesign_displayGradientBackgroundToggle").checked)
        {
            turnerVECMain.viewerAPI.setElementBackground("renderCanvas",
                                        "linear-gradient(" + that.gradientBackgroundColor1 + "," +
                                                             that.gradientBackgroundColor2 + ")");
        }
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
        viewer.setElementLink("company-logo","");
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
        viewer.setElementLink("product-logo","");
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
            "type" : "separator"
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
            "id"          : "coreUIDesign_displayCompanyLogoToggle",
            "type"        : "image-configurator",
            "initValue"   : "images/company-logo.png",
            "callback"    : this.companyLogoChooserTriggered,
            "tooltipText" : "Selects the image to be used for the company logo",
            "labelText"   : "Company Logo Image"
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
            "type" : "separator"
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
            "id"          : "coreUIDesign_productLogoChooser",
            "type"        : "image-configurator",
            "initValue"   : "images/product-logo.png",
            "callback"    : this.productLogoChooserTriggered,
            "tooltipText" : "Selects the image to be used for the product logo",
            "labelText"   : "Product Logo Image"
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
            "type" : "separator"
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
            "id"          : "coreUIDesign_3DIconChooser",
            "type"        : "image-configurator",
            "initValue"   : "images/3d-icon.svg",
            "callback"    : this.three3DIconChooserTriggered,
            "tooltipText" : "Selects the image to be used for the 3D icon",
            "labelText"   : "\"3D\" Icon Image"
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
            "type" : "separator"
        },
        {
            "id"          : "coreUIDesign_display3DBackgroundToggle",
            "type"        : "toggle",
            "initValue"   : true,
            "callback"    : this.display3DBackgroundToggled,
            "tooltipText" : "Toggles display of the 3D scene background", 
            "labelText"   : "3D Scene Background"
        },
        {
            "type" : "separator"
        },
        /*
        {
            "id"          : "coreUIDesign_displayBackgroundImageToggle",
            "type"        : "toggle",
            "initValue"   : false,
            "callback"    : this.displayBackgroundImageToggled,
            "tooltipText" : "Toggles the use of a background image", 
            "labelText"   : "Background Image"
        },
        {
            "type" : "separator"
        },
        */
        {
            "id"          : "coreUIDesign_displayGradientBackgroundToggle",
            "type"        : "toggle",
            "initValue"   : false,
            "callback"    : this.displayGradientBackgroundToggled,
            "tooltipText" : "Toggles use of a gradient background", 
            "labelText"   : "Gradient Background"
        },
        {
            "id"          : "coreUIDesign_gradientBackgroundColor1Input",
            "type"        : "color-choice",
            "initValue"   : this.gradientBackgroundColor1,
            "callback"    : this.gradientBackgroundColor1Changed,
            "tooltipText" : "Configure the top color of a gradient background",
            "labelText"   : "Top Color"
        },
        {
            "id"          : "coreUIDesign_gradientBackgroundColor2Input",
            "type"        : "color-choice",
            "initValue"   : this.gradientBackgroundColor2,
            "callback"    : this.gradientBackgroundColor2Changed,
            "tooltipText" : "Configure the bottom color of a gradient background",
            "labelText"   : "Bottom Color"
        },
        {
            "type" : "separator"
        },
        {
            "id"          : "coreUIDesign_displayPlainColorBackgroundToggle",
            "type"        : "toggle",
            "initValue"   : false,
            "callback"    : this.displayPlainColorBackgroundToggled,
            "tooltipText" : "Toggles the use of a single-color background",
            "labelText"   : "Plain Color Background"
        },
        {
            "id"          : "coreUIDesign_plainColorBackgroundColorInput",
            "type"        : "color-choice",
            "initValue"   : this.plainBackgroundColor,
            "callback"    : this.plainColorBackgroundColorChanged,
            "tooltipText" : "Configure a single color to be used for a simple, plain background",
            "labelText"   : "Background Color"
        },
        {
            "type" : "spacing"
        }
    ];

    //---------------------------------------------------------------------------------------------------------
    
    this.init = function()
    {        
        return true;
    }
    
    //---------------------------------------------------------------------------------------------------------
    
    this.getCustomCSS = function()
    {
        var viewer = turnerVECMain.viewerAPI;
            
        var customCSS = "";
        
        var applyCustomCSS = function(elementID, cssContent)
        {
            var elemCustomCSS = viewer.getElementCustomCSS(elementID, ["background-image"]);
            if (elemCustomCSS != "")
            {
                cssContent += "#" + elementID + "{" + elemCustomCSS + "}";   
            }                                    
            return cssContent;
        };
        
        customCSS = applyCustomCSS("three-d-icon", customCSS);
        customCSS = applyCustomCSS("company-logo", customCSS);
        customCSS = applyCustomCSS("product-logo", customCSS);
        customCSS = applyCustomCSS("renderCanvas", customCSS);
    
        return customCSS;
    }
    
    //---------------------------------------------------------------------------------------------------------
    
    this.getCustomJS = function()
    {
        var viewer = turnerVECMain.viewerAPI;
        
        var jsStr = "";
        
        jsStr += "setElementLink(\"company-logo\", \"" + viewer.getElementLink("company-logo") + "\");\n";
        jsStr += "setElementLink(\"product-logo\", \"" + viewer.getElementLink("product-logo") + "\");\n";
        
        jsStr += "toggle3DBackground(" + (that.backgroundIs3D ? "true" : "false") + ");\n";
        
        // 3d background
        if (that.backgroundIs3D)
        {
            //nothing more to be done here
        }
        // gradient background
        else if (document.getElementById("coreUIDesign_displayGradientBackgroundToggle").checked)
        {
            jsStr += "setElementBackground(\"renderCanvas\"," +
                                        "\"linear-gradient(" + that.gradientBackgroundColor1 + "," +
                                                               that.gradientBackgroundColor2 + "\");";
        }
        // plain background
        else if (document.getElementById("coreUIDesign_displayGradientBackgroundToggle").checked)
        {
            jsStr += "setElementBackground(\"renderCanvas\"," + that.plainBackgroundColor + ");";
        }
        // transparent background
        else
        {
            jsStr += "setElementBackground(\"renderCanvas\", \"none\");";
        }
        
        return jsStr;
    }
    
    //---------------------------------------------------------------------------------------------------------
    
};

turnerVECMain.plugins.coreUIDesign = new coreUIDesign();
