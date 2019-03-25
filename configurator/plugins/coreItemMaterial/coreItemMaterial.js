

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
    
    this.defaultMetallicFactor  = 0.2;
    this.defaultRoughnessFactor = 0.4;
        
    this.metallicFactor  = 1.0;
    this.roughnessFactor = 1.0;
    
    //---------------------------------------------------------------------------------------------------------
    //                                    plugin UI element callbacks    
    //---------------------------------------------------------------------------------------------------------
    
    this.metallicSliderToggled = function(event)
    {
        that.metallicFactor = event.srcElement.value;
        
        var viewer = turnerVECMain.viewerAPI;        

        viewer.setItemMetallicFactor(parseFloat(that.metallicFactor));
    };
    
    //---------------------------------------------------------------------------------------------------------
    
    this.roughnessSliderToggled = function(event)
    {
        that.roughnessFactor = event.srcElement.value;
        
        var viewer = turnerVECMain.viewerAPI;        

        viewer.setItemRoughnessFactor(parseFloat(that.roughnessFactor));
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

        viewer.addModelLoadedCallback(function()
        {
            // read metallic / roughness values of loaded object    
            var metallic  = viewer.getItemMetallicFactor();
            var roughness = viewer.getItemRoughnessFactor();
            
            var metallicSliderElem  = document.getElementById("coreItemMaterial_metallicFactorSlider");
            var roughnessSliderElem = document.getElementById("coreItemMaterial_roughnessFactorSlider");
            
            metallicSliderElem.value  = (metallic  == -1.0 ? defaultMetallicFactor  : metallic);
            roughnessSliderElem.value = (roughness == -1.0 ? defaultRoughnessFactor : roughness);
            
            turnerVECMain.triggerOnInputEvent("coreItemMaterial_metallicFactorSlider");
            turnerVECMain.triggerOnInputEvent("coreItemMaterial_roughnessFactorSlider");
        });

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
