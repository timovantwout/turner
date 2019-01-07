

var core3DScene = function()
{
    //---------------------------------------------------------------------------------------------------------
    //                                  plugin description / tooltip
    //---------------------------------------------------------------------------------------------------------
    
    this.description = 
    {
        "title"   : "Camera",
        "tooltip" : "Configure 3D scene setup"
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
            "text"      : "Lighting Environment"
        },        
        {
            "type"      : "text",
            "text"      : "Configure the 360° lighting environment."
        },
        {
            "type" : "spacing"
        },
        {
            "type"      : "heading",
            "text"      : "Shadow Plane"
        },        
        {
            "type"      : "text",
            "text"      : "Choose if a shadow plane should be used, and how to display it."
        }
    ];
        
    //---------------------------------------------------------------------------------------------------------
    
    this.init = function()
    {
        var viewer  = turnerVECMain.viewerAPI;
        
        return true;
    }
};

turnerVECMain.plugins.core3DScene = new core3DScene();
