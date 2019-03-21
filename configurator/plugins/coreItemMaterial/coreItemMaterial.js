

var coreItemMaterial = function()
{
    //---------------------------------------------------------------------------------------------------------
    //                                  plugin description / tooltip
    //---------------------------------------------------------------------------------------------------------
    
    this.description = 
    {
        "title"   : "Material",
        "type"    : "ItemConfigPlugin",
        "tooltip" : "Configure item material"
    };
        
    //---------------------------------------------------------------------------------------------------------
    //                                        plugin variables
    //---------------------------------------------------------------------------------------------------------

    var that = this;
    
    this.metallicFactor  = 1.0;
    this.roughnessFactor = 1.0;
    
    //---------------------------------------------------------------------------------------------------------
    //                                    plugin UI element callbacks    
    //---------------------------------------------------------------------------------------------------------
    
    this.metallicSliderToggled = function(event)
    {
        that.metallicFactor = event.srcElement.value;
        
        var viewer = turnerVECMain.viewerAPI;        
        
        //TODO: add this function
        //viewer.setItemMetallicFactor(that.metallicFactor);
    };
    
    //---------------------------------------------------------------------------------------------------------
    
    this.roughnessSliderToggled = function(event)
    {
        that.roughnessFactor = event.srcElement.value;
        
        var viewer = turnerVECMain.viewerAPI;        
        
        //TODO: add this function
        viewer.setItemRoughnessFactor(that.roughnessFactor);
    };

    //---------------------------------------------------------------------------------------------------------
    //                                      plugin UI elements
    //---------------------------------------------------------------------------------------------------------

    this.uiElements =
    [    
        {
            "type"      : "heading",
            "text"      : "Material"
        },        
        {
            "type"      : "text",
            "text"      : "Configure material parameters of the virtual item."
        },
        {
            "id"          : "coreItemMaterial_metallicFactorSlider",
            "type"        : "slider",
            "minValue"    : 0.0,
            "maxValue"    : 1.0,
            "step"        : 0.1,
            "initValue"   : this.metallicFactor,
            "callback"    : this.metallicSliderToggled,
            "tooltipText" : "Specifies the metallic factor of the material", 
            "labelText"   : "Metallic"
        },
        {
            "id"          : "coreItemMaterial_roughnessFactorSlider",
            "type"        : "slider",
            "minValue"    : 0.0,
            "maxValue"    : 1.0,
            "step"        : 0.1,
            "initValue"   : this.roughnessFactor,
            "callback"    : this.roughnessSliderToggled,
            "tooltipText" : "Specifies the roughness factor of the material", 
            "labelText"   : "Roughness"
        }
    ];

    //---------------------------------------------------------------------------------------------------------
    
    this.init = function()
    {
        var viewer  = turnerVECMain.viewerAPI;
        
        //TODO: read metallic / roughness values of loaded object
        //      actually, this must be updated every time the user loads a new object
        //...
                
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

        return jsStr;
    }
    
    //---------------------------------------------------------------------------------------------------------
    
};

turnerVECMain.plugins.coreItemMaterial = new coreItemMaterial();
