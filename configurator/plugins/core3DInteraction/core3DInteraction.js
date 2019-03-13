

var core3DInteraction = function()
{
    //---------------------------------------------------------------------------------------------------------
    //                                  plugin description / tooltip
    //---------------------------------------------------------------------------------------------------------
    
    this.description = 
    {
        "title"   : "Camera",
        "tooltip" : "Configure 3D interaction"
    };
    
    //---------------------------------------------------------------------------------------------------------
    //                                        plugin variables
    //---------------------------------------------------------------------------------------------------------
    
    var that = this;
    
    this.minCameraAngleDeg = -90.0;
    this.maxCameraAngleDeg =  90.0;    
    
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
    //                                      plugin UI elements
    //---------------------------------------------------------------------------------------------------------

    this.uiElements =
    [    
        {
            "type"      : "heading",
            "text"      : "Allowed 3D Interactions"
        },        
        {
            "type"      : "text",
            "text"      : "Configure which 3D interactions are possible, and how they are individually constrained."
        },
        {
            "type"      : "spacing"
        },        
        {
            "type"      : "text",
            "text"      : "Configure minimum and maximum vertical camera angles."
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
        
        return jsStr;
    }
    
    //---------------------------------------------------------------------------------------------------------
    
};

turnerVECMain.plugins.core3DInteraction = new core3DInteraction();
