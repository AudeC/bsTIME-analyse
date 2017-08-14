angular.module('navController', [])

.controller("ApplicationController", function($scope, $state, $http, UserManager){
      $scope.user = UserManager.usr; 
    function connect(){
        
        if(UserManager.SID != ""){
                UserManager.getSession().then(function successCallback(response) {
           
                    var resp = response.data; 
                    console.log(response);
                    if(resp != "empty"){
                        // on a réussi à récupérer un utilisateur 
                        UserManager.usr.init(resp);
                        // on récup ses stats
                        UserManager.getStats().then(function successCallback(response){
                            UserManager.usr.setStats(response.data);
                        }, function errorCallback(response){
                            return false;
                        });
                    }


                  }, function errorCallback(response) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                    return false; 
                  });
            
        } else {
            UserManager.getSID().then(function successCallback(response) {
                UserManager.SID = response.data; 
                console.log(response.data);
                localStorage.setItem("sid", response.data); 
            });

        }
    }
    
    $scope.logout = function(){
        UserManager.logout(); 
        document.location.href = 'index.html';
    }
    
    connect(); 

    
    $scope.login = function(usr){
        UserManager.login(usr.pseudo, usr.mdp).then(function successCallback(response) {
            var resp = response.data; 
            console.log(response);
            connect(); 
             $scope.testid = UserManager.usr.id; 
          }, function errorCallback(response) {
            return false; 
          });
    }
    
})

