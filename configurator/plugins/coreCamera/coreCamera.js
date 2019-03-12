

var coreCamera = function()
{
    //---------------------------------------------------------------------------------------------------------
    //                                  plugin description / tooltip
    //---------------------------------------------------------------------------------------------------------
    
    this.description = 
    {
        "title"   : "Camera",
        "tooltip" : "Configure virtual camera"
    };
        
    //---------------------------------------------------------------------------------------------------------
    //                                        plugin variables
    //---------------------------------------------------------------------------------------------------------
        
    this.initialContrast = 1.0;
    this.initialExposure = 1.0;    
    this.initialBloom    = 0.2;
    
    //---------------------------------------------------------------------------------------------------------
    //                                    plugin UI element callbacks    
    //---------------------------------------------------------------------------------------------------------
    
    this.contrastSliderToggled = function(event)
    {
        var viewer = turnerVECMain.viewerAPI;        
        viewer.setContrast(this.value);
    };
    
    //---------------------------------------------------------------------------------------------------------
    
    this.exposureSliderToggled = function(event)
    {
        var viewer = turnerVECMain.viewerAPI;
        viewer.setExposure(this.value);
    };
    
    //---------------------------------------------------------------------------------------------------------
    
    this.bloomSliderToggled = function(event)
    {
        var viewer = turnerVECMain.viewerAPI;
        viewer.setBloom(this.value);
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
            "initValue"   : this.initialContrast,
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
            "initValue"   : this.initialExposure,            
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
            "initValue"   : this.initialBloom,
            "callback"    : this.bloomSliderToggled,
            "tooltipText" : "Specifies the amount of HDR bloom (around regions of high exposure)", 
            "labelText"   : "HDR Bloom"
        }
    ];

    //---------------------------------------------------------------------------------------------------------
    
    this.init = function()
    {
        var viewer  = turnerVECMain.viewerAPI;
        
        viewer.setContrast(this.initialContrast);
        viewer.setExposure(this.initialExposure);
        
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
        return "";
    }
    
    //---------------------------------------------------------------------------------------------------------
    
};

turnerVECMain.plugins.coreCamera = new coreCamera();
