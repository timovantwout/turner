

var core3DScene = function()
{
    //---------------------------------------------------------------------------------------------------------
    //                                  plugin description / tooltip
    //---------------------------------------------------------------------------------------------------------
    
    this.description = 
    {
        "title"   : "3D Scene",
        "type"    : "ViewerConfigPlugin",
        "tooltip" : "Configure 3D scene setup"
    };
    
    //---------------------------------------------------------------------------------------------------------
    //                                        plugin variables
    //---------------------------------------------------------------------------------------------------------
    
    var that = this;
    
    this.environments = [
                           {
                             "name"        : "autoshop",
                             "url"         : "environments/autoshop/autoshop.png",
                             "displayName" : "Autoshop"
                           },
                           {
                            "name"        : "royal_esplanade",
                            "url"         : "environments/royal_esplanade/royal_esplanade.png",
                            "displayName" : "Royal Esplanade"
                           },
                           {
                             "name"        : "cape_hill",
                             "url"         : "environments/cape_hill/cape_hill.png",
                             "displayName" : "Cape Hill"
                           },
                                                      {
                             "name"        : "blue_grotto",
                             "url"         : "environments/blue_grotto/blue_grotto.png",
                             "displayName" : "Blue Grotto"
                           },
                                                                                 {
                             "name"        : "mossy_forest",
                             "url"         : "environments/mossy_forest/mossy_forest.png",
                             "displayName" : "Mossy Forest"
                           },
                                                                                                            {
                             "name"        : "venice_sunset",
                             "url"         : "environments/venice_sunset/venice_sunset.png",
                             "displayName" : "Venice Sunset"
                           }
                        ];
                        
    this.currentEnvironment = "autoshop";
    this.skyboxSharpness    = 0.5;
    
    //---------------------------------------------------------------------------------------------------------
    //                                    plugin UI element callbacks
    //---------------------------------------------------------------------------------------------------------
    
    this.skyboxChanged = function(selectedName)
    {
        var viewer = turnerVECMain.viewerAPI;
        viewer.setEnvironmentMap("../configurator/environments/" + selectedName + "/" + selectedName + ".dds");
    };
      
    //---------------------------------------------------------------------------------------------------------
    
    this.skyboxSharpnessSliderToggled = function(event)
    {
        that.skyboxSharpness = event.srcElement.value;
        
        var viewer = turnerVECMain.viewerAPI;
        viewer.setSkyboxSharpness(that.skyboxSharpness);
    };

    //---------------------------------------------------------------------------------------------------------

    this.shadowSliderToggled = function(event)
    {
        var shadowValue = event.srcElement.value;

        var viewer = turnerVECMain.viewerAPI;
        viewer.toggleShadow(shadowValue);
    }
    
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
            "text"      : "Configure the 360° lighting environment and, if visible, the appearance of the skybox."
        },
        {
            "type"             : "image-selector",
            "id"               : "core3DScene_envmapSelector",
            "content"          : this.environments,
            "initialSelection" : this.currentEnvironment,
            "callback"         : this.skyboxChanged,
            "tooltipText"      : "Selects a 360° lighting environment", 
            "labelText"        : "Environment"
        },
        {
            "id"          : "core3DScene_skyboxSharpnessSlider",
            "type"        : "slider",
            "minValue"    : 0.0,
            "maxValue"    : 1.0,
            "step"        : 0.1,
            "initValue"   : this.skyboxSharpness,
            "callback"    : this.skyboxSharpnessSliderToggled,
            "tooltipText" : "Specifies the sharpness of the visualized 3D skybox", 
            "labelText"   : "Skybox Sharpness"
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
        },
        {
            "id"            : "core3DScene_shadowSlider",
            "type"          : "slider",
            "minValue"      : 0,
            "maxValue"      : 10,
            "step"          : 0.1,
            "initValue"     : 0,
            "callback"      : this.shadowSliderToggled,
            "tooltipText"   : "Sets the Shadow under the model",
            "labelText"     : "Model Shadow"
        }   
    ];
        
    //---------------------------------------------------------------------------------------------------------
    
    this.init = function()
    {
        var viewer = turnerVECMain.viewerAPI;
        
        var eName;
        var i = 0;
        for (; i < this.environments.length; ++i)
        {
            eName = this.environments[i].name;
            if (eName == this.currentEnvironment)
            {
                viewer.setEnvironmentMap("../configurator/environments/" + eName + "/" + eName + ".dds");                
                break;
            }
        }
        
        viewer.setSkyboxSharpness(that.skyboxSharpness);
        
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

        jsStr += "setSkyboxSharpness(" + that.skyboxSharpness + ");\n";

        return jsStr;
    }
    
    //---------------------------------------------------------------------------------------------------------
    
};

turnerVECMain.plugins.core3DScene = new core3DScene();
