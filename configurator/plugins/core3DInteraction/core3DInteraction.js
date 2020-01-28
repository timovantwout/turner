

var core3DInteraction = function()
{
    //---------------------------------------------------------------------------------------------------------
    //                                  plugin description / tooltip
    //---------------------------------------------------------------------------------------------------------
    
    this.description = 
    {
        "title"   : "3D Interaction",
        "type"    : "ViewerConfigPlugin",
        "tooltip" : "Configure 3D interaction"
    };
    
    //---------------------------------------------------------------------------------------------------------
    //                                        plugin variables
    //---------------------------------------------------------------------------------------------------------
    
    var that = this;
    
    this.minCameraAngleDeg  = -90.0;
    this.maxCameraAngleDeg  =  90.0;
    this.minZoomFactor      =   3.0;
    this.maxZoomFactor      =   6.0;
    this.panningSensitivity =   0.5;
    
    //---------------------------------------------------------------------------------------------------------
    //                                    plugin UI element callbacks
    //---------------------------------------------------------------------------------------------------------

    this.minCameraAngleSliderToggled = function(event)
    {
        var v = parseFloat(event.srcElement.value);
        
        if (v > that.maxCameraAngleDeg)
        {
            v = that.maxCameraAngleDeg;
            event.srcElement.value = v;
        }
        
        that.minCameraAngleDeg = v;
        
        var viewer = turnerVECMain.viewerAPI;        
        viewer.setMinVerticalCameraAngle(that.minCameraAngleDeg);
    };
    
    //---------------------------------------------------------------------------------------------------------
    
    this.maxCameraAngleSliderToggled = function(event)
    {
        var v = parseFloat(event.srcElement.value);
        
        if (v < that.minCameraAngleDeg)
        {
            v = that.minCameraAngleDeg;
            event.srcElement.value = v;
        }
        
        that.maxCameraAngleDeg = v;
        
        var viewer = turnerVECMain.viewerAPI;        
        viewer.setMaxVerticalCameraAngle(that.maxCameraAngleDeg);
    };

    //---------------------------------------------------------------------------------------------------------
    
    this.minZoomFactorSliderToggled = function(event)
    {
        var v = parseFloat(event.srcElement.value);
        
        if (v > that.maxZoomFactor)
        {
            v = that.maxZoomFactor;
            event.srcElement.value = v;
        }
        
        that.minZoomFactor = v;
        
        var viewer = turnerVECMain.viewerAPI;        
        viewer.setMinZoomFactor(that.minZoomFactor);
    };
    
    //---------------------------------------------------------------------------------------------------------
    
    this.maxZoomFactorSliderToggled = function(event)
    {
        var v = parseFloat(event.srcElement.value);
        
        if (v < that.minZoomFactor)
        {
            v = that.minZoomFactor;
            event.srcElement.value = v;
        }
        
        that.maxZoomFactor = v;
        
        var viewer = turnerVECMain.viewerAPI;        
        viewer.setMaxZoomFactor(that.maxZoomFactor);
    };
    
    //---------------------------------------------------------------------------------------------------------
    
    this.panningSensitivitySliderToggled = function(event)
    {
        var v = parseFloat(event.srcElement.value);
        v = Math.max(Math.min(v, 1.0), 0.0);
        
        that.panningSensitivity = v;
        
        var viewer = turnerVECMain.viewerAPI;        
        viewer.setPanningSensitivity(that.panningSensitivity);
    };
    
     //---------------------------------------------------------------------------------------------------------
    
    this.measurementsToggled = function(event)
    {
        var toggled = event.target.checked;
        var viewer  = turnerVECMain.viewerAPI;
        
        viewer.toggleElementVisibility("measurement-button", toggled);     
    }

    //---------------------------------------------------------------------------------------------------------
    //                                      plugin UI elements
    //---------------------------------------------------------------------------------------------------------

    this.uiElements =
    [    
        {
            "type"      : "heading",
            "text"      : "Camera Angles"
        },      
        {
            "type"      : "text",
            "text"      : "Set minimum and maximum vertical camera angles."
        },
        {
            "id"          : "core3DInteraction_minCameraAngleSlider",
            "type"        : "slider",
            "minValue"    : -90.0,
            "maxValue"    : 90.0,
            "step"        : 1.0,
            "initValue"   : this.minCameraAngleDeg,
            "callback"    : this.minCameraAngleSliderToggled,
            "tooltipText" : "Specifies the minimum vertical camera angle, in degrees", 
            "labelText"   : "Minimum Angle"
        },
        {
            "id"          : "core3DInteraction_maxCameraAngleSlider",
            "type"        : "slider",
            "minValue"    : -90.0,
            "maxValue"    : 90.0,
            "step"        : 1.0,
            "initValue"   : this.maxCameraAngleDeg,
            "callback"    : this.maxCameraAngleSliderToggled,
            "tooltipText" : "Specifies the maximum vertical camera angle, in degrees", 
            "labelText"   : "Maximum Angle"
        },
        {
            "type"      : "heading",
            "text"      : "Zooming"
        },      
        {
            "type"      : "text",
            "text"      : "Set minimum and maximum zoom factor (same value for both disables zooming)."
        },
        {
            "id"          : "core3DInteraction_minZoomFactorSlider",
            "type"        : "slider",
            "minValue"    : 1.0,
            "maxValue"    : 10.0,
            "step"        : 1.0,
            "initValue"   : this.minZoomFactor,
            "callback"    : this.minZoomFactorSliderToggled,
            "tooltipText" : "Specifies the camera's minimum zoom level", 
            "labelText"   : "Minimum Zoom"
        },
        {
            "id"          : "core3DInteraction_maxZoomFactorSlider",
            "type"        : "slider",
            "minValue"    : 1.0,
            "maxValue"    : 10.0,
            "step"        : 1.0,
            "initValue"   : this.maxZoomFactor,
            "callback"    : this.maxZoomFactorSliderToggled,
            "tooltipText" : "Specifies the camera's maximum zoom level", 
            "labelText"   : "Maximum Zoom"
        },
        {
            "type"      : "heading",
            "text"      : "Panning"
        },      
        {
            "type"      : "text",
            "text"      : "Set panning sensitivity (a value of zero disables panning)."
        },
        {
            "id"          : "core3DInteraction_panningSensitivitySlider",
            "type"        : "slider",
            "minValue"    : 0.0,
            "maxValue"    : 1.0,
            "step"        : 0.1,
            "initValue"   : this.panningSensitivity,
            "callback"    : this.panningSensitivitySliderToggled,
            "tooltipText" : "Specifies the camera's panning sensitivity", 
            "labelText"   : "Panning Sensitivity"
        },
        {
            "type" : "heading",
            "text" : "Measurements"
        },
        {
            "type" : "text",
            "text" : "Configure 3D measurement functionality."
        },
        {
            "id"          : "core3DInteraction_measurementToggle",
            "type"        : "toggle",
            "initValue"   : false,
            "callback"    : this.measurementsToggled,
            "tooltipText" : "Toggles 3D measurement tools.", 
            "labelText"   : "3D Measurement Tools"
        }
    ];

    //---------------------------------------------------------------------------------------------------------

    this.init = function()
    {
        var viewer  = turnerVECMain.viewerAPI;
        
        return true;
    }
    
    //---------------------------------------------------------------------------------------------------------
    
    this.getCustomCSS = function()
    {
        return "";
    }
    
    //---------------------------------------------------------------------------------------------------------
    
    this.getCustomJS = function()
    {
        var jsStr = "";
        
        jsStr += "setMinVerticalCameraAngle(" + that.minCameraAngleDeg + ");\n";
        jsStr += "setMaxVerticalCameraAngle(" + that.maxCameraAngleDeg + ");\n";
        
        jsStr += "setMinZoomFactor(" + that.minZoomFactor + ");\n";
        jsStr += "setMaxZoomFactor(" + that.maxZoomFactor + ");\n";
        
        jsStr += "setPanningSensitivity(" + that.panningSensitivity + ");\n";
        
        return jsStr;
    }
    
    //---------------------------------------------------------------------------------------------------------
    
};

turnerVECMain.plugins.core3DInteraction = new core3DInteraction();
