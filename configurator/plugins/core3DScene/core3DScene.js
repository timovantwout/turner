

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
    //                                        plugin variables
    //---------------------------------------------------------------------------------------------------------
    
    this.environments = [
                           {
                            "name"        : "hollywood",
                            "url"         : "environments/hollywood/hollywood.png",
                            "displayName" : "Hollywood"
                           },
                           {
                             "name"        : "studio_softboxes",
                             "url"         : "environments/studio_softboxes/studio_softboxes.png",
                             "displayName" : "Studio Softboxes"
                           },
                           {
                             "name"        : "runyon_canyon",
                             "url"         : "environments/runyon_canyon/runyon_canyon.png",
                             "displayName" : "Runyon Canyon"
                           }
                        ];
                        
    this.initialEnvironment     = "studio_softboxes";
    this.initialSkyboxSharpness = 0.5;
    
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
        var viewer = turnerVECMain.viewerAPI;
        viewer.setSkyboxSharpness(this.value);
    };
    
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
            "initialSelection" : this.initialEnvironment,
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
            "initValue"   : this.initialSkyboxSharpness,
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
            if (eName == this.initialEnvironment)
            {
                viewer.setEnvironmentMap("../configurator/environments/" + eName + "/" + eName + ".dds");                
                break;
            }
        }
        
        viewer.setSkyboxSharpness(this.initialSkyboxSharpness);
        
        return true;
    }
};

turnerVECMain.plugins.core3DScene = new core3DScene();
