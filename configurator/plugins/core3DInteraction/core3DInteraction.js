

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
    //                                    plugin UI element callbacks
    //---------------------------------------------------------------------------------------------------------
    
   
        
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
        }
    ];
        
    //---------------------------------------------------------------------------------------------------------
    
    this.init = function()
    {
        var viewer  = turnerVECMain.viewerAPI;
        
        return true;
    }
};

turnerVECMain.plugins.core3DInteraction = new core3DInteraction();
