

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
            "type"      : "spacing"
        },        
        {
            "type"      : "heading",
            "text"      : "Post-Processing"
        },        
        {
            "type"      : "text",
            "text"      : "Configure post-processing effects on the rendered image."
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
