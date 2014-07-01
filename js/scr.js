(function() {
	var hereApp = angular.module('here', []);

	
	hereApp.controller("RoutePlannerController", function($scope) {
		nokia.Settings.set("app_id", "32IgCUiOFTv3pWuVVFEt");
		nokia.Settings.set("app_code", "xz9hOEAl--zlQKdj3VQKRg");

		var routeCtrl = this;
		routeCtrl.waypoints = [];
		
		routeCtrl.addDestination = function(dest) {
			routeCtrl.waypoints.push(dest);
		};
		routeCtrl.removeDestination = function(dest) {
			routeCtrl.waypoints.splice(routeCtrl.waypoints.indexOf(dest), 1);
		};
		routeCtrl.clearRoute = function() {
			routeCtrl.waypoints = [];
		};
		routeCtrl.isFirst = function(dest) {
			return dest === routeCtrl.waypoints[0];
		};
		routeCtrl.isLast = function(dest) {
			return dest === routeCtrl.waypoints[routeCtrl.waypoints.length - 1];
		};
		routeCtrl.moveUp = function(dest) {
			var idx = routeCtrl.waypoints.indexOf(dest);
			var waypoint = routeCtrl.waypoints.splice(idx, 1)[0];
			routeCtrl.waypoints.splice(idx - 1, 0, waypoint);
		};
		routeCtrl.moveDown = function(dest) {
			var idx = routeCtrl.waypoints.indexOf(dest);
			var waypoint = routeCtrl.waypoints.splice(idx, 1)[0];
			routeCtrl.waypoints.splice(idx + 1, 0, waypoint);
		};
		routeCtrl.canDrawRoute = function() {
			return routeCtrl.waypoints.length > 1;
		}
	});
	
	hereApp.directive("search", function() {
		var searchController = function($scope) {
			var searchCtrl = this;
			searchCtrl.results = [];

			// Initialize search box:
			var searchBox = new nokia.places.widgets.SearchBox({
				targetNode : 'searchbox',
				searchCenter : function() {
					return {
						latitude : 52.516274,
						longitude : 13.377678
					};
				},
				onResults : function(data) {
					if (data.results) {
						searchCtrl.results = data.results.items;
					} else {
						searchCtrl.results = [];
					}
					$scope.$apply();
				}
			});
			
			searchCtrl.added = function(item) {
				searchCtrl.results.splice(searchCtrl.results.indexOf(item), 1);
			};
		};
		return {
			restrict : "E",
			templateUrl : "search.html",
			controller: searchController,
			controllerAs: "searchCtrl"
		};
	});
	
	hereApp.directive("waypoints", function() {
		return {
			restrict : "E",
			templateUrl : "waypoints.html"
		};
	});
	
	hereApp.directive("map", function() {
		var mapController = function($scope) {
			var mapCtrl = this;
			mapCtrl.map = new nokia.maps.map.Display(document.getElementById("mapContainer"), {
				zoomLevel : 13,
				center : [52.51, 13.4]
			});
			
			mapCtrl.router = new nokia.maps.routing.Manager();
			mapCtrl.waypoints = {};
			
			mapCtrl.modes = [{
	        	type: "shortest",
	        	transportModes: ["car"],
	        	options: "avoidTollroad",
	        	trafficMode: "default"
	        }];
			
			mapCtrl.drawRoute = function(waypoints) {
				if(waypoints.length > 1) {
					mapCtrl.waypoints = new nokia.maps.routing.WaypointParameterList();
					waypoints.forEach(function(waypoint) {
						mapCtrl.waypoints.addCoordinate(new nokia.maps.geo.Coordinate(waypoint.position.latitude, waypoint.position.longitude));
					});
					mapCtrl.map.objects.clear();
					// Calculate the route (and call onRouteCalculated afterwards)
					mapCtrl.router.calculateRoute(mapCtrl.waypoints, mapCtrl.modes);
				}
			};
			
			mapCtrl.clearRoute = function() {
				mapCtrl.waypoints = new nokia.maps.routing.WaypointParameterList();
				mapCtrl.map.objects.clear();
				mapCtrl.router.clear();
			};
			mapCtrl.hasRoute = function() {
				return mapCtrl.map.objects.getLength();
			};
			
			var onRouteCalculated = function (observedRouter, key, value) {
	        	if (value == "finished") {
	        		var routes = observedRouter.getRoutes();
	        
	        		// Create the default map representation of a route
	        		var mapRoute = new nokia.maps.routing.component.RouteResultSet(routes[0]).container;
	        		mapCtrl.map.objects.add(mapRoute);
	        
	        		// Zoom to the bounding box of the route
	        		mapCtrl.map.zoomTo(mapRoute.getBoundingBox(), false, "default");
	        		
	        		$scope.$apply();
	        	} else if (value == "failed") {
	        		alert("The routing request failed.");
	        	}
	        };
	        
	        // Add the observer function to the router's "state" property
	        mapCtrl.router.addObserver("state", onRouteCalculated);
		};
		return {
			restrict : "E",
			templateUrl : "map.html",
			controller: mapController,
			controllerAs: "mapCtrl"
		};
	});
})();