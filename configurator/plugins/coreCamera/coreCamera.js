

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
    //                                    plugin UI element callbacks
    //---------------------------------------------------------------------------------------------------------
    
    this.fovSliderToggled = function(event)
    {
        console.log("Test - Value: " + this.value);
    };   
    
    //---------------------------------------------------------------------------------------------------------
    
    this.contrastSliderToggled = function(event)
    {
        
    };
    
    //---------------------------------------------------------------------------------------------------------
    
    this.brightnessSliderToggled = function(event)
    {
        
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
            "text"      : "Configure parameters of the virtual camera, such as field of view or focus."
        },
        {
            "id"          : "coreCamera_fovSlider",
            "type"        : "slider",
            "minValue"    : 20.0,
            "maxValue"    : 90.0,
            "initValue"   : 45.0,
            "callback"    : this.fovSliderToggled,
            "tooltipText" : "Specifies the camera's field of view", 
            "labelText"   : "Field of View (Degrees)"
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
            "minValue"    : 0.0,
            "maxValue"    : 10.0,
            "initValue"   : 1.0,
            "callback"    : this.contrastSliderToggled,
            "tooltipText" : "Specifies the image contrast", 
            "labelText"   : "Contrast"
        },
        {
            "id"          : "coreCamera_brightnessSlider",
            "type"        : "slider",
            "minValue"    : 0.0,
            "maxValue"    : 10.0,
            "initValue"   : 1.0,            
            "callback"    : this.brightnessSliderToggled,
            "tooltipText" : "Specifies the image brightness", 
            "labelText"   : "Brightness"
        }
    ];

    //---------------------------------------------------------------------------------------------------------
    
    this.init = function()
    {
        var viewer  = turnerVECMain.viewerAPI;
        
        return true;
    }
};

turnerVECMain.plugins.coreCamera = new coreCamera();
