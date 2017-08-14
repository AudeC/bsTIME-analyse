(function() {
	var app = angular.module('app', ['ui.router', 'navController', 'services', 'ngAnimate', 'ui.bootstrap'])

	// define for requirejs loaded modules
	define('app', [], function() { return app; });

	// function for dynamic load with requirejs of a javascript module for use with a view
	// in the state definition call add property `resolve: req('/views/ui.js')`
	// or `resolve: req(['/views/ui.js'])`
	// or `resolve: req('views/ui')`
	function req(deps) {
		if (typeof deps === 'string') deps = [deps];
		return {
			deps: function ($q, $rootScope) {
				var deferred = $q.defer();
				require(deps, function() {
					$rootScope.$apply(function () {
						deferred.resolve();
					});
					deferred.resolve();
				});
				return deferred.promise;
			}
		}
	}

	app.config(function($stateProvider, $urlRouterProvider, $controllerProvider){
		var origController = app.controller
		app.controller = function (name, constructor){
			$controllerProvider.register(name, constructor);
			return origController.apply(this, arguments);
		}

		var viewsPrefix = 'views/';

		// For any unmatched url, send to /
		$urlRouterProvider.otherwise("/")

		$stateProvider
			// you can set this to no template if you just want to use the html in the page
			.state('home', {
				url: "/",
				templateUrl: viewsPrefix + "home.html",
				data: {
					pageTitle: 'Accueil'
				}
			})
			.state('analyse', {
				url: "/analyse",
				templateUrl: viewsPrefix + "analyse.html",
                controller: "AnalyseController",
				data: {
					pageTitle: 'Analyse'
                    
				}
			}).state('analyse-detail', {
				url: "/analyse/{id:int}",
				templateUrl: viewsPrefix + "analyse-detail.html",
                controller: "TachesController",
				data: {
					pageTitle: 'Analyse en cours'
                    
				}
			}).state('compte', {
				url: "/compte",
				templateUrl: viewsPrefix + "compte.html",
                controller: "AccountController",
				data: {
					pageTitle: 'Mon compte'
				}
			}).state('contact', {
				url: "/contact",
				templateUrl: viewsPrefix + "contact.html",
				data: {
					pageTitle: 'Contact'
				}
			})
        

		
			
	})
	.directive('updateTitle', ['$rootScope', '$timeout',
		function($rootScope, $timeout) {
			return {
				link: function(scope, element) {
					var listener = function(event, toState) {
						var title = 'BS Time';
						if (toState.data && toState.data.pageTitle) title = toState.data.pageTitle + ' - ' + title;
						$timeout(function() {
							element.text(title);
						}, 0, false);
					};

					$rootScope.$on('$stateChangeSuccess', listener);
				}
			};
		}
	]);
}());