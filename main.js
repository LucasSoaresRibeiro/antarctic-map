require([
    "esri/WebScene",
    "esri/views/SceneView",
    "esri/layers/FeatureLayer",
    "esri/layers/CSVLayer",
    "esri/layers/SceneLayer",
    "esri/tasks/support/Query",
    "esri/widgets/Search",
    "esri/symbols/WebStyleSymbol",
    "esri/layers/support/LabelClass",
    "esri/symbols/callouts/LineCallout3D",
    "esri/layers/ElevationLayer",
    "esri/layers/BaseElevationLayer"
], function(WebScene, SceneView, FeatureLayer, CSVLayer, SceneLayer, Query, Search, WebStyleSymbol, LabelClass, LineCallout3D, ElevationLayer, BaseElevationLayer) {

    const ExaggeratedElevationLayer = BaseElevationLayer.createSubclass({

      properties: {
        exaggeration: 5
      },

      load: function () {
        this._elevation = new ElevationLayer({
          url: "//elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer"
        });

        this.addResolvingPromise(this._elevation.load());
      },

      fetchTile: function (level, row, col) {
        // calls fetchTile() on the elevationlayer for the tiles
        // visible in the view
        return this._elevation.fetchTile(level, row, col)
          .then(function (data) {

            var exaggeration = this.exaggeration;
            for (var i = 0; i < data.values.length; i++) {
              data.values[i] = data.values[i] * exaggeration;
            }

            return data;
          }.bind(this));
      }
    });

    // Create the web scene
    var map = new WebScene({
        ground: "world-elevation",
      //   basemap: "streets"
      // basemap: "topo"
      // basemap: "dark-gray"
      //   basemap: "satellite"
      //   basemap: "hybrid"
        basemap: "gray"
      //   basemap: "oceans"
      //   basemap: "national-geographic"
      //   basemap: "terrain"
      //   basemap: "osm"

    });

    map.when(function () {
      map.ground.layers = [
        new ExaggeratedElevationLayer()
      ]
    });

    // Create the view
    var view = new SceneView({
      container: "viewDiv",
      map: map,
      camera: {
        position: {
          latitude: -84,
          longitude: 2.4609375,
          z: 10000000
        },
        // tilt: 78
      },
      environment: {
        lighting: {
          date: new Date("January 01, 2015 00:00:00 EDT"),
          directShadowsEnabled: false,
          ambientOcclusionEnabled: false
        }
      },
      popup: {
        dockEnabled: true,
        dockOptions: {
          buttonEnabled: true,
          breakpoint: false
        }
      },
      alphaCompositingEnabled: true,
      qualityProfile: "high"
    });

    // Search widget
    var searchWidget = new Search({
      view: view
    });

    view.ui.add(searchWidget, {
      position: "top-right"
    });

    // CSV
    var url = "antartica.csv";

    // var currentSymbol = {
    //   type: "point-3d",  // autocasts as new PointSymbol3D()
    //   symbolLayers: [{
    //     type: "icon",  // autocasts as new IconSymbol3DLayer()
    //     resource: {
    //       href: "CityHall.svg"
    //     },
    //     size: 20
    //   }],
    //   verticalOffset: {
    //     screenLength: 40,
    //     maxWorldLength: 100,
    //     minWorldLength: 20
    //   },
    //   callout: {
    //     type: "line", // autocasts as new LineCallout3D()
    //     size: 1.5,
    //     color: "white",
    //     border: {
    //       color: "black"
    //     }
    //   }
    // };

    // var csvLayer = new CSVLayer({
    //   url: url,
    //   renderer: {
    //     type: "simple", 
    //     symbol: currentSymbol
    //   }
    // });



    var csvLayer = new CSVLayer({
      url: url,
      elevationInfo: {
        mode: "relative-to-ground"
      },
      // spatialReference: {
      //   wkid: 5936
      // },
      returnZ: false,
      // title: "Peaks higher than 3000m",
      renderer: {
        type: "simple",
        symbol: {
          type: "point-3d",
          symbolLayers: [{
            type: "icon",
            size: 8,
            resource: { primitive: "circle" },
            material: { color: "#4c397f" },
            outline: {
              size: 1,
              color: "white"
            }
          }],
          verticalOffset: {
            screenLength: 20
          },
          callout: {
            type: "line", // autocasts as new LineCallout3D()
            size: 1.5,
            color: "#4c397f"
          }
        }
      },
      outFields: ["*"],
      // Add labels with callouts of type line to the icons
      labelingInfo: [
        {
          // When using callouts on labels, "above-center" is the only allowed position
          labelPlacement: "above-center",
          labelExpressionInfo: {
            value: "{Stationname} - {Country}"
          },
          symbol: {
            type: "label-3d", // autocasts as new LabelSymbol3D()
            symbolLayers: [
              {
                type: "text", // autocasts as new TextSymbol3DLayer()
                material: {
                  color: "black"
                },
                halo: {
                  color: [255, 255, 255, 0.7],
                  size: 2
                },
                size: 10
              }
            ],
            // Labels need a small vertical offset that will be used by the callout
            verticalOffset: {
              screenLength: 150,
              maxWorldLength: 2000,
              minWorldLength: 30
            },
            // The callout has to have a defined type (currently only line is possible)
            // The size, the color and the border color can be customized
            callout: {
              type: "line", // autocasts as new LineCallout3D()
              size: 0.5,
              color: [0, 0, 0],
              border: {
                color: [255, 255, 255, 0.7]
              }
            }
          }
        }
      ]
    });

    map.add(csvLayer);  // adds the layer to the map

    // map.addMany([
    //   streetFurnitureLayer,
    //   vegetationLayer,
    //   transportationLayer,
    //   fountainLayer,
    //   antennaLayer
    // ]);

    // view.watch('camera', function(newValue, oldValue, property, object) {
    //   console.log(property , newValue, object);
    // });

});