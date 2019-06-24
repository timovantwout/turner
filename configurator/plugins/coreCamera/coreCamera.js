

var coreCamera = function()
{
    //---------------------------------------------------------------------------------------------------------
    //                                  plugin description / tooltip
    //---------------------------------------------------------------------------------------------------------
    
    this.description = 
    {
        "title"   : "Camera",
        "type"    : "ViewerConfigPlugin",
        "tooltip" : "Configure virtual camera"
    };
        
    //---------------------------------------------------------------------------------------------------------
    //                                        plugin variables
    //---------------------------------------------------------------------------------------------------------

    var that = this;
    
    this.cameraContrast = 1.0;
    this.cameraExposure = 1.0;    
    this.cameraBloom    = 0.0;
    
    //---------------------------------------------------------------------------------------------------------
    //                                    plugin UI element callbacks    
    //---------------------------------------------------------------------------------------------------------
    
    this.contrastSliderToggled = function(event)
    {
        that.cameraContrast = event.srcElement.value;
        
        var viewer = turnerVECMain.viewerAPI;        
        viewer.setContrast(that.cameraContrast);
    };
    
    //---------------------------------------------------------------------------------------------------------
    
    this.exposureSliderToggled = function(event)
    {
        that.cameraExposure = event.srcElement.value;
        
        var viewer = turnerVECMain.viewerAPI;
        viewer.setExposure(that.cameraExposure);
    };
    
    //---------------------------------------------------------------------------------------------------------
    
    this.bloomSliderToggled = function(event)
    {
        that.cameraBloom = event.srcElement.value;
        
        var viewer = turnerVECMain.viewerAPI;
        viewer.setBloom(that.cameraBloom);
    };

    //---------------------------------------------------------------------------------------------------------
    //                                      plugin UI elements
    //---------------------------------------------------------------------------------------------------------

    this.uiElements =
    [    
        {
            "type"      : "heading",
            "text"      : "Camera Settings"
        },        
        {
            "type"      : "text",
            "text"      : "Configure parameters of the virtual camera and image-space effects."
        },
        {
            "type"      : "spacing"
        },        
        {
            "type"      : "heading",
            "text"      : "Post-Processing"
        },        
        {
            "type"      : "text",
            "text"      : "Configure post-processing effects on the rendered image."
        },
        {
            "id"          : "coreCamera_contrastSlider",
            "type"        : "slider",
            "minValue"    : 0.5,
            "maxValue"    : 2.0,
            "step"        : 0.1,
            "initValue"   : this.cameraContrast,
            "callback"    : this.contrastSliderToggled,
            "tooltipText" : "Specifies the image contrast", 
            "labelText"   : "Contrast"
        },
        {
            "id"          : "coreCamera_exposureSlider",
            "type"        : "slider",
            "minValue"    : 0.5,
            "maxValue"    : 2.0,
            "step"        : 0.1,
            "initValue"   : this.cameraExposure,            
            "callback"    : this.exposureSliderToggled,
            "tooltipText" : "Specifies the exposure (affects HDR brightness & bloom)", 
            "labelText"   : "Exposure"
        },
        {
            "id"          : "coreCamera_bloomSlider",
            "type"        : "slider",
            "minValue"    : 0.0,
            "maxValue"    : 1.0,
            "step"        : 0.1,
            "initValue"   : this.cameraBloom,
            "callback"    : this.bloomSliderToggled,
            "tooltipText" : "Specifies the amount of HDR bloom (around regions of high exposure)", 
            "labelText"   : "HDR Bloom"
        }
    ];

    //---------------------------------------------------------------------------------------------------------
    
    this.init = function()
    {
        var viewer = turnerVECMain.viewerAPI;
        
        //TODO: there is something wrong *inside* the viewer,
        //      now that more async stuff is happening due to the URL parameters
        //      needs to be cleaned up inside the viewer, then we can re-activate this
        /*viewer.setContrast(this.cameraContrast);
        viewer.setExposure(this.cameraExposure);
        viewer.setBloom(this.cameraBloom);*/
        
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

        jsStr += "setContrast(" + that.cameraContrast + ");\n";
        jsStr += "setExposure(" + that.cameraExposure + ");\n";
        jsStr += "setBloom("    + that.cameraBloom    + ");\n";

        return jsStr;
    }
    
    //---------------------------------------------------------------------------------------------------------
    
};

turnerVECMain.plugins.coreCamera = new coreCamera();