.controller("AnalyseController", function($scope, UserManager, $state){
    
    $scope.jours; 
    $scope.jokers=0;
    
    $scope.annuler = function(id){
        UserManager.cancelDay(); 
        remplirJours(); 
    }
    
    function remplirJours(){
        UserManager.getAllDays().then(function(response){
            console.log(response.data);
           $scope.jours = response.data;  
            //$state.reload();
            $scope.jokers = 3;
            for(var i=0; i<$scope.jours.length; i++){
             $scope.jours[i].journeescf_date = Date.parse($scope.jours[i].journeescf_date); 
             if($scope.jours[i].journeescf_etat == 8) $scope.jokers--; 
            }
        });
        
    }
    
    remplirJours();
    
   
    
}).controller("TachesController", function($scope, UserManager, $stateParams){
    
    $scope.j = {};
    $scope.taches = [];
    $scope.rep = []; 
    function modalInter(){
            this.id = 0;
            this.ouvert = 0;
            this.debut = {
                h:0, min: 0
            };
            this.fin= {
                h:0, min: 0
            };
    
    this.open = function(id, debut, fin){
                console.log(debut, fin);
                var d = new Date(debut);
                var f = new Date(fin);
                this.debut.tmp = d;
                this.debut.h = d.getHours();
                this.debut.min = d.getMinutes();
                this.fin.tmp = f; 
                this.fin.h = f.getHours();
                this.fin.min = f.getMinutes();
                this.ouvert = 1;
                this.id = id; 
            };
    this.save = function(){
                this.debut.tmp.setHours(this.debut.h);
                this.debut.tmp.setMinutes(this.debut.min);
                this.fin.tmp.setHours(this.fin.h);
                this.fin.tmp.setMinutes(this.fin.min);
                var index = $scope.taskById($scope.modalInter.id);
                $scope.taches[index].tachescf_debut = this.debut.tmp;
                $scope.taches[index].tachescf_fin = this.fin.tmp;
                this.ouvert = 0;
            }
    }
    
    $scope.modalInter = new modalInter(); 
    
   // fonction outil
  $scope.range = function(min, max, step) {
    step = step || 1;
    var input = [];
    for (var i = min; i <= max; i += step) input.push(i);
    return input;
  };
    
    UserManager.getDaysBy("id", $stateParams.id).then(function(response){
        response.data[0].journeescf_date = Date.parse(response.data[0].journeescf_date); 
        $scope.j = response.data[0];
        
    });
    
    $scope.journee_ok = 0; 
    
    function checkJournee(){
        //if($scope.journee_ok == 0){
            var jok = 1, i;
            $scope.taches.forEach(function(i, index, array) {
                if(i.tachescf_label == "tache" && i.tachescf_reponses_validees == '0') jok = 0;
            });
            $scope.journee_ok = jok;
        //}
    }
    

    
    UserManager.getAllTasks($stateParams.id).then(function(response){
        $scope.taches = response.data;
        console.log($scope.taches); 
         for(var i=0; i<$scope.taches.length; i++){
             // Pour chaque tâche, on met au bon format date 
             $scope.taches[i].tachescf_debut = Date.parse($scope.taches[i].tachescf_debut); 
             $scope.taches[i].tachescf_fin = Date.parse($scope.taches[i].tachescf_fin); 
             // Puis on regarde si y'a déjà des réponses
             if($scope.taches[i].tachescf_reponses_validees == 1){
                 $scope.rep[$scope.taches[i].tachescf_id] = {
                    '0': parseInt($scope.taches[i].tachescf_q1), 
                    '1': parseInt($scope.taches[i].tachescf_q2), 
                    '2': parseInt($scope.taches[i].tachescf_q3), 
                    '3': parseInt($scope.taches[i].tachescf_q4), 
                    '4': parseInt($scope.taches[i].tachescf_q5)  
             
                };
             }
             checkJournee();
         }
        console.log($scope.rep);
        
    });
    
    $scope.questions = [{
        titre: "Cette tâche devait être réalisée au plus tard..",
        rep: [0, "Immédiatement", "Dans l'heure", "Dans la journée", "Sous quelques jours", "Peu urgence"]
        }, 
        {
        titre: "Si cette tâche n'avait pas été faite..",
        rep: [0, "L'entreprise aurait coulé", "L'entreprise aurait beaucoup souffert", "Cela aurait été gênant mais surmontable", "Cela aurait été désagréable", "Peu de conséquences"]
        },
        {
        titre: "Concernant le plaisir général (tâche et personnel)",
        rep: [0, "J'adore", "J'aime bien", "Normal", "Ça me dérange un peu", "Je n'aime pas"]
        },
        {
        titre: "Cette tâche...",
        rep: [0, "Fait partie de mon travail", "Permet d'éviter un problème", "Est la gestion d'une problème", "Aide un collègue", "Est une vision à long terme"]
        },
        {
        titre: "Dans l'idéal, l'avenir de cette tâche...",
        rep: [0, "Moi seul(e) doit la faire", "Est à déléguer de temps en temps", "Est à déléguer", "Il faut la réduire", "Il faut la supprimer", "Il faut que l'on se forme (interne)", "Il faudrait trouver un sous-traitant (externe)"]
        }];
    
  

    $scope.taskById = function(id){
        var res = -1;
        $scope.taches.forEach(function(element, index, array) {
            if(element.tachescf_id == id){
                res = index;
            }
        });
        return res; 
        
    }
    
    $scope.check = function(tache, rep){
       
        console.log(rep);
       
        var array = $.map(rep[tache.tachescf_id], function(value, index) {
            return [value];
        });
         console.log(array);
        
        
        // Ici on regarde qu'une tâche ou interruption a bien été complétée
        if( (tache.tachescf_label == "tache" && array.length == 5) || (tache.tachescf_label == "interruption" && array.length >= 3) ){
            // Il va falloir envoyer les réponses
            console.log("Valide !");
            
            var t = {
                tachescf_id: tache.tachescf_id,
                tachescf_label: tache.tachescf_label
            }
            for(var i =0; i<array.length; i++){
                t["tachescf_q"+(i+1)] = array[i];
            }
            
            UserManager.updateTask(t).then(function(resp){
                console.log(resp);
                console.log($scope.taches);
                $scope.taches[$scope.taskById(tache.tachescf_id)]["tachescf_reponses_validees"] = 1;
                
                checkJournee();
                
                
            });
            
        } else console.log("Invalide");
        
    }
    
    $scope.confirmDay = function(tid) { 
        UserManager.confirmDay(tid);
    }
    
    
}).controller("AccountController", function($scope, UserManager){
    
    /*
        Badges
    */
    function Badge(n, i, ch){
        this.nom = n;
        this.img = i+".png";
        this.check = function(stats){
            this.is_unlocked = ch(stats); 
            return this.is_unlocked;
        };
        
    }
    
     $scope.countBadges = function(cat){
        var nb = 0; 
        for(var i = 0; i < $scope.badges[cat].length; i++){
                if($scope.badges[cat][i].is_unlocked) nb++;
            }
        return nb;
    }
    $scope.countBadgesTotal = function(){
        var nb = 0;
        for(cat in $scope.badges){
            for(var i = 0; i < $scope.badges[cat].length; i++){
                if($scope.badges[cat][i].is_unlocked) nb++;
            }
        }
        console.log("Nb="+nb);
        return nb; 
    }
 
    
    $scope.badges = {
        gestionnaire:[
            new Badge("<b>Sans filet</b><br />Effectuer une journée de mesure (hors Démo)", "badge-1-1", function(stats){
                console.log(stats); if(stats.days_total >= 1) return true; }),
            new Badge("<b>C’est parti</b><br />Effectuer deux journées de mesures (hors Démo)", "badge-1-2", 
               function(stats){ if(stats.days_total >= 2) return true; }
            ),
            new Badge("<b>Double paire</b><br />Effectuer quatre journées de mesures (hors Démo)", "badge-1-3", 
               function(stats){ if(stats.days_total >= 4) return true;  } ),
            new Badge("<b>A moitié plein</b><br />Valider cinq journées de mesures (hors Démo)", "badge-1-4", 
              function(stats){ if(stats.days_total >= 5) return true; }),
        ],
        general:[
            new Badge("Toujours vrai", "badge-1-2", function(stats){  return true; }),
            new Badge("Curieux", "badge-1-1", function(stats){ 
                for(nom in $scope.badges){
                    if(nom != "general" && $scope.countBadges(nom) < 1) return false; 
                }
                return true; 
                 }),
            new Badge("Touche à tout", "badge-1-3", function(stats){  
                for(nom in $scope.badges){
                    if(nom != "general" && $scope.countBadges(nom) < 2) return false; 
                }
                return true; 
            
            }),
            new Badge("Mi-distance", "badge-1-2", function(stats){  
                if($scope.badges.gestionnaire[3].is_unlocked)
                    return true; 
            }),
            new Badge("Spécialiste du temps", "badge-1-2", function(stats){  
                if($scope.countBadges("gestionnaire") == $scope.badges.gestionnaire.length) return true; 
                
            }),
            new Badge("Le tour de la question", "badge-1-2", function(stats){  
                 for(nom in $scope.badges){
                    if(nom != "general" && $scope.countBadges(nom) != $scope.badges[nom].length) return false; 
                }
                return true; 
            
            }),
                
            ]
    };
    $scope.catNames = {
        gestionnaire: "Gestionnaire du temps",
        general: "Général"
    }
    
    $scope.checkBadges = function(){
         for(cat in $scope.badges){
            for(var i = 0; i < $scope.badges[cat].length; i++){
                $scope.badges[cat][i].check(UserManager.usr.stats);
            }
        }
    }
    $scope.badgesloaded = false; ;
    UserManager.getStats().then(function successCallback(response){
                            UserManager.usr.setStats(response.data);
                            $scope.checkBadges(); 
                            $scope.badges.general[1].check();
                            $scope.badgesloaded = true;
                        }, function errorCallback(response){
                            return false;
                        });
 

    $scope.updateUser = function(email, tel){
        
        UserManager.updateUser("cf_e-mail", email);
        UserManager.updateUser("cf_tel", tel);
        
        bootbox.alert({ 
          size: "small",
          title: "Compte",
          message: "Vos données ont été mises à jour avec succès !", 
          callback: function(){ /* your callback code */ }
        })
    }
    
    $scope.updatePassword = function(mdp){
        if(mdp.val == mdp.conf){
            UserManager.updateUser("cf_pw", mdp.val);
        } else return false;
    }
   
    
    
})
	.controller('nav', function($scope, $state) {
		$scope.title = 'BS Time';

		// returns true if the current router url matches the passed in url
		// so views can set 'active' on links easily
		$scope.isUrl = function(url) {
			if (url === '#') return false;
			return ('#' + $state.$current.url.source + '/').indexOf(url + '/') === 0;
		};

		$scope.pages = [
			{
				name: 'Accueil',
				url: '#/'
			},
			{
				name: 'Analyse',
				url: '#/analyse'
			},
            {
				name: 'Compte',
				url: '#/compte'
			},
			{
				name: 'Contact',
				url: '#/contact'
			}

		]
	});
